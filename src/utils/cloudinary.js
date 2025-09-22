import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, options = {}) => {
    try {
        const {
            folder = 'salon-gallery',
            category = 'general',
            transformation = {},
            quality = 'auto',
            format = 'auto'
        } = options;

        const uploadOptions = {
            folder: `${folder}/${category}`,
            resource_type: 'image',
            quality: quality,
            format: format,
            transformation: {
                quality: 'auto',
                fetch_format: 'auto',
                ...transformation
            },
            tags: [category, 'salon-gallery'],
            ...options
        };

        const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        
        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            created_at: result.created_at,
            version: result.version,
            signature: result.signature
        };
    } catch (error) {
        throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
    }
};

// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files, options = {}) => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file, options));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        throw new ApiError(500, `Multiple upload failed: ${error.message}`);
    }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new ApiError(500, `Cloudinary delete failed: ${error.message}`);
    }
};

// Delete multiple images from Cloudinary
export const deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        throw new ApiError(500, `Multiple delete failed: ${error.message}`);
    }
};

// Generate image transformations
export const generateImageTransformations = (publicId, transformations = {}) => {
    const {
        width,
        height,
        crop = 'fill',
        gravity = 'auto',
        quality = 'auto',
        format = 'auto'
    } = transformations;

    const transformOptions = {
        width: width || 'auto',
        height: height || 'auto',
        crop,
        gravity,
        quality,
        format,
        fetch_format: 'auto'
    };

    return cloudinary.url(publicId, {
        transformation: [transformOptions]
    });
};

// Get image details from Cloudinary
export const getImageDetails = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        throw new ApiError(404, `Image not found: ${error.message}`);
    }
};

// Search images in Cloudinary
export const searchImages = async (query = {}) => {
    try {
        const {
            expression = 'resource_type:image',
            max_results = 50,
            next_cursor = null,
            sort_by = 'created_at',
            sort_direction = 'desc'
        } = query;

        const result = await cloudinary.search
            .expression(expression)
            .max_results(max_results)
            .next_cursor(next_cursor)
            .sort_by(sort_by, sort_direction)
            .execute();

        return result;
    } catch (error) {
        throw new ApiError(500, `Cloudinary search failed: ${error.message}`);
    }
};

// Create image collage
export const createCollage = async (publicIds, options = {}) => {
    try {
        const {
            width = 800,
            height = 600,
            columns = 2,
            rows = 2,
            spacing = 10
        } = options;

        const collageOptions = {
            width,
            height,
            columns,
            rows,
            spacing,
            background: 'white'
        };

        const result = await cloudinary.image(publicIds.join(','), {
            transformation: [
                { crop: 'fill', width: width / columns, height: height / rows },
                { flags: 'layer_apply' }
            ]
        });

        return result;
    } catch (error) {
        throw new ApiError(500, `Collage creation failed: ${error.message}`);
    }
};

// Generate responsive image URLs
export const generateResponsiveUrls = (publicId, baseWidth = 800) => {
    const sizes = [320, 640, 800, 1200, 1600];
    
    return sizes.map(size => ({
        width: size,
        url: cloudinary.url(publicId, {
            transformation: [
                { width: size, height: Math.round(size * 0.75), crop: 'fill', quality: 'auto' }
            ]
        })
    }));
};

// Validate image file
export const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
        throw new ApiError(400, 'No file provided');
    }

    if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(400, 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    if (file.size > maxSize) {
        throw new ApiError(400, 'File size too large. Maximum size is 10MB');
    }

    return true;
};

// Get Cloudinary usage statistics
export const getCloudinaryUsage = async () => {
    try {
        const result = await cloudinary.api.usage();
        return result;
    } catch (error) {
        throw new ApiError(500, `Failed to get usage statistics: ${error.message}`);
    }
};

export default cloudinary;