import express from "express";
import { 
    getAllServices, 
    getService, 
    createService, 
    updateService, 
    deleteService, 
    deactivateService, 
    reactivateService, 
    getServiceStats 
} from "../controllers/service.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get(
    "/",
    [
        query("category")
            .optional()
            .isIn(["hair", "nails", "skincare", "massage", "makeup", "other"])
            .withMessage("Invalid category"),
        query("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive must be a boolean"),
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100")
    ],
    validate,
    getAllServices
);

router.get(
    "/:serviceId",
    [
        param("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required")
    ],
    validate,
    getService
);

// Admin routes (authentication required)
router.use(verifyJWT);

// Create service (Admin only)
router.post(
    "/",
    [
        body("name")
            .isLength({ min: 1, max: 100 })
            .withMessage("Service name is required and cannot exceed 100 characters"),
        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Description cannot exceed 500 characters"),
        body("duration")
            .isInt({ min: 15, max: 480 })
            .withMessage("Duration must be between 15 and 480 minutes"),
        body("price")
            .isFloat({ min: 0, max: 999999 })
            .withMessage("Price must be between 0 and 999999"),
        body("category")
            .isIn(["hair", "nails", "skincare", "massage", "makeup", "other"])
            .withMessage("Valid category is required"),
        body("availableAtHome")
            .optional()
            .isBoolean()
            .withMessage("availableAtHome must be a boolean"),
        body("availableAtSalon")
            .optional()
            .isBoolean()
            .withMessage("availableAtSalon must be a boolean")
    ],
    validate,
    adminOnly,
    createService
);

// Update service (Admin only)
router.put(
    "/:serviceId",
    [
        param("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required"),
        body("name")
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage("Service name cannot exceed 100 characters"),
        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Description cannot exceed 500 characters"),
        body("duration")
            .optional()
            .isInt({ min: 15, max: 480 })
            .withMessage("Duration must be between 15 and 480 minutes"),
        body("price")
            .optional()
            .isFloat({ min: 0, max: 999999 })
            .withMessage("Price must be between 0 and 999999"),
        body("category")
            .optional()
            .isIn(["hair", "nails", "skincare", "massage", "makeup", "other"])
            .withMessage("Invalid category"),
        body("availableAtHome")
            .optional()
            .isBoolean()
            .withMessage("availableAtHome must be a boolean"),
        body("availableAtSalon")
            .optional()
            .isBoolean()
            .withMessage("availableAtSalon must be a boolean")
    ],
    validate,
    adminOnly,
    updateService
);

// Delete service (Admin only)
router.delete(
    "/:serviceId",
    [
        param("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required")
    ],
    validate,
    adminOnly,
    deleteService
);

// Deactivate service (Admin only)
router.patch(
    "/:serviceId/deactivate",
    [
        param("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required")
    ],
    validate,
    adminOnly,
    deactivateService
);

// Reactivate service (Admin only)
router.patch(
    "/:serviceId/reactivate",
    [
        param("serviceId")
            .isMongoId()
            .withMessage("Valid service ID is required")
    ],
    validate,
    adminOnly,
    reactivateService
);

// Get service statistics (Admin only)
router.get(
    "/admin/stats",
    adminOnly,
    getServiceStats
);

export default router;
