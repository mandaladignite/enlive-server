import express from "express";
import {
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendMembershipConfirmation,
    sendPromotionalMessage,
    sendCustomMessage,
    sendBulkMessages,
    getServiceStatus,
    getMessageStatus,
    verifyWebhook,
    processWebhook,
    sendBulkAppointmentReminders,
    sendBulkPromotionalMessage
} from "../controllers/whatsapp.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Public webhook endpoints (no authentication required)
router.get(
    "/webhook",
    [
        query("hub.mode")
            .notEmpty()
            .withMessage("Mode is required"),
        query("hub.verify_token")
            .notEmpty()
            .withMessage("Verify token is required"),
        query("hub.challenge")
            .notEmpty()
            .withMessage("Challenge is required")
    ],
    validate,
    verifyWebhook
);

router.post(
    "/webhook",
    processWebhook
);

// Admin routes (authentication required)
router.use(verifyJWT);

// Get service status
router.get(
    "/status",
    getServiceStatus
);

// Send appointment confirmation
router.post(
    "/appointment/:appointmentId/confirm",
    [
        param("appointmentId")
            .isMongoId()
            .withMessage("Valid appointment ID is required"),
        body("sendReminder")
            .optional()
            .isBoolean()
            .withMessage("sendReminder must be a boolean value")
    ],
    validate,
    adminOnly,
    sendAppointmentConfirmation
);

// Send appointment cancellation
router.post(
    "/appointment/:appointmentId/cancel",
    [
        param("appointmentId")
            .isMongoId()
            .withMessage("Valid appointment ID is required"),
        body("reason")
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage("Reason cannot exceed 200 characters")
    ],
    validate,
    adminOnly,
    sendAppointmentCancellation
);

// Send order confirmation
router.post(
    "/order/:orderId/confirm",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required")
    ],
    validate,
    adminOnly,
    sendOrderConfirmation
);

// Send order status update
router.post(
    "/order/:orderId/status",
    [
        param("orderId")
            .isMongoId()
            .withMessage("Valid order ID is required"),
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(["processing", "shipped", "out_for_delivery", "delivered", "cancelled"])
            .withMessage("Invalid status value"),
        body("trackingNumber")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Tracking number cannot exceed 50 characters"),
        body("estimatedDelivery")
            .optional()
            .isISO8601()
            .withMessage("Estimated delivery must be a valid date")
    ],
    validate,
    adminOnly,
    sendOrderStatusUpdate
);

// Send membership confirmation
router.post(
    "/membership/:membershipId/confirm",
    [
        param("membershipId")
            .isMongoId()
            .withMessage("Valid membership ID is required")
    ],
    validate,
    adminOnly,
    sendMembershipConfirmation
);

// Send promotional message to specific user
router.post(
    "/promotional/:userId",
    [
        param("userId")
            .isMongoId()
            .withMessage("Valid user ID is required"),
        body("title")
            .notEmpty()
            .withMessage("Title is required")
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("Title must be between 1 and 100 characters"),
        body("description")
            .notEmpty()
            .withMessage("Description is required")
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("Description must be between 1 and 200 characters"),
        body("discountPercentage")
            .isFloat({ min: 0, max: 100 })
            .withMessage("Discount percentage must be between 0 and 100"),
        body("validUntil")
            .isISO8601()
            .withMessage("Valid until must be a valid date"),
        body("promoCode")
            .optional()
            .trim()
            .isLength({ max: 20 })
            .withMessage("Promo code cannot exceed 20 characters")
    ],
    validate,
    adminOnly,
    sendPromotionalMessage
);

// Send custom message
router.post(
    "/send/custom",
    [
        body("to")
            .notEmpty()
            .withMessage("Phone number is required")
            .matches(/^[\+]?[1-9][\d]{0,15}$/)
            .withMessage("Please enter a valid phone number"),
        body("message")
            .notEmpty()
            .withMessage("Message is required")
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage("Message must be between 1 and 1000 characters"),
        body("messageType")
            .optional()
            .isIn(["text"])
            .withMessage("Message type must be text")
    ],
    validate,
    adminOnly,
    sendCustomMessage
);

// Send bulk messages
router.post(
    "/send/bulk",
    [
        body("messages")
            .isArray({ min: 1, max: 100 })
            .withMessage("Messages array is required and must contain 1-100 messages"),
        body("messages.*.to")
            .notEmpty()
            .withMessage("Phone number is required for each message")
            .matches(/^[\+]?[1-9][\d]{0,15}$/)
            .withMessage("Please enter a valid phone number"),
        body("messages.*.message")
            .notEmpty()
            .withMessage("Message is required for each message")
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage("Message must be between 1 and 1000 characters"),
        body("messages.*.messageType")
            .optional()
            .isIn(["text"])
            .withMessage("Message type must be text")
    ],
    validate,
    adminOnly,
    sendBulkMessages
);

// Send bulk appointment reminders
router.post(
    "/appointment/reminders/bulk",
    [
        body("hoursBefore")
            .optional()
            .isInt({ min: 1, max: 168 })
            .withMessage("Hours before must be between 1 and 168 (1 week)")
    ],
    validate,
    adminOnly,
    sendBulkAppointmentReminders
);

// Send bulk promotional message
router.post(
    "/promotional/bulk",
    [
        body("title")
            .notEmpty()
            .withMessage("Title is required")
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("Title must be between 1 and 100 characters"),
        body("description")
            .notEmpty()
            .withMessage("Description is required")
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("Description must be between 1 and 200 characters"),
        body("discountPercentage")
            .isFloat({ min: 0, max: 100 })
            .withMessage("Discount percentage must be between 0 and 100"),
        body("validUntil")
            .isISO8601()
            .withMessage("Valid until must be a valid date"),
        body("promoCode")
            .optional()
            .trim()
            .isLength({ max: 20 })
            .withMessage("Promo code cannot exceed 20 characters"),
        body("customerFilter")
            .optional()
            .isObject()
            .withMessage("Customer filter must be an object")
    ],
    validate,
    adminOnly,
    sendBulkPromotionalMessage
);

// Get message status
router.get(
    "/message/:messageId/status",
    [
        param("messageId")
            .notEmpty()
            .withMessage("Message ID is required")
    ],
    validate,
    adminOnly,
    getMessageStatus
);

export default router;

