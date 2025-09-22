import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxLength: [100, "Product name cannot exceed 100 characters"]
    },
    category: {
        type: String,
        required: [true, "Product category is required"],
        enum: ["hair_care", "skin_care", "nail_care", "makeup", "tools", "accessories", "other"],
        default: "other"
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
        max: [999999, "Price cannot exceed 999999"]
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock cannot be negative"],
        default: 0
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        maxLength: [1000, "Description cannot exceed 1000 characters"]
    },
    imageUrls: [{
        type: String,
        required: [true, "At least one image URL is required"],
        validate: {
            validator: function(urls) {
                return urls.length > 0;
            },
            message: "At least one image URL is required"
        }
    }],
    brand: {
        type: String,
        trim: true,
        maxLength: [50, "Brand name cannot exceed 50 characters"]
    },
    sku: {
        type: String,
        unique: true,
        sparse: true, // Allows null values but ensures uniqueness when present
        trim: true,
        maxLength: [50, "SKU cannot exceed 50 characters"]
    },
    weight: {
        value: {
            type: Number,
            min: [0, "Weight cannot be negative"]
        },
        unit: {
            type: String,
            enum: ["g", "kg", "ml", "l", "oz", "lb"],
            default: "g"
        }
    },
    dimensions: {
        length: {
            type: Number,
            min: [0, "Length cannot be negative"]
        },
        width: {
            type: Number,
            min: [0, "Width cannot be negative"]
        },
        height: {
            type: Number,
            min: [0, "Height cannot be negative"]
        },
        unit: {
            type: String,
            enum: ["cm", "m", "in", "ft"],
            default: "cm"
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: [30, "Tag cannot exceed 30 characters"]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"],
        default: 0
    },
    discountStartDate: {
        type: Date
    },
    discountEndDate: {
        type: Date
    },
    rating: {
        average: {
            type: Number,
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot be more than 5"],
            default: 0
        },
        count: {
            type: Number,
            min: [0, "Rating count cannot be negative"],
            default: 0
        }
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must be at most 5"]
        },
        comment: {
            type: String,
            trim: true,
            maxLength: [500, "Review comment cannot exceed 500 characters"]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    specifications: {
        type: Map,
        of: String
    },
    ingredients: [{
        type: String,
        trim: true,
        maxLength: [100, "Ingredient name cannot exceed 100 characters"]
    }],
    usageInstructions: {
        type: String,
        trim: true,
        maxLength: [1000, "Usage instructions cannot exceed 1000 characters"]
    },
    careInstructions: {
        type: String,
        trim: true,
        maxLength: [500, "Care instructions cannot exceed 500 characters"]
    },
    warranty: {
        period: {
            type: Number,
            min: [0, "Warranty period cannot be negative"]
        },
        unit: {
            type: String,
            enum: ["days", "weeks", "months", "years"],
            default: "months"
        },
        description: {
            type: String,
            trim: true,
            maxLength: [200, "Warranty description cannot exceed 200 characters"]
        }
    },
    supplier: {
        name: {
            type: String,
            trim: true,
            maxLength: [100, "Supplier name cannot exceed 100 characters"]
        },
        contact: {
            type: String,
            trim: true,
            maxLength: [100, "Supplier contact cannot exceed 100 characters"]
        }
    },
    reorderLevel: {
        type: Number,
        min: [0, "Reorder level cannot be negative"],
        default: 10
    },
    isLowStock: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (this.discount > 0 && this.isDiscountActive()) {
        return this.price - (this.price * this.discount / 100);
    }
    return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'out_of_stock';
    if (this.stock <= this.reorderLevel) return 'low_stock';
    return 'in_stock';
});

// Method to check if discount is active
productSchema.methods.isDiscountActive = function() {
    const now = new Date();
    if (!this.discountStartDate || !this.discountEndDate) return false;
    return now >= this.discountStartDate && now <= this.discountEndDate;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
    if (operation === 'subtract') {
        this.stock = Math.max(0, this.stock - quantity);
    } else if (operation === 'add') {
        this.stock += quantity;
    }
    
    // Update low stock status
    this.isLowStock = this.stock <= this.reorderLevel;
    
    return this.save();
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, comment = '') {
    // Check if user already reviewed
    const existingReview = this.reviews.find(review => review.userId.toString() === userId.toString());
    if (existingReview) {
        throw new Error('User has already reviewed this product');
    }
    
    this.reviews.push({ userId, rating, comment });
    
    // Update average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
    
    return this.save();
};

// Pre-save middleware to update low stock status
productSchema.pre('save', function(next) {
    this.isLowStock = this.stock <= this.reorderLevel;
    next();
});

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
    return this.find({ 
        stock: { $lte: this.reorderLevel },
        isActive: true 
    });
};

// Static method to search products
productSchema.statics.searchProducts = function(query, filters = {}) {
    const searchQuery = {
        $and: [
            { isActive: true },
            filters
        ]
    };
    
    if (query) {
        searchQuery.$and.push({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        });
    }
    
    return this.find(searchQuery);
};

export const Product = mongoose.model("Product", productSchema);
