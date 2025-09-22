import { Membership } from "../models/membership.model.js";
import { Package } from "../models/package.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get user's active memberships
export const getUserActiveMemberships = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const memberships = await Membership.getActiveMemberships(userId);

    res.status(200).json(
        new ApiResponse(200, memberships, "Active memberships retrieved successfully")
    );
});

// Get user's all memberships (active and expired)
export const getUserAllMemberships = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId };
    
    if (status) {
        const now = new Date();
        switch (status) {
            case 'active':
                query.isActive = true;
                query.paymentStatus = 'paid';
                query.startDate = { $lte: now };
                query.expiryDate = { $gt: now };
                break;
            case 'expired':
                query.$or = [
                    { isActive: false },
                    { expiryDate: { $lte: now } }
                ];
                break;
            case 'pending_payment':
                query.paymentStatus = 'pending';
                break;
            case 'expiring_soon':
                const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                query.isActive = true;
                query.paymentStatus = 'paid';
                query.startDate = { $lte: now };
                query.expiryDate = { $gt: now, $lte: sevenDaysFromNow };
                break;
        }
    }

    const memberships = await Membership.find(query)
        .populate('packageId', 'name description benefits price')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Membership.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            memberships,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalMemberships: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Memberships retrieved successfully")
    );
});

// Get single membership
export const getMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const userId = req.user._id;

    const membership = await Membership.findOne({
        _id: membershipId,
        userId: userId
    }).populate('packageId', 'name description benefits price duration durationUnit');

    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    res.status(200).json(
        new ApiResponse(200, membership, "Membership retrieved successfully")
    );
});

// Purchase membership
export const purchaseMembership = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { packageId, paymentMethod = "razorpay", notes } = req.body;

    // Check if package exists and is active
    const packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
        throw new ApiError(404, "Package not found");
    }

    if (!packageDoc.isActive) {
        throw new ApiError(400, "Package is not available for purchase");
    }

    // Check if user already has an active membership for this package
    const existingMembership = await Membership.findOne({
        userId,
        packageId,
        isActive: true,
        paymentStatus: { $in: ['paid', 'pending'] }
    });

    if (existingMembership) {
        throw new ApiError(400, "You already have an active or pending membership for this package");
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    switch (packageDoc.durationUnit) {
        case 'days':
            expiryDate.setDate(expiryDate.getDate() + packageDoc.duration);
            break;
        case 'weeks':
            expiryDate.setDate(expiryDate.getDate() + (packageDoc.duration * 7));
            break;
        case 'months':
            expiryDate.setMonth(expiryDate.getMonth() + packageDoc.duration);
            break;
        case 'years':
            expiryDate.setFullYear(expiryDate.getFullYear() + packageDoc.duration);
            break;
    }

    // Calculate amount to pay
    const amountPaid = packageDoc.discountedPrice;
    const discountApplied = packageDoc.price - packageDoc.discountedPrice;

    // Create membership
    const membership = await Membership.create({
        userId,
        packageId,
        packageName: packageDoc.name,
        description: packageDoc.description,
        startDate,
        expiryDate,
        paymentMethod,
        amountPaid,
        discountApplied,
        remainingAppointments: packageDoc.maxAppointments,
        benefits: packageDoc.benefits,
        notes,
        activatedBy: userId
    });

    // Populate package details
    await membership.populate('packageId', 'name description benefits price duration durationUnit');

    res.status(201).json(
        new ApiResponse(201, membership, "Membership purchased successfully")
    );
});

// Update membership payment status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const { paymentStatus, paymentId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
        throw new ApiError(400, "Invalid payment status");
    }

    membership.paymentStatus = paymentStatus;
    if (paymentId) membership.paymentId = paymentId;

    await membership.save();

    res.status(200).json(
        new ApiResponse(200, membership, "Payment status updated successfully")
    );
});

// Cancel membership
export const cancelMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const membership = await Membership.findOne({
        _id: membershipId,
        userId: userId
    });

    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    if (!membership.isActive) {
        throw new ApiError(400, "Membership is already cancelled");
    }

    await membership.cancel(userId, reason);

    res.status(200).json(
        new ApiResponse(200, membership, "Membership cancelled successfully")
    );
});

// Extend membership
export const extendMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const userId = req.user._id;
    const { additionalDays } = req.body;

    if (!additionalDays || additionalDays <= 0) {
        throw new ApiError(400, "Additional days must be a positive number");
    }

    const membership = await Membership.findOne({
        _id: membershipId,
        userId: userId
    });

    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    if (!membership.isActive) {
        throw new ApiError(400, "Cannot extend cancelled membership");
    }

    await membership.extend(additionalDays);

    res.status(200).json(
        new ApiResponse(200, membership, "Membership extended successfully")
    );
});

