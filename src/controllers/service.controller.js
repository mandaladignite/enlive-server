import { Service } from "../models/service.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all services (Public)
export const getAllServices = asyncHandler(async (req, res) => {
    const { category, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalServices: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "Services retrieved successfully")
    );
});

// Get single service (Public)
export const getService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);

    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(
        new ApiResponse(200, service, "Service retrieved successfully")
    );
});

// Create service (Admin only)
export const createService = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        duration,
        price,
        category,
        availableAtHome,
        availableAtSalon
    } = req.body;

    // Check if service with same name already exists
    const existingService = await Service.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingService) {
        throw new ApiError(400, "Service with this name already exists");
    }

    const service = await Service.create({
        name,
        description,
        duration,
        price,
        category,
        availableAtHome: availableAtHome || false,
        availableAtSalon: availableAtSalon !== undefined ? availableAtSalon : true
    });

    res.status(201).json(
        new ApiResponse(201, service, "Service created successfully")
    );
});

// Update service (Admin only)
export const updateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const updateData = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    // Check if name is being updated and if it conflicts with existing service
    if (updateData.name && updateData.name !== service.name) {
        const existingService = await Service.findOne({ 
            name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
            _id: { $ne: serviceId }
        });
        if (existingService) {
            throw new ApiError(400, "Service with this name already exists");
        }
    }

    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json(
        new ApiResponse(200, updatedService, "Service updated successfully")
    );
});

// Delete service (Admin only)
export const deleteService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Service deleted successfully")
    );
});

// Deactivate service (Admin only)
export const deactivateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
        serviceId,
        { isActive: false },
        { new: true }
    );

    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(
        new ApiResponse(200, service, "Service deactivated successfully")
    );
});

// Reactivate service (Admin only)
export const reactivateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
        serviceId,
        { isActive: true },
        { new: true }
    );

    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(
        new ApiResponse(200, service, "Service reactivated successfully")
    );
});

// Get service statistics (Admin only)
export const getServiceStats = asyncHandler(async (req, res) => {
    const stats = await Service.aggregate([
        {
            $group: {
                _id: null,
                totalServices: { $sum: 1 },
                activeServices: {
                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
                averagePrice: { $avg: "$price" },
                averageDuration: { $avg: "$duration" }
            }
        }
    ]);

    const categoryStats = await Service.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                averagePrice: { $avg: "$price" },
                averageDuration: { $avg: "$duration" }
            }
        },
        { $sort: { count: -1 } }
    ]);

    const homeServices = await Service.countDocuments({ availableAtHome: true, isActive: true });
    const salonServices = await Service.countDocuments({ availableAtSalon: true, isActive: true });

    res.status(200).json(
        new ApiResponse(200, {
            overview: stats[0] || {
                totalServices: 0,
                activeServices: 0,
                averagePrice: 0,
                averageDuration: 0
            },
            categoryStats,
            availability: {
                homeServices,
                salonServices
            }
        }, "Service statistics retrieved successfully")
    );
});
