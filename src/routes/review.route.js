import express from "express";
import {
    submitReview,
    getAllReviews,
    getTargetReviews,
    getUserReviews,
    approveReview,
    deleteReview,
    updateReview,
    getReviewStats
} from "../controllers/review.controller.js";
import { verifyJWT, adminOnly, authenticatedUsers } from "../middleware/auth.middleware.js";
import { validate, validateReviewSubmission, validateReviewUpdate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Public routes
router.get("/target/:targetType/:targetId", getTargetReviews);

// Protected routes (require authentication)
router.use(verifyJWT);

// User routes
router.post("/submit", validateReviewSubmission, validate, submitReview);
router.get("/my-reviews", getUserReviews);
router.put("/:reviewId", validateReviewUpdate, validate, updateReview);

// Admin routes
router.get("/admin/all", adminOnly, getAllReviews);
router.get("/admin/stats", adminOnly, getReviewStats);
router.patch("/admin/:reviewId/approve", adminOnly, approveReview);
router.delete("/admin/:reviewId", adminOnly, deleteReview);

export default router;
