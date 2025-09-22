import { Appointment } from "../models/appointment.model.js";
import { Service } from "../models/service.model.js";
import { Stylist } from "../models/stylist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import WhatsAppService from "../services/whatsapp.service.js";

// Create a new appointment
export const createAppointment = asyncHandler(async (req, res) => {
    const { serviceId, stylistId, date, timeSlot, location, notes, address } = req.body;
    const userId = req.user._id;

    // Validate service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
        throw new ApiError(400, "Service not found or inactive");
    }

    // Validate location availability for service
    if (location === "home" && !service.availableAtHome) {
        throw new ApiError(400, "This service is not available at home");
    }
    if (location === "salon" && !service.availableAtSalon) {
        throw new ApiError(400, "This service is not available at salon");
    }

    // If stylist is provided, validate stylist
    if (stylistId) {
        const stylist = await Stylist.findById(stylistId);
        if (!stylist || !stylist.isActive) {
            throw new ApiError(400, "Stylist not found or inactive");
        }

        // Check if stylist is available for the location
        if (location === "home" && !stylist.availableForHome) {
            throw new ApiError(400, "This stylist is not available for home appointments");
        }
        if (location === "salon" && !stylist.availableForSalon) {
            throw new ApiError(400, "This stylist is not available for salon appointments");
        }

        // Check for existing appointment at the same time
        const existingAppointment = await Appointment.findOne({
            stylistId,
            date: new Date(date),
            timeSlot,
            status: { $in: ["pending", "confirmed", "in_progress"] }
        });

        if (existingAppointment) {
            throw new ApiError(400, "Stylist is already booked at this time");
        }
    }

    // Check for user's existing appointment at the same time
    const userExistingAppointment = await Appointment.findOne({
        userId,
        date: new Date(date),
        timeSlot,
        status: { $in: ["pending", "confirmed", "in_progress"] }
    });

    if (userExistingAppointment) {
        throw new ApiError(400, "You already have an appointment at this time");
    }

    // Calculate total price
    const totalPrice = service.price;

    // Create appointment
    const appointment = await Appointment.create({
        userId,
        serviceId,
        stylistId,
        date: new Date(date),
        timeSlot,
        location,
        notes,
        address: location === "home" ? address : undefined,
        totalPrice
    });

    // Populate the appointment with service and stylist details
    await appointment.populate([
        { path: "serviceId", select: "name description duration price category" },
        { path: "stylistId", select: "name specialties rating" },
        { path: "userId", select: "name phone" }
    ]);

    // Send WhatsApp confirmation if user has phone number
    if (appointment.userId.phone && WhatsAppService.isConfigured()) {
        try {
            const appointmentData = {
                customerName: appointment.userId.name,
                customerPhone: appointment.userId.phone,
                serviceName: appointment.serviceId.name,
                stylistName: appointment.stylistId?.name || 'TBD',
                appointmentDate: appointment.date,
                appointmentTime: appointment.timeSlot,
                location: appointment.location,
                appointmentId: appointment._id
            };

            await WhatsAppService.sendAppointmentConfirmation(appointmentData);
        } catch (error) {
            console.error('Failed to send WhatsApp confirmation:', error.message);
            // Don't fail the appointment creation if WhatsApp fails
        }
    }

    res.status(201).json(
        new ApiResponse(201, appointment, "Appointment created successfully")
    );
});

// Get user's appointments
export const getUserAppointments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, page = 1, limit = 10, sortBy = "date", sortOrder = "desc" } = req.query;

    const query = { userId };
    if (status) {
        query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const appointments = await Appointment.find(query)
        .populate("serviceId", "name description duration price category")
        .populate("stylistId", "name specialties rating")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            appointments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalAppointments: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "User appointments retrieved successfully")
    );
});

// Get all appointments (admin only)
export const getAllAppointments = asyncHandler(async (req, res) => {
    const { status, location, stylistId, date, page = 1, limit = 10, sortBy = "date", sortOrder = "desc" } = req.query;

    const query = {};
    if (status) query.status = status;
    if (location) query.location = location;
    if (stylistId) query.stylistId = stylistId;
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.date = { $gte: startDate, $lt: endDate };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const appointments = await Appointment.find(query)
        .populate("userId", "name email phone")
        .populate("serviceId", "name description duration price category")
        .populate("stylistId", "name specialties rating")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            appointments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalAppointments: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "All appointments retrieved successfully")
    );
});

// Get single appointment
export const getAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = { _id: appointmentId };
    
    // If not admin, only allow access to own appointments
    if (userRole !== "admin") {
        query.userId = userId;
    }

    const appointment = await Appointment.findOne(query)
        .populate("userId", "name email phone")
        .populate("serviceId", "name description duration price category")
        .populate("stylistId", "name specialties rating");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    res.status(200).json(
        new ApiResponse(200, appointment, "Appointment retrieved successfully")
    );
});

// Update appointment
export const updateAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { serviceId, stylistId, date, timeSlot, location, notes, address, status } = req.body;

    const query = { _id: appointmentId };
    
    // If not admin, only allow access to own appointments
    if (userRole !== "admin") {
        query.userId = userId;
    }

    const appointment = await Appointment.findOne(query);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Check if appointment can be updated
    if (appointment.status === "completed" || appointment.status === "cancelled") {
        throw new ApiError(400, "Cannot update completed or cancelled appointments");
    }

    // If updating date/time, check for conflicts
    if (date || timeSlot) {
        const newDate = date ? new Date(date) : appointment.date;
        const newTimeSlot = timeSlot || appointment.timeSlot;

        // Check for stylist conflicts
        if (stylistId || appointment.stylistId) {
            const checkStylistId = stylistId || appointment.stylistId;
            const existingAppointment = await Appointment.findOne({
                _id: { $ne: appointmentId },
                stylistId: checkStylistId,
                date: newDate,
                timeSlot: newTimeSlot,
                status: { $in: ["pending", "confirmed", "in_progress"] }
            });

            if (existingAppointment) {
                throw new ApiError(400, "Stylist is already booked at this time");
            }
        }

        // Check for user conflicts
        const userExistingAppointment = await Appointment.findOne({
            _id: { $ne: appointmentId },
            userId: appointment.userId,
            date: newDate,
            timeSlot: newTimeSlot,
            status: { $in: ["pending", "confirmed", "in_progress"] }
        });

        if (userExistingAppointment) {
            throw new ApiError(400, "You already have an appointment at this time");
        }
    }

    // Update appointment
    const updateData = {};
    if (serviceId) updateData.serviceId = serviceId;
    if (stylistId !== undefined) updateData.stylistId = stylistId;
    if (date) updateData.date = new Date(date);
    if (timeSlot) updateData.timeSlot = timeSlot;
    if (location) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (address !== undefined) updateData.address = address;
    if (status && userRole === "admin") updateData.status = status;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }
    ).populate([
        { path: "userId", select: "name email phone" },
        { path: "serviceId", select: "name description duration price category" },
        { path: "stylistId", select: "name specialties rating" }
    ]);

    res.status(200).json(
        new ApiResponse(200, updatedAppointment, "Appointment updated successfully")
    );
});

// Cancel appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { cancellationReason } = req.body;

    const query = { _id: appointmentId };
    
    // If not admin, only allow access to own appointments
    if (userRole !== "admin") {
        query.userId = userId;
    }

    const appointment = await Appointment.findOne(query);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Check if appointment can be cancelled
    if (appointment.status === "cancelled") {
        throw new ApiError(400, "Appointment is already cancelled");
    }

    if (appointment.status === "completed") {
        throw new ApiError(400, "Cannot cancel completed appointments");
    }

    // Check if appointment can be cancelled (at least 2 hours before)
    const appointmentDateTime = new Date(`${appointment.date.toDateString()} ${appointment.timeSlot}`);
    const twoHoursBefore = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000));
    
    if (new Date() > twoHoursBefore && userRole !== "admin") {
        throw new ApiError(400, "Appointment cannot be cancelled less than 2 hours before the scheduled time");
    }

    // Update appointment status
    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = userId;

    await appointment.save();

    // Populate appointment for WhatsApp notification
    await appointment.populate([
        { path: "serviceId", select: "name" },
        { path: "userId", select: "name phone" }
    ]);

    // Send WhatsApp cancellation notification if user has phone number
    if (appointment.userId.phone && WhatsAppService.isConfigured()) {
        try {
            const appointmentData = {
                customerName: appointment.userId.name,
                customerPhone: appointment.userId.phone,
                serviceName: appointment.serviceId.name,
                appointmentDate: appointment.date,
                appointmentTime: appointment.timeSlot,
                reason: cancellationReason
            };

            await WhatsAppService.sendAppointmentCancellation(appointmentData);
        } catch (error) {
            console.error('Failed to send WhatsApp cancellation notification:', error.message);
            // Don't fail the cancellation if WhatsApp fails
        }
    }

    res.status(200).json(
        new ApiResponse(200, appointment, "Appointment cancelled successfully")
    );
});

// Get available time slots for a stylist on a specific date
export const getAvailableTimeSlots = asyncHandler(async (req, res) => {
    const { stylistId, date } = req.query;

    if (!stylistId || !date) {
        throw new ApiError(400, "Stylist ID and date are required");
    }

    const stylist = await Stylist.findById(stylistId);
    if (!stylist || !stylist.isActive) {
        throw new ApiError(404, "Stylist not found or inactive");
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    if (!stylist.workingDays.includes(dayOfWeek)) {
        return res.status(200).json(
            new ApiResponse(200, { availableSlots: [] }, "Stylist is not available on this day")
        );
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
        stylistId,
        date: appointmentDate,
        status: { $in: ["pending", "confirmed", "in_progress"] }
    }).select("timeSlot");

    const bookedSlots = existingAppointments.map(apt => apt.timeSlot);

    // Generate available time slots (30-minute intervals)
    const availableSlots = [];
    const startTime = stylist.workingHours.start;
    const endTime = stylist.workingHours.end;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const timeSlot = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        if (!bookedSlots.includes(timeSlot)) {
            availableSlots.push(timeSlot);
        }
    }

    res.status(200).json(
        new ApiResponse(200, { availableSlots }, "Available time slots retrieved successfully")
    );
});

// Get appointment statistics (admin only)
export const getAppointmentStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await Appointment.aggregate([
        { $match: query },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalRevenue: { $sum: "$totalPrice" }
            }
        }
    ]);

    const totalAppointments = await Appointment.countDocuments(query);
    const totalRevenue = await Appointment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            stats,
            totalAppointments,
            totalRevenue: totalRevenue[0]?.total || 0
        }, "Appointment statistics retrieved successfully")
    );
});
