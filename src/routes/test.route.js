import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Test endpoint for validation
router.post("/test-validation", [
    body("name")
        .isLength({ min: 1, max: 100 })
        .withMessage("Name is required and cannot exceed 100 characters"),
    body("email")
        .isEmail()
        .withMessage("Valid email is required"),
    body("age")
        .optional()
        .isInt({ min: 0, max: 120 })
        .withMessage("Age must be between 0 and 120")
], validate, (req, res) => {
    res.json({
        success: true,
        message: "Validation passed",
        data: req.body
    });
});

// Test endpoint for product creation
router.post("/test-product", [
    body("name")
        .isLength({ min: 1, max: 100 })
        .withMessage("Product name is required and cannot exceed 100 characters"),
    body("category")
        .isIn(["hair_care", "skin_care", "nail_care", "makeup", "tools", "accessories", "other", "Hair Care", "Skin Care", "Nail Care", "Makeup", "Tools", "Accessories", "Other"])
        .withMessage("Valid category is required"),
    body("price")
        .isFloat({ min: 0, max: 999999 })
        .withMessage("Price must be between 0 and 999999"),
    body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
    body("description")
        .isLength({ min: 1, max: 1000 })
        .withMessage("Description is required and cannot exceed 1000 characters"),
    body("imageUrls")
        .optional()
        .isArray({ min: 1 })
        .withMessage("If provided, at least one image URL is required"),
    body("imageUrls.*")
        .optional()
        .isURL()
        .withMessage("Each image URL must be a valid URL")
], validate, (req, res) => {
    res.json({
        success: true,
        message: "Product validation passed",
        data: req.body
    });
});

export default router;

