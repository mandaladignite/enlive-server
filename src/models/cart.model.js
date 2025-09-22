import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        max: [100, "Quantity cannot exceed 100"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        unique: true,
        index: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
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
    shippingAddress: {
        street: {
            type: String,
            trim: true,
            maxLength: [200, "Street address cannot exceed 200 characters"]
        },
        city: {
            type: String,
            trim: true,
            maxLength: [50, "City cannot exceed 50 characters"]
        },
        state: {
            type: String,
            trim: true,
            maxLength: [50, "State cannot exceed 50 characters"]
        },
        zipCode: {
            type: String,
            trim: true,
            maxLength: [10, "Zip code cannot exceed 10 characters"]
        },
        country: {
            type: String,
            trim: true,
            maxLength: [50, "Country cannot exceed 50 characters"],
            default: "India"
        },
        phone: {
            type: String,
            trim: true,
            maxLength: [15, "Phone number cannot exceed 15 characters"]
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
// userId index is already created by unique: true
cartSchema.index({ "items.productId": 1 });

// Virtual for final amount after discount
cartSchema.virtual('finalAmount').get(function() {
    return Math.max(0, this.totalAmount - this.discount);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, price) {
    // Check if product already exists in cart
    const existingItemIndex = this.items.findIndex(
        item => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        // Update existing item quantity
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].price = price; // Update price in case it changed
    } else {
        // Add new item
        this.items.push({
            productId,
            quantity,
            price
        });
    }

    // Recalculate totals
    this.calculateTotals();
    
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
    const itemIndex = this.items.findIndex(
        item => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.items.splice(itemIndex, 1);
    } else {
        this.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    this.calculateTotals();
    
    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
    this.items = this.items.filter(
        item => item.productId.toString() !== productId.toString()
    );

    // Recalculate totals
    this.calculateTotals();
    
    return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
    this.items = [];
    this.totalItems = 0;
    this.totalAmount = 0;
    this.discount = 0;
    this.discountCode = undefined;
    
    return this.save();
};

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Method to apply discount
cartSchema.methods.applyDiscount = async function(discountCode, discountAmount) {
    this.discountCode = discountCode;
    this.discount = Math.min(discountAmount, this.totalAmount);
    
    return this.save();
};

// Method to remove discount
cartSchema.methods.removeDiscount = async function() {
    this.discountCode = undefined;
    this.discount = 0;
    
    return this.save();
};

// Method to update shipping address
cartSchema.methods.updateShippingAddress = async function(address) {
    this.shippingAddress = { ...this.shippingAddress, ...address };
    
    return this.save();
};

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
    this.calculateTotals();
    next();
});

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
    let cart = await this.findOne({ userId, isActive: true });
    
    if (!cart) {
        cart = new this({ userId });
        await cart.save();
    }
    
    return cart;
};

// Static method to get cart with populated products
cartSchema.statics.getCartWithProducts = async function(userId) {
    const cart = await this.findOne({ userId, isActive: true })
        .populate({
            path: 'items.productId',
            select: 'name price imageUrls brand category stock isActive'
        });
    
    if (!cart) {
        return this.getOrCreateCart(userId);
    }
    
    // Filter out inactive products
    cart.items = cart.items.filter(item => 
        item.productId && item.productId.isActive
    );
    
    // Recalculate totals after filtering
    cart.calculateTotals();
    await cart.save();
    
    return cart;
};

export const Cart = mongoose.model("Cart", cartSchema);
