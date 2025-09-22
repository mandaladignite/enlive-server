import express from "express";
import {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    reactivateProduct,
    updateStock,
    getLowStockProducts,
    addReview,
    getProductReviews,
    getProductStats,
    searchProducts,
    getFeaturedProducts,
    getProductCategories
} from "../controllers/product.controller.js";
import { verifyJWT, adminOnly, customerAndAdmin } from "../middleware/auth.middleware.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getProductCategories);
router.get("/:productId", getProduct);
router.get("/:productId/reviews", getProductReviews);

// Protected routes (authentication required)
router.use(verifyJWT);

// Add review (authenticated users)
router.post(
    "/:productId/reviews",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required"),
        body("rating")
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating must be between 1 and 5"),
        body("comment")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Comment cannot exceed 500 characters")
    ],
    validate,
    customerAndAdmin,
    addReview
);

// Admin only routes
router.post(
    "/",
    [
        body("name")
            .isLength({ min: 1, max: 100 })
            .withMessage("Product name is required and cannot exceed 100 characters"),
        body("category")
            .isIn(["hair_care", "skin_care", "nail_care", "makeup", "tools", "accessories", "other"])
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
            .isArray({ min: 1 })
            .withMessage("At least one image URL is required"),
        body("imageUrls.*")
            .isURL()
            .withMessage("Each image URL must be a valid URL"),
        body("brand")
            .optional()
            .isLength({ max: 50 })
            .withMessage("Brand name cannot exceed 50 characters"),
        body("sku")
            .optional()
            .isLength({ max: 50 })
            .withMessage("SKU cannot exceed 50 characters"),
        body("weight.value")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Weight value must be non-negative"),
        body("weight.unit")
            .optional()
            .isIn(["g", "kg", "ml", "l", "oz", "lb"])
            .withMessage("Invalid weight unit"),
        body("dimensions.length")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Length must be non-negative"),
        body("dimensions.width")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Width must be non-negative"),
        body("dimensions.height")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Height must be non-negative"),
        body("dimensions.unit")
            .optional()
            .isIn(["cm", "m", "in", "ft"])
            .withMessage("Invalid dimension unit"),
        body("tags")
            .optional()
            .isArray()
            .withMessage("Tags must be an array"),
        body("tags.*")
            .optional()
            .isLength({ max: 30 })
            .withMessage("Each tag cannot exceed 30 characters"),
        body("isFeatured")
            .optional()
            .isBoolean()
            .withMessage("isFeatured must be a boolean"),
        body("discount")
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage("Discount must be between 0 and 100"),
        body("discountStartDate")
            .optional()
            .isISO8601()
            .withMessage("Valid discount start date is required"),
        body("discountEndDate")
            .optional()
            .isISO8601()
            .withMessage("Valid discount end date is required"),
        body("ingredients")
            .optional()
            .isArray()
            .withMessage("Ingredients must be an array"),
        body("ingredients.*")
            .optional()
            .isLength({ max: 100 })
            .withMessage("Each ingredient name cannot exceed 100 characters"),
        body("usageInstructions")
            .optional()
            .isLength({ max: 1000 })
            .withMessage("Usage instructions cannot exceed 1000 characters"),
        body("careInstructions")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Care instructions cannot exceed 500 characters"),
        body("warranty.period")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Warranty period must be non-negative"),
        body("warranty.unit")
            .optional()
            .isIn(["days", "weeks", "months", "years"])
            .withMessage("Invalid warranty unit"),
        body("warranty.description")
            .optional()
            .isLength({ max: 200 })
            .withMessage("Warranty description cannot exceed 200 characters"),
        body("supplier.name")
            .optional()
            .isLength({ max: 100 })
            .withMessage("Supplier name cannot exceed 100 characters"),
        body("supplier.contact")
            .optional()
            .isLength({ max: 100 })
            .withMessage("Supplier contact cannot exceed 100 characters"),
        body("reorderLevel")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Reorder level must be non-negative")
    ],
    validate,
    adminOnly,
    createProduct
);

router.put(
    "/:productId",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required"),
        body("name")
            .optional()
            .isLength({ min: 1, max: 100 })
            .withMessage("Product name cannot exceed 100 characters"),
        body("category")
            .optional()
            .isIn(["hair_care", "skin_care", "nail_care", "makeup", "tools", "accessories", "other"])
            .withMessage("Invalid category"),
        body("price")
            .optional()
            .isFloat({ min: 0, max: 999999 })
            .withMessage("Price must be between 0 and 999999"),
        body("stock")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Stock must be a non-negative integer"),
        body("description")
            .optional()
            .isLength({ min: 1, max: 1000 })
            .withMessage("Description cannot exceed 1000 characters"),
        body("imageUrls")
            .optional()
            .isArray({ min: 1 })
            .withMessage("At least one image URL is required"),
        body("imageUrls.*")
            .optional()
            .isURL()
            .withMessage("Each image URL must be a valid URL"),
        body("brand")
            .optional()
            .isLength({ max: 50 })
            .withMessage("Brand name cannot exceed 50 characters"),
        body("sku")
            .optional()
            .isLength({ max: 50 })
            .withMessage("SKU cannot exceed 50 characters"),
        body("isFeatured")
            .optional()
            .isBoolean()
            .withMessage("isFeatured must be a boolean"),
        body("discount")
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage("Discount must be between 0 and 100"),
        body("discountStartDate")
            .optional()
            .isISO8601()
            .withMessage("Valid discount start date is required"),
        body("discountEndDate")
            .optional()
            .isISO8601()
            .withMessage("Valid discount end date is required")
    ],
    validate,
    adminOnly,
    updateProduct
);

router.delete(
    "/:productId",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required")
    ],
    validate,
    adminOnly,
    deleteProduct
);

router.patch(
    "/:productId/deactivate",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required")
    ],
    validate,
    adminOnly,
    deactivateProduct
);

router.patch(
    "/:productId/reactivate",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required")
    ],
    validate,
    adminOnly,
    reactivateProduct
);

router.patch(
    "/:productId/stock",
    [
        param("productId")
            .isMongoId()
            .withMessage("Valid product ID is required"),
        body("quantity")
            .isInt({ min: 1 })
            .withMessage("Valid quantity is required"),
        body("operation")
            .optional()
            .isIn(["add", "subtract"])
            .withMessage("Operation must be 'add' or 'subtract'")
    ],
    validate,
    adminOnly,
    updateStock
);

router.get(
    "/admin/low-stock",
    [
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
    adminOnly,
    getLowStockProducts
);

router.get(
    "/admin/stats",
    adminOnly,
    getProductStats
);

export default router;
