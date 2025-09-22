import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Submit a new review
export const submitReview = asyncHandler(async (req, res) => {
    const { targetType, targetId, rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user has already reviewed this target
    const existingReview = await Review.findOne({
        userId,
        targetType,
        targetId,
        isActive: true
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this item");
    }

    // Create new review
    const review = await Review.create({
        userId,
        targetType,
        targetId,
        rating,
        comment
    });

    // Populate user details for response
    await review.populate('userId', 'name email');

    return res.status(201).json(
        new ApiResponse(201, review, "Review submitted successfully and is pending approval")
    );
});

// Get all reviews (admin only)
export const getAllReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, approved, targetType, targetId } = req.query;
    
    const filter = { isActive: true };
    
    if (approved !== undefined) {
        filter.approved = approved === 'true';
    }
    
    if (targetType) {
        filter.targetType = targetType;
    }
    
    if (targetId) {
        filter.targetId = targetId;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: 'userId', select: 'name email' },
            { path: 'approvedBy', select: 'name email' }
        ]
    };

    const reviews = await Review.paginate(filter, options);

    return res.status(200).json(
        new ApiResponse(200, reviews, "Reviews fetched successfully")
    );
});

// Get reviews for a specific target (product or service)
export const getTargetReviews = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10, approved = true } = req.query;

    const filter = {
        targetType,
        targetId,
        isActive: true,
        approved: approved === 'true'
    };

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: 'userId', select: 'name email' }
        ]
    };

    const reviews = await Review.paginate(filter, options);

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    const response = {
        reviews: reviews,
        averageRating: avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0,
        totalReviews: avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0
    };

    return res.status(200).json(
        new ApiResponse(200, response, "Target reviews fetched successfully")
    );
});

// Get user's own reviews
export const getUserReviews = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const filter = {
        userId,
        isActive: true
    };

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: 'targetId', select: 'name title' }
        ]
    };

    const reviews = await Review.paginate(filter, options);

    return res.status(200).json(
        new ApiResponse(200, reviews, "User reviews fetched successfully")
    );
});

// Approve a review (admin only)
export const approveReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const adminId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (review.approved) {
        throw new ApiError(400, "Review is already approved");
    }

    review.approved = true;
    review.approvedBy = adminId;
    review.approvedAt = new Date();

    await review.save();

    await review.populate([
        { path: 'userId', select: 'name email' },
        { path: 'approvedBy', select: 'name email' }
    ]);

    return res.status(200).json(
        new ApiResponse(200, review, "Review approved successfully")
    );
});

// Reject/Delete a review (admin only)
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    // Soft delete by setting isActive to false
    review.isActive = false;
    await review.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Review deleted successfully")
    );
});

// Update a review (user can only update their own review if not approved)
export const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    if (review.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own reviews");
    }

    if (review.approved) {
        throw new ApiError(400, "Cannot update approved review");
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    await review.populate('userId', 'name email');

    return res.status(200).json(
        new ApiResponse(200, review, "Review updated successfully")
    );
});

// Get review statistics (admin only)
export const getReviewStats = asyncHandler(async (req, res) => {
    const stats = await Review.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                approvedReviews: {
                    $sum: { $cond: ["$approved", 1, 0] }
                },
                pendingReviews: {
                    $sum: { $cond: ["$approved", 0, 1] }
                },
                averageRating: { $avg: "$rating" },
                ratingDistribution: {
                    $push: "$rating"
                }
            }
        },
        {
            $project: {
                totalReviews: 1,
                approvedReviews: 1,
                pendingReviews: 1,
                averageRating: { $round: ["$averageRating", 2] },
                ratingDistribution: {
                    $reduce: {
                        input: [1, 2, 3, 4, 5],
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                "$$value",
                                {
                                    $arrayToObject: [
                                        [{
                                            k: { $toString: "$$this" },
                                            v: {
                                                $size: {
                                                    $filter: {
                                                        input: "$ratingDistribution",
                                                        cond: { $eq: ["$$item", "$$this"] }
                                                    }
                                                }
                                            }
                                        }]
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ]);

    const result = stats.length > 0 ? stats[0] : {
        totalReviews: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    return res.status(200).json(
        new ApiResponse(200, result, "Review statistics fetched successfully")
    );
});
