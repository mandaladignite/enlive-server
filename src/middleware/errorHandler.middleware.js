import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message,
                value: error.value
            }))
        });
    }
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            errors: [{
                field: field,
                message: `${field} must be unique`,
                value: err.keyValue[field]
            }]
        });
    }
    
    // Handle MongoDB cast errors
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
            errors: [{
                field: err.path,
                message: "Invalid ID format",
                value: err.value
            }]
        });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            errors: []
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: "Token expired",
            errors: []
        });
    }
    
    // Handle API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }
    
    // Handle other errors
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: []
    });
};

