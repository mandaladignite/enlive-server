import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        required: [true, "Package ID is required"]
    },
    packageName: {
        type: String,
        required: [true, "Package name is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, "Description cannot exceed 500 characters"]
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    paymentId: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "cash", "card", "upi", "wallet"],
        default: "razorpay"
    },
    amountPaid: {
        type: Number,
        required: [true, "Amount paid is required"],
        min: [0, "Amount paid cannot be negative"]
    },
    discountApplied: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"]
    },
    remainingAppointments: {
        type: Number,
        default: null // null means unlimited
    },
    usedAppointments: {
        type: Number,
        default: 0,
        min: [0, "Used appointments cannot be negative"]
    },
    benefits: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        maxLength: [500, "Notes cannot exceed 500 characters"]
    },
    activatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    activatedAt: {
        type: Date,
        default: Date.now
    },
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxLength: [200, "Cancellation reason cannot exceed 200 characters"]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
membershipSchema.index({ userId: 1, isActive: 1 });
membershipSchema.index({ packageId: 1 });
membershipSchema.index({ startDate: 1, expiryDate: 1 });
membershipSchema.index({ paymentStatus: 1 });
membershipSchema.index({ expiryDate: 1, isActive: 1 });

// Virtual for membership duration in days
membershipSchema.virtual('durationInDays').get(function() {
    const diffTime = Math.abs(this.expiryDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
membershipSchema.virtual('daysRemaining').get(function() {
    if (!this.isActive) return 0;
    const now = new Date();
    const diffTime = this.expiryDate - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Virtual for membership status
membershipSchema.virtual('status').get(function() {
    if (!this.isActive) return 'cancelled';
    if (this.paymentStatus !== 'paid') return 'pending_payment';
    
    const now = new Date();
    if (now < this.startDate) return 'not_started';
    if (now > this.expiryDate) return 'expired';
    return 'active';
});

// Virtual for is expired
membershipSchema.virtual('isExpired').get(function() {
    return new Date() > this.expiryDate;
});

// Virtual for is expiring soon (within 7 days)
membershipSchema.virtual('isExpiringSoon').get(function() {
    if (!this.isActive) return false;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.expiryDate <= sevenDaysFromNow && this.expiryDate > now;
});

// Ensure virtual fields are serialized
membershipSchema.set('toJSON', { virtuals: true });
membershipSchema.set('toObject', { virtuals: true });

// Static method to get active memberships for a user
membershipSchema.statics.getActiveMemberships = function(userId) {
    return this.find({
        userId: userId,
        isActive: true,
        paymentStatus: 'paid',
        expiryDate: { $gt: new Date() }
    }).populate('packageId', 'name description benefits').sort({ startDate: -1 });
};

// Static method to get expired memberships for a user
membershipSchema.statics.getExpiredMemberships = function(userId) {
    return this.find({
        userId: userId,
        $or: [
            { isActive: false },
            { expiryDate: { $lte: new Date() } }
        ]
    }).populate('packageId', 'name description').sort({ expiryDate: -1 });
};

// Static method to get memberships by status
membershipSchema.statics.getMembershipsByStatus = function(status) {
    const now = new Date();
    let query = { isActive: true, paymentStatus: 'paid' };
    
    switch (status) {
        case 'active':
            query.startDate = { $lte: now };
            query.expiryDate = { $gt: now };
            break;
        case 'expired':
            query.expiryDate = { $lte: now };
            break;
        case 'not_started':
            query.startDate = { $gt: now };
            break;
        case 'expiring_soon':
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            query.startDate = { $lte: now };
            query.expiryDate = { $gt: now, $lte: sevenDaysFromNow };
            break;
    }
    
    return this.find(query).populate('userId', 'name email').populate('packageId', 'name').sort({ expiryDate: 1 });
};

// Static method to get membership statistics
membershipSchema.statics.getMembershipStats = function() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.aggregate([
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
                                    { $lte: ["$startDate", now] },
                                    { $gt: ["$expiryDate", now] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                expiredMemberships: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ["$isActive", false] },
                                    { $lte: ["$expiryDate", now] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                expiringSoon: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$isActive", true] },
                                    { $eq: ["$paymentStatus", "paid"] },
                                    { $lte: ["$startDate", now] },
                                    { $gt: ["$expiryDate", now] },
                                    { $lte: ["$expiryDate", sevenDaysFromNow] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                totalRevenue: { $sum: "$amountPaid" }
            }
        }
    ]);
};

// Instance method to check if membership is valid
membershipSchema.methods.isValid = function() {
    const now = new Date();
    return this.isActive && 
           this.paymentStatus === 'paid' && 
           now >= this.startDate && 
           now <= this.expiryDate;
};

// Instance method to extend membership
membershipSchema.methods.extend = function(additionalDays) {
    this.expiryDate = new Date(this.expiryDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    return this.save();
};

// Instance method to cancel membership
membershipSchema.methods.cancel = function(cancelledBy, reason) {
    this.isActive = false;
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
    this.cancellationReason = reason;
    return this.save();
};

// Instance method to use appointment
membershipSchema.methods.useAppointment = function() {
    if (this.remainingAppointments !== null) {
        if (this.remainingAppointments > 0) {
            this.remainingAppointments -= 1;
            this.usedAppointments += 1;
            return this.save();
        } else {
            throw new Error('No remaining appointments in this membership');
        }
    }
    // Unlimited appointments
    this.usedAppointments += 1;
    return this.save();
};

export const Membership = mongoose.model("Membership", membershipSchema);

