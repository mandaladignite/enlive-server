import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    updateShippingAddress,
    getCartSummary
} from "../controllers/cart.controller.js";
import { verifyJWT, customerAndAdmin } from "../middleware/auth.middleware.js";
import { body, param } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Get user's cart
router.get(
    "/",
    customerAndAdmin,
    getCart
);

// Get cart summary
router.get(
    "/summary",
    customerAndAdmin,
    getCartSummary
);

// Add item to cart
router.post(
    "/items",
    [
        body("productId")
            .isMongoId()
            .withMessage("Valid product ID is required"),
        body("quantity")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Quantity must be between 1 and 100")
            .default(1)
    ],
    validate,
    customerAndAdmin,
    addToCart
);

// Update cart item quantity
router.put(
    "/items/:productId",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required"),
        body("quantity")
            .isInt({ min: 0, max: 100 })
            .withMessage("Quantity must be between 0 and 100")
    ],
    validate,
    customerAndAdmin,
    updateCartItem
);

// Remove item from cart
router.delete(
    "/items/:productId",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required")
    ],
    validate,
    customerAndAdmin,
    removeFromCart
);

// Clear cart
router.delete(
    "/",
    customerAndAdmin,
    clearCart
);

// Apply discount code
router.post(
    "/discount",
    [
        body("discountCode")
            .isLength({ min: 1, max: 20 })
            .withMessage("Discount code is required and cannot exceed 20 characters")
    ],
    validate,
    customerAndAdmin,
    applyDiscount
);

// Remove discount code
router.delete(
    "/discount",
    customerAndAdmin,
    removeDiscount
);

// Update shipping address
router.put(
    "/shipping-address",
    [
        body("street")
            .isLength({ min: 1, max: 200 })
            .withMessage("Street address is required and cannot exceed 200 characters"),
        body("city")
            .isLength({ min: 1, max: 50 })
            .withMessage("City is required and cannot exceed 50 characters"),
        body("state")
            .isLength({ min: 1, max: 50 })
            .withMessage("State is required and cannot exceed 50 characters"),
        body("zipCode")
            .isLength({ min: 1, max: 10 })
            .withMessage("Zip code is required and cannot exceed 10 characters"),
        body("phone")
            .isLength({ min: 1, max: 15 })
            .withMessage("Phone number is required and cannot exceed 15 characters"),
        body("country")
            .optional()
            .isLength({ max: 50 })
            .withMessage("Country cannot exceed 50 characters")
    ],
    validate,
    customerAndAdmin,
    updateShippingAddress
);

export default router;