// Use appointment (reduce remaining appointments)
export const useAppointment = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const userId = req.user._id;

    const membership = await Membership.findOne({
        _id: membershipId,
        userId: userId
    });

    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    if (!membership.isValid()) {
        throw new ApiError(400, "Membership is not valid or has expired");
    }

    try {
        await membership.useAppointment();
        res.status(200).json(
            new ApiResponse(200, membership, "Appointment used successfully")
        );
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

// Get membership statistics for user
export const getUserMembershipStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await Membership.aggregate([
        { $match: { userId: userId } },
        {
            $group: {
                _id: null,
                totalMemberships: { $sum: 1 },
                activeMemberships: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$isActive", true] },
                                    { $eq: ["$paymentStatus", "paid"] },
                                    { $gt: ["$expiryDate", new Date()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                totalSpent: { $sum: "$amountPaid" },
                totalAppointmentsUsed: { $sum: "$usedAppointments" },
                totalAppointmentsRemaining: {
                    $sum: {
                        $cond: [
                            { $ne: ["$remainingAppointments", null] },
                            "$remainingAppointments",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const recentMemberships = await Membership.find({ userId })
        .populate('packageId', 'name price')
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json(
        new ApiResponse(200, {
            overview: stats[0] || {
                totalMemberships: 0,
                activeMemberships: 0,
                totalSpent: 0,
                totalAppointmentsUsed: 0,
                totalAppointmentsRemaining: 0
            },
            recentMemberships
        }, "Membership statistics retrieved successfully")
    );
});

// Admin: Get all memberships
export const getAllMemberships = asyncHandler(async (req, res) => {
    const { 
        status, 
        userId, 
        packageId, 
        paymentStatus, 
        page = 1, 
        limit = 10 
    } = req.query;

    // Build filter object
    const filter = {};
    if (userId) filter.userId = userId;
    if (packageId) filter.packageId = packageId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Add status filter
    if (status) {
        const now = new Date();
        switch (status) {
            case 'active':
                filter.isActive = true;
                filter.paymentStatus = 'paid';
                filter.startDate = { $lte: now };
                filter.expiryDate = { $gt: now };
                break;
            case 'expired':
                filter.$or = [
                    { isActive: false },
                    { expiryDate: { $lte: now } }
                ];
                break;
            case 'expiring_soon':
                const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                filter.isActive = true;
                filter.paymentStatus = 'paid';
                filter.startDate = { $lte: now };
                filter.expiryDate = { $gt: now, $lte: sevenDaysFromNow };
                break;
        }
    }

    const memberships = await Membership.find(filter)
        .populate('userId', 'name email phone')
        .populate('packageId', 'name price duration durationUnit')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Membership.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, {
            memberships,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalMemberships: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Memberships retrieved successfully")
    );
});

// Admin: Get membership by ID
export const getMembershipById = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await Membership.findById(membershipId)
        .populate('userId', 'name email phone')
        .populate('packageId', 'name description price duration durationUnit benefits');

    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    res.status(200).json(
        new ApiResponse(200, membership, "Membership retrieved successfully")
    );
});

// Admin: Update membership
export const updateMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const updateData = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    // Validate payment status if being updated
    if (updateData.paymentStatus) {
        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(updateData.paymentStatus)) {
            throw new ApiError(400, "Invalid payment status");
        }
    }

    const updatedMembership = await Membership.findByIdAndUpdate(
        membershipId,
        updateData,
        { new: true, runValidators: true }
    ).populate('userId', 'name email').populate('packageId', 'name price');

    res.status(200).json(
        new ApiResponse(200, updatedMembership, "Membership updated successfully")
    );
});

// Admin: Cancel membership
export const adminCancelMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
        throw new ApiError(404, "Membership not found");
    }

    if (!membership.isActive) {
        throw new ApiError(400, "Membership is already cancelled");
    }

    await membership.cancel(adminId, reason);

    res.status(200).json(
        new ApiResponse(200, membership, "Membership cancelled by admin successfully")
    );
});

// Admin: Get membership statistics
export const getMembershipStats = asyncHandler(async (req, res) => {
    const stats = await Membership.getMembershipStats();

    const packageStats = await Membership.aggregate([
        {
            $lookup: {
                from: 'packages',
                localField: 'packageId',
                foreignField: '_id',
                as: 'package'
            }
        },
        { $unwind: '$package' },
        {
            $group: {
                _id: '$package.name',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$amountPaid' },
                averageAmount: { $avg: '$amountPaid' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    const monthlyStats = await Membership.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$amountPaid' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            overview: stats[0] || {
                totalMemberships: 0,
                activeMemberships: 0,
                expiredMemberships: 0,
                expiringSoon: 0,
                totalRevenue: 0
            },
            packageStats,
            monthlyStats
        }, "Membership statistics retrieved successfully")
    );
});

// Admin: Search memberships
export const searchMemberships = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
        throw new ApiError(400, "Search query must be at least 2 characters long");
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const memberships = await Membership.find({
        $or: [
            { packageName: searchRegex },
            { description: searchRegex },
            { paymentId: searchRegex }
        ]
    })
    .populate('userId', 'name email phone')
    .populate('packageId', 'name price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Membership.countDocuments({
        $or: [
            { packageName: searchRegex },
            { description: searchRegex },
            { paymentId: searchRegex }
        ]
    });

    res.status(200).json(
        new ApiResponse(200, {
            memberships,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalMemberships: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            searchQuery: q
        }, "Search results retrieved successfully")
    );
});

