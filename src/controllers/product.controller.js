import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new product (Admin only)
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        price,
        stock,
        description,
        imageUrls,
        brand,
        sku,
        weight,
        dimensions,
        tags,
        isFeatured,
        discount,
        discountStartDate,
        discountEndDate,
        specifications,
        ingredients,
        usageInstructions,
        careInstructions,
        warranty,
        supplier,
        reorderLevel
    } = req.body;

    // Check if SKU already exists
    if (sku) {
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            throw new ApiError(400, "Product with this SKU already exists");
        }
    }

    // Validate discount dates
    if (discount && discountStartDate && discountEndDate) {
        const startDate = new Date(discountStartDate);
        const endDate = new Date(discountEndDate);
        
        if (startDate >= endDate) {
            throw new ApiError(400, "Discount start date must be before end date");
        }
    }

    const product = await Product.create({
        name,
        category,
        price,
        stock,
        description,
        imageUrls,
        brand,
        sku,
        weight,
        dimensions,
        tags,
        isFeatured,
        discount,
        discountStartDate,
        discountEndDate,
        specifications,
        ingredients,
        usageInstructions,
        careInstructions,
        warranty,
        supplier,
        reorderLevel
    });

    res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

// Get all products (Public access)
export const getAllProducts = asyncHandler(async (req, res) => {
    const {
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        isFeatured,
        search,
        tags,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (category) filters.category = category;
    if (brand) filters.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') filters.stock = { $gt: 0 };
    if (isFeatured === 'true') filters.isFeatured = true;
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        filters.tags = { $in: tagArray };
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    let query;
    if (search) {
        query = Product.searchProducts(search, filters);
    } else {
        query = Product.find({ ...filters, isActive: true });
    }

    const products = await query
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-reviews -specifications'); // Exclude heavy fields for list view

    const total = await Product.countDocuments({ ...filters, isActive: true });

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Products retrieved successfully")
    );
});

// Get single product (Public access)
export const getProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, product, "Product retrieved successfully")
    );
});

// Update product (Admin only)
export const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const updateData = req.body;

    // Check if SKU already exists (if being updated)
    if (updateData.sku) {
        const existingProduct = await Product.findOne({ 
            sku: updateData.sku,
            _id: { $ne: productId }
        });
        if (existingProduct) {
            throw new ApiError(400, "Product with this SKU already exists");
        }
    }

    // Validate discount dates
    if (updateData.discount && updateData.discountStartDate && updateData.discountEndDate) {
        const startDate = new Date(updateData.discountStartDate);
        const endDate = new Date(updateData.discountEndDate);
        
        if (startDate >= endDate) {
            throw new ApiError(400, "Discount start date must be before end date");
        }
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

// Delete product (Admin only)
export const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    );
});

// Soft delete product (Admin only) - Set isActive to false
export const deactivateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, product, "Product deactivated successfully")
    );
});

// Reactivate product (Admin only)
export const reactivateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
        productId,
        { isActive: true },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    res.status(200).json(
        new ApiResponse(200, product, "Product reactivated successfully")
    );
});

// Update product stock (Admin only)
export const updateStock = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity, operation = 'add' } = req.body;

    if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Valid quantity is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    await product.updateStock(quantity, operation);

    res.status(200).json(
        new ApiResponse(200, product, "Stock updated successfully")
    );
});

// Get low stock products (Admin only)
export const getLowStockProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.getLowStockProducts()
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Product.countDocuments({ 
        stock: { $lte: Product.schema.path('reorderLevel').defaultValue },
        isActive: true 
    });

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Low stock products retrieved successfully")
    );
});

// Add product review (Authenticated users)
export const addReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment = '' } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    try {
        await product.addReview(userId, rating, comment);
        
        res.status(201).json(
            new ApiResponse(201, product, "Review added successfully")
        );
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

// Get product reviews
export const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const product = await Product.findById(productId).select('reviews rating');
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    const sortOptions = {};
    sortOptions[`reviews.${sortBy}`] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Product.findById(productId)
        .populate('reviews.userId', 'name email')
        .select('reviews rating')
        .then(product => {
            if (!product) return { reviews: [], rating: { average: 0, count: 0 } };
            
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            
            const sortedReviews = product.reviews.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });
            
            return {
                reviews: sortedReviews.slice(startIndex, endIndex),
                rating: product.rating
            };
        });

    res.status(200).json(
        new ApiResponse(200, reviews, "Product reviews retrieved successfully")
    );
});

// Get product statistics (Admin only)
export const getProductStats = asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                activeProducts: {
                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
                totalStock: { $sum: "$stock" },
                totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                averagePrice: { $avg: "$price" },
                lowStockProducts: {
                    $sum: {
                        $cond: [
                            { $lte: ["$stock", "$reorderLevel"] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const categoryStats = await Product.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                totalStock: { $sum: "$stock" },
                averagePrice: { $avg: "$price" }
            }
        },
        { $sort: { count: -1 } }
    ]);

    const featuredProducts = await Product.countDocuments({ 
        isFeatured: true, 
        isActive: true 
    });

    res.status(200).json(
        new ApiResponse(200, {
            overview: stats[0] || {
                totalProducts: 0,
                activeProducts: 0,
                totalStock: 0,
                totalValue: 0,
                averagePrice: 0,
                lowStockProducts: 0
            },
            categoryStats,
            featuredProducts
        }, "Product statistics retrieved successfully")
    );
});

// Search products (Public access)
export const searchProducts = asyncHandler(async (req, res) => {
    const { q, category, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query is required");
    }

    const filters = {};
    if (category) filters.category = category;
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.searchProducts(q, filters)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-reviews -specifications');

    const total = await Product.countDocuments({
        $and: [
            { isActive: true },
            filters,
            {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { brand: { $regex: q, $options: 'i' } },
                    { tags: { $in: [new RegExp(q, 'i')] } }
                ]
            }
        ]
    });

    res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            searchQuery: q
        }, "Search results retrieved successfully")
    );
});

// Get featured products (Public access)
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
        isFeatured: true, 
        isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-reviews -specifications');

    res.status(200).json(
        new ApiResponse(200, products, "Featured products retrieved successfully")
    );
});

// Get product categories (Public access)
export const getProductCategories = asyncHandler(async (req, res) => {
    const categories = await Product.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                averagePrice: { $avg: "$price" }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.status(200).json(
        new ApiResponse(200, categories, "Product categories retrieved successfully")
    );
});
