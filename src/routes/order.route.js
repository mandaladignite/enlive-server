import express from "express";
import {
    createOrder,
    verifyPayment,
    getUserOrders,
    getOrder,
    cancelOrder,
    requestReturn,
    getOrderTracking,
    getAllOrders,
    updateOrderStatus,
    processReturn,
    getOrderStats
} from "../controllers/order.controller.js";
import { verifyJWT, adminOnly, customerAndAdmin } from "../middleware/auth.middleware.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Customer routes
router.post(
    "/",
    [
        body("paymentMethod")
            .optional()
            .isIn(["razorpay", "cod", "wallet", "card"])
            .withMessage("Invalid payment method"),
        body("notes")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Notes cannot exceed 500 characters")
    ],
    validate,
    customerAndAdmin,
    createOrder
);

router.post(
    "/verify-payment",
    [
        body("orderId")
            .isLength({ min: 1 })
            .withMessage("Order ID is required"),
        body("paymentId")
            .isLength({ min: 1 })
            .withMessage("Payment ID is required"),
        body("signature")
            .isLength({ min: 1 })
            .withMessage("Signature is required")
    ],
    validate,
    customerAndAdmin,
    verifyPayment
);

router.get(
    "/my-orders",
    [
        query("status")
            .optional()
            .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"])
            .withMessage("Invalid status"),
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        query("sortBy")
            .optional()
            .isIn(["createdAt", "totalAmount", "status"])
            .withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort order must be 'asc' or 'desc'")
    ],
    validate,
    customerAndAdmin,
    getUserOrders
);

router.get(
    "/:orderId",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required")
    ],
    validate,
    customerAndAdmin,
    getOrder
);

router.patch(
    "/:orderId/cancel",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required"),
        body("reason")
            .optional()
            .isLength({ max: 200 })
            .withMessage("Cancellation reason cannot exceed 200 characters")
    ],
    validate,
    customerAndAdmin,
    cancelOrder
);

router.post(
    "/:orderId/return",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required"),
        body("reason")
            .isLength({ min: 1, max: 200 })
            .withMessage("Return reason is required and cannot exceed 200 characters")
    ],
    validate,
    customerAndAdmin,
    requestReturn
);

router.get(
    "/:orderId/tracking",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required")
    ],
    validate,
    customerAndAdmin,
    getOrderTracking
);

// Admin routes
router.get(
    "/admin/all",
    [
        query("status")
            .optional()
            .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"])
            .withMessage("Invalid status"),
        query("paymentStatus")
            .optional()
            .isIn(["pending", "processing", "completed", "failed", "cancelled", "refunded"])
            .withMessage("Invalid payment status"),
        query("userId")
            .optional()
            .isMongoId()
            .withMessage("Valid user ID is required"),
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Valid start date is required"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("Valid end date is required"),
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        query("sortBy")
            .optional()
            .isIn(["createdAt", "totalAmount", "status"])
            .withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort order must be 'asc' or 'desc'")
    ],
    validate,
    adminOnly,
    getAllOrders
);

router.patch(
    "/admin/:orderId/status",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required"),
        body("status")
            .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"])
            .withMessage("Invalid status"),
        body("trackingNumber")
            .optional()
            .isLength({ max: 50 })
            .withMessage("Tracking number cannot exceed 50 characters"),
        body("estimatedDelivery")
            .optional()
            .isISO8601()
            .withMessage("Valid estimated delivery date is required")
    ],
    validate,
    adminOnly,
    updateOrderStatus
);

router.patch(
    "/admin/:orderId/return",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required"),
        body("action")
            .isIn(["approve", "reject"])
            .withMessage("Action must be 'approve' or 'reject'"),
        body("reason")
            .optional()
            .isLength({ max: 200 })
            .withMessage("Reason cannot exceed 200 characters")
    ],
    validate,
    adminOnly,
    processReturn
);

router.get(
    "/admin/stats",
    [
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Valid start date is required"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("Valid end date is required"),
        query("userId")
            .optional()
            .isMongoId()
            .withMessage("Valid user ID is required")
    ],
    validate,
    adminOnly,
    getOrderStats
);

export default router;
