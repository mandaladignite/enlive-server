import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    targetType: {
        type: String,
        enum: ["product", "service"],
        required: [true, "Target type is required"]
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Target ID is required"],
        // Dynamic reference based on targetType
        refPath: "targetType"
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
    },
    comment: {
        type: String,
        required: [true, "Comment is required"],
        trim: true,
        maxLength: [500, "Comment cannot exceed 500 characters"]
    },
    approved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ approved: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for average rating calculation
reviewSchema.virtual('target', {
    ref: function() {
        return this.targetType === 'product' ? 'Product' : 'Service';
    },
    localField: 'targetId',
    foreignField: '_id',
    justOne: true
});

// Add pagination plugin
reviewSchema.plugin(mongoosePaginate);

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate target exists
reviewSchema.pre('save', async function(next) {
    try {
        let targetModel;
        try {
            targetModel = this.targetType === 'product' ? 
                mongoose.model('Product') : mongoose.model('Service');
        } catch (modelError) {
            // If models don't exist, skip validation
            return next();
        }
        
        const target = await targetModel.findById(this.targetId);
        if (!target) {
            throw new Error(`${this.targetType} not found`);
        }
        next();
    } catch (error) {
        next(error);
    }
});

export const Review = mongoose.model("Review", reviewSchema);
