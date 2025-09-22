import express from "express";
import { 
    createAppointment,
    getUserAppointments,
    getAllAppointments,
    getAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableTimeSlots,
    getAppointmentStats
} from "../controllers/appointment.controller.js";
import { verifyJWT, adminOnly, customerAndAdmin } from "../middleware/auth.middleware.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Create appointment
router.post(
    "/",
    [
        body("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required"),
        body("stylistId")
            .optional()
            .isMongoId()
            .withMessage("Valid stylist ID is required"),
        body("date")
            .isISO8601()
            .withMessage("Valid date is required")
            .custom((value) => {
                if (new Date(value) <= new Date()) {
                    throw new Error("Appointment date must be in the future");
                }
                return true;
            }),
        body("timeSlot")
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage("Valid time slot is required (HH:MM format)"),
        body("location")
            .isIn(["home", "salon"])
            .withMessage("Location must be either 'home' or 'salon'"),
        body("notes")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Notes cannot exceed 500 characters"),
        body("address")
            .optional()
            .isObject()
            .withMessage("Address must be an object"),
        body("address.street")
            .optional()
            .isString()
            .isLength({ max: 100 })
            .withMessage("Street must be a string with max 100 characters"),
        body("address.city")
            .optional()
            .isString()
            .isLength({ max: 50 })
            .withMessage("City must be a string with max 50 characters"),
        body("address.state")
            .optional()
            .isString()
            .isLength({ max: 50 })
            .withMessage("State must be a string with max 50 characters"),
        body("address.zipCode")
            .optional()
            .isString()
            .isLength({ max: 10 })
            .withMessage("Zip code must be a string with max 10 characters"),
        body("address.country")
            .optional()
            .isString()
            .isLength({ max: 50 })
            .withMessage("Country must be a string with max 50 characters")
    ],
    validate,
    customerAndAdmin,
    createAppointment
);

// Get user's appointments
router.get(
    "/my-appointments",
    [
        query("status")
            .optional()
            .isIn(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"])
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
            .isIn(["date", "createdAt", "status", "totalPrice"])
            .withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort order must be 'asc' or 'desc'")
    ],
    validate,
    customerAndAdmin,
    getUserAppointments
);

// Get all appointments (admin only)
router.get(
    "/",
    [
        query("status")
            .optional()
            .isIn(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"])
            .withMessage("Invalid status"),
        query("location")
            .optional()
            .isIn(["home", "salon"])
            .withMessage("Invalid location"),
        query("stylistId")
            .optional()
            .isMongoId()
            .withMessage("Valid stylist ID is required"),
        query("date")
            .optional()
            .isISO8601()
            .withMessage("Valid date is required"),
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
            .isIn(["date", "createdAt", "status", "totalPrice"])
            .withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort order must be 'asc' or 'desc'")
    ],
    validate,
    adminOnly,
    getAllAppointments
);

// Get single appointment
router.get(
    "/:appointmentId",
    [
        param("appointmentId")
            .isMongoId()
            .withMessage("Valid appointment ID is required")
    ],
    validate,
    customerAndAdmin,
    getAppointment
);

// Update appointment
router.put(
    "/:appointmentId",
    [
        param("appointmentId")
            .isMongoId()
            .withMessage("Valid appointment ID is required"),
        body("serviceId")
            .optional()
            .isMongoId()
            .withMessage("Valid service ID is required"),
        body("stylistId")
            .optional()
            .isMongoId()
            .withMessage("Valid stylist ID is required"),
        body("date")
            .optional()
            .isISO8601()
            .withMessage("Valid date is required")
            .custom((value) => {
                if (new Date(value) <= new Date()) {
                    throw new Error("Appointment date must be in the future");
                }
                return true;
            }),
        body("timeSlot")
            .optional()
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage("Valid time slot is required (HH:MM format)"),
        body("location")
            .optional()
            .isIn(["home", "salon"])
            .withMessage("Location must be either 'home' or 'salon'"),
        body("notes")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Notes cannot exceed 500 characters"),
        body("address")
            .optional()
            .isObject()
            .withMessage("Address must be an object"),
        body("status")
            .optional()
            .isIn(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"])
            .withMessage("Invalid status")
    ],
    validate,
    customerAndAdmin,
    updateAppointment
);

// Cancel appointment
router.patch(
    "/:appointmentId/cancel",
    [
        param("appointmentId")
            .isMongoId()
            .withMessage("Valid appointment ID is required"),
        body("cancellationReason")
            .optional()
            .isLength({ max: 200 })
            .withMessage("Cancellation reason cannot exceed 200 characters")
    ],
    validate,
    customerAndAdmin,
    cancelAppointment
);

// Get available time slots
router.get(
    "/time-slots/available",
    [
        query("stylistId")
            .isMongoId()
            .withMessage("Valid stylist ID is required"),
        query("date")
            .isISO8601()
            .withMessage("Valid date is required")
    ],
    validate,
    customerAndAdmin,
    getAvailableTimeSlots
);

// Get appointment statistics (admin only)
router.get(
    "/stats/overview",
    [
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Valid start date is required"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("Valid end date is required")
    ],
    validate,
    adminOnly,
    getAppointmentStats
);

export default router;
