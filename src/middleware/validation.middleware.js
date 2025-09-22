import { validationResult, body } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));
        
        throw new ApiError(400, "Validation failed", errorMessages);
    }
    
    next();
};

// Review validation rules
export const validateReviewSubmission = [
    body('targetType')
        .isIn(['product', 'service'])
        .withMessage('Target type must be either "product" or "service"'),
    
    body('targetId')
        .isMongoId()
        .withMessage('Target ID must be a valid MongoDB ObjectId'),
    
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment must be between 1 and 500 characters')
];

export const validateReviewUpdate = [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment must be between 1 and 500 characters')
];
