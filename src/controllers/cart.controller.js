import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, cart, "Cart retrieved successfully")
    );
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found or inactive");
    }

    // Check stock availability
    if (product.stock < quantity) {
        throw new ApiError(400, `Only ${product.stock} items available in stock`);
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(userId);

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Item added to cart successfully")
    );
});

// Update item quantity in cart
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
        throw new ApiError(400, "Valid quantity is required");
    }

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Check if product exists in cart
    const cartItem = cart.items.find(
        item => item.productId.toString() === productId
    );
    if (!cartItem) {
        throw new ApiError(404, "Item not found in cart");
    }

    // Check stock availability if increasing quantity
    if (quantity > cartItem.quantity) {
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            throw new ApiError(404, "Product not found or inactive");
        }
        
        const additionalQuantity = quantity - cartItem.quantity;
        if (product.stock < additionalQuantity) {
            throw new ApiError(400, `Only ${product.stock} additional items available in stock`);
        }
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity);

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Cart item updated successfully")
    );
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Check if product exists in cart
    const cartItem = cart.items.find(
        item => item.productId.toString() === productId
    );
    if (!cartItem) {
        throw new ApiError(404, "Item not found in cart");
    }

    // Remove item from cart
    await cart.removeItem(productId);

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Item removed from cart successfully")
    );
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Clear cart
    await cart.clearCart();

    res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});

// Apply discount code
export const applyDiscount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { discountCode } = req.body;

    if (!discountCode) {
        throw new ApiError(400, "Discount code is required");
    }

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    // Mock discount validation - in real app, validate against database
    const discountAmount = validateDiscountCode(discountCode, cart.totalAmount);
    if (discountAmount === 0) {
        throw new ApiError(400, "Invalid or expired discount code");
    }

    // Apply discount
    await cart.applyDiscount(discountCode, discountAmount);

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Discount applied successfully")
    );
});

// Remove discount code
export const removeDiscount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Remove discount
    await cart.removeDiscount();

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Discount removed successfully")
    );
});

// Update shipping address
export const updateShippingAddress = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const address = req.body;

    // Validate required fields
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'phone'];
    for (const field of requiredFields) {
        if (!address[field]) {
            throw new ApiError(400, `${field} is required`);
        }
    }

    // Get cart
    const cart = await Cart.findOne({ userId, isActive: true });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Update shipping address
    await cart.updateShippingAddress(address);

    // Populate the updated cart
    const updatedCart = await Cart.getCartWithProducts(userId);

    res.status(200).json(
        new ApiResponse(200, updatedCart, "Shipping address updated successfully")
    );
});

// Get cart summary
export const getCartSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.getCartWithProducts(userId);

    const summary = {
        totalItems: cart.totalItems,
        subtotal: cart.totalAmount,
        discount: cart.discount,
        discountCode: cart.discountCode,
        finalAmount: cart.finalAmount,
        hasItems: cart.items.length > 0,
        shippingAddress: cart.shippingAddress
    };

    res.status(200).json(
        new ApiResponse(200, summary, "Cart summary retrieved successfully")
    );
});

// Helper function to validate discount code (mock implementation)
const validateDiscountCode = (code, orderAmount) => {
    // Mock discount codes - in real app, validate against database
    const discountCodes = {
        'WELCOME10': { minAmount: 100, discount: 10, type: 'percentage' },
        'SAVE50': { minAmount: 500, discount: 50, type: 'fixed' },
        'FREESHIP': { minAmount: 200, discount: 0, type: 'shipping' },
        'FLAT20': { minAmount: 300, discount: 20, type: 'percentage' }
    };

    const discount = discountCodes[code.toUpperCase()];
    if (!discount) {
        return 0;
    }

    if (orderAmount < discount.minAmount) {
        return 0;
    }

    if (discount.type === 'percentage') {
        return Math.round((orderAmount * discount.discount) / 100);
    } else if (discount.type === 'fixed') {
        return Math.min(discount.discount, orderAmount);
    }

    return 0;
};
