import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"]
    },
    productName: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    productImage: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Total price cannot be negative"]
    }
});

const shippingAddressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        maxLength: [200, "Street address cannot exceed 200 characters"]
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxLength: [50, "City cannot exceed 50 characters"]
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxLength: [50, "State cannot exceed 50 characters"]
    },
    zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
        maxLength: [10, "Zip code cannot exceed 10 characters"]
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        maxLength: [50, "Country cannot exceed 50 characters"],
        default: "India"
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        maxLength: [15, "Phone number cannot exceed 15 characters"]
    }
});

const paymentDetailsSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ["razorpay", "cod", "wallet", "card"],
        required: [true, "Payment method is required"]
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"],
        default: "pending"
    },
    razorpayOrderId: {
        type: String,
        trim: true
    },
    razorpayPaymentId: {
        type: String,
        trim: true
    },
    razorpaySignature: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, "Payment amount is required"],
        min: [0, "Payment amount cannot be negative"]
    },
    currency: {
        type: String,
        default: "INR",
        maxLength: [3, "Currency code cannot exceed 3 characters"]
    },
    transactionId: {
        type: String,
        trim: true
    },
    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },
    refundAmount: {
        type: Number,
        default: 0,
        min: [0, "Refund amount cannot be negative"]
    },
    refundReason: {
        type: String,
        trim: true,
        maxLength: [200, "Refund reason cannot exceed 200 characters"]
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: [true, "Order number is required"],
        unique: true,
        trim: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    items: [orderItemSchema],
    totalItems: {
        type: Number,
        required: [true, "Total items is required"],
        min: [1, "Total items must be at least 1"]
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal is required"],
        min: [0, "Subtotal cannot be negative"]
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"]
    },
    discountCode: {
        type: String,
        trim: true,
        maxLength: [20, "Discount code cannot exceed 20 characters"]
    },
    shippingCharges: {
        type: Number,
        default: 0,
        min: [0, "Shipping charges cannot be negative"]
    },
    tax: {
        type: Number,
        default: 0,
        min: [0, "Tax cannot be negative"]
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
        default: "pending"
    },
    shippingAddress: shippingAddressSchema,
    paymentDetails: paymentDetailsSchema,
    notes: {
        type: String,
        trim: true,
        maxLength: [500, "Notes cannot exceed 500 characters"]
    },
    trackingNumber: {
        type: String,
        trim: true,
        maxLength: [50, "Tracking number cannot exceed 50 characters"]
    },
    estimatedDelivery: {
        type: Date
    },
    deliveredAt: {
        type: Date
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
    },
    returnRequestedAt: {
        type: Date
    },
    returnReason: {
        type: String,
        trim: true,
        maxLength: [200, "Return reason cannot exceed 200 characters"]
    },
    returnStatus: {
        type: String,
        enum: ["none", "requested", "approved", "rejected", "completed"],
        default: "none"
    }
}, {
    timestamps: true
});

// Indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
// orderNumber index is already created by unique: true
orderSchema.index({ status: 1 });
orderSchema.index({ "paymentDetails.status": 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
    return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
    return ['pending', 'confirmed'].includes(this.status) && 
           this.paymentDetails.status !== 'completed';
});

// Virtual for can be returned
orderSchema.virtual('canBeReturned').get(function() {
    return this.status === 'delivered' && 
           this.orderAge <= 7 && // Within 7 days of delivery
           this.returnStatus === 'none';
});

// Method to generate order number
orderSchema.statics.generateOrderNumber = function() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp.slice(-8)}${random}`;
};

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus, updatedBy = null) {
    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': ['returned'],
        'cancelled': [],
        'returned': []
    };

    if (!validTransitions[this.status].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;

    // Set specific timestamps
    if (newStatus === 'delivered') {
        this.deliveredAt = new Date();
    } else if (newStatus === 'cancelled') {
        this.cancelledAt = new Date();
        this.cancelledBy = updatedBy;
    }

    return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(newStatus, paymentId = null, signature = null) {
    this.paymentDetails.status = newStatus;

    if (newStatus === 'completed') {
        this.paymentDetails.paidAt = new Date();
        if (paymentId) this.paymentDetails.razorpayPaymentId = paymentId;
        if (signature) this.paymentDetails.razorpaySignature = signature;
    }

    return this.save();
};

// Method to request return
orderSchema.methods.requestReturn = async function(reason) {
    if (!this.canBeReturned) {
        throw new Error('Order cannot be returned');
    }

    this.returnRequestedAt = new Date();
    this.returnReason = reason;
    this.returnStatus = 'requested';

    return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = async function(amount, reason) {
    if (this.paymentDetails.status !== 'completed') {
        throw new Error('Cannot refund unpaid order');
    }

    this.paymentDetails.refundAmount = amount;
    this.paymentDetails.refundReason = reason;
    this.paymentDetails.refundedAt = new Date();
    this.paymentDetails.status = 'refunded';

    return this.save();
};

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.orderNumber) {
        this.orderNumber = this.constructor.generateOrderNumber();
    }
    next();
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(userId = null, startDate = null, endDate = null) {
    const matchStage = {};
    
    if (userId) matchStage.userId = userId;
    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
                averageOrderValue: { $avg: "$totalAmount" },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                completedOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
                },
                cancelledOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                }
            }
        }
    ]);

    const statusStats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$totalAmount" }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return {
        overview: stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
        },
        statusBreakdown: statusStats
    };
};

export const Order = mongoose.model("Order", orderSchema);
