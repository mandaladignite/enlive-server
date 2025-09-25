import WhatsAppService from '../services/whatsapp.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Appointment } from '../models/appointment.model.js';
import { Order } from '../models/order.model.js';
import { Membership } from '../models/membership.model.js';
import { User } from '../models/user.model.js';

// Send appointment confirmation
export const sendAppointmentConfirmation = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { sendReminder = false } = req.body;

    const appointment = await Appointment.findById(appointmentId)
        .populate('userId', 'name phone')
        .populate('serviceId', 'name')
        .populate('stylistId', 'name');

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (!appointment.userId.phone) {
        throw new ApiError(400, 'Customer phone number not available');
    }

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

    let result;
    if (sendReminder) {
        result = await WhatsAppService.sendAppointmentReminder(appointmentData);
    } else {
        result = await WhatsAppService.sendAppointmentConfirmation(appointmentData);
    }

    res.status(200).json(
        new ApiResponse(200, result, 'WhatsApp message sent successfully')
    );
});

// Send appointment cancellation
export const sendAppointmentCancellation = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId)
        .populate('userId', 'name phone')
        .populate('serviceId', 'name');

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (!appointment.userId.phone) {
        throw new ApiError(400, 'Customer phone number not available');
    }

    const appointmentData = {
        customerName: appointment.userId.name,
        customerPhone: appointment.userId.phone,
        serviceName: appointment.serviceId.name,
        appointmentDate: appointment.date,
        appointmentTime: appointment.timeSlot,
        reason
    };

    const result = await WhatsAppService.sendAppointmentCancellation(appointmentData);

    res.status(200).json(
        new ApiResponse(200, result, 'Cancellation message sent successfully')
    );
});

// Send order confirmation
export const sendOrderConfirmation = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate('userId', 'name phone')
        .populate('items.productId', 'name price');

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    if (!order.userId.phone) {
        throw new ApiError(400, 'Customer phone number not available');
    }

    const items = order.items.map(item => ({
        name: item.productId.name,
        quantity: item.quantity,
        price: item.price
    }));

    const orderData = {
        customerName: order.userId.name,
        customerPhone: order.userId.phone,
        orderId: order._id,
        totalAmount: order.totalAmount,
        items,
        deliveryAddress: order.shippingAddress?.formattedAddress,
        estimatedDelivery: order.estimatedDelivery
    };

    const result = await WhatsAppService.sendOrderConfirmation(orderData);

    res.status(200).json(
        new ApiResponse(200, result, 'Order confirmation sent successfully')
    );
});

// Send order status update
export const sendOrderStatusUpdate = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId)
        .populate('userId', 'name phone');

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    if (!order.userId.phone) {
        throw new ApiError(400, 'Customer phone number not available');
    }

    const orderData = {
        customerName: order.userId.name,
        customerPhone: order.userId.phone,
        orderId: order._id,
        status,
        trackingNumber,
        estimatedDelivery
    };

    const result = await WhatsAppService.sendOrderStatusUpdate(orderData);

    res.status(200).json(
        new ApiResponse(200, result, 'Order status update sent successfully')
    );
});

// Send membership confirmation
export const sendMembershipConfirmation = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await Membership.findById(membershipId)
        .populate('userId', 'name phone')
        .populate('packageId', 'name benefits');

    if (!membership) {
        throw new ApiError(404, 'Membership not found');
    }

    if (!membership.userId.phone) {
        throw new ApiError(400, 'Customer phone number not available');
    }

    const membershipData = {
        customerName: membership.userId.name,
        customerPhone: membership.userId.phone,
        packageName: membership.packageName,
        startDate: membership.startDate,
        expiryDate: membership.expiryDate,
        benefits: membership.benefits,
        membershipId: membership._id
    };

    const result = await WhatsAppService.sendMembershipConfirmation(membershipData);

    res.status(200).json(
        new ApiResponse(200, result, 'Membership confirmation sent successfully')
    );
});

// Send promotional message
export const sendPromotionalMessage = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { title, description, discountPercentage, validUntil, promoCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (!user.phone) {
        throw new ApiError(400, 'User phone number not available');
    }

    const customerData = {
        customerName: user.name,
        customerPhone: user.phone
    };

    const promotionData = {
        title,
        description,
        discountPercentage,
        validUntil,
        promoCode
    };

    const result = await WhatsAppService.sendPromotionalMessage(customerData, promotionData);

    res.status(200).json(
        new ApiResponse(200, result, 'Promotional message sent successfully')
    );
});

// Send custom message
export const sendCustomMessage = asyncHandler(async (req, res) => {
    const { to, message, messageType = 'text' } = req.body;

    if (!to || !message) {
        throw new ApiError(400, 'Phone number and message are required');
    }

    const result = await WhatsAppService.sendCustomMessage(to, message, messageType);

    res.status(200).json(
        new ApiResponse(200, result, 'Custom message sent successfully')
    );
});

// Send bulk messages
export const sendBulkMessages = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, 'Messages array is required and cannot be empty');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < messages.length; i++) {
        const messageData = messages[i];
        try {
            const result = await WhatsAppService.sendCustomMessage(
                messageData.to,
                messageData.message,
                messageData.messageType || 'text'
            );
            results.push({
                index: i,
                success: true,
                messageId: result.messageId,
                to: messageData.to
            });
        } catch (error) {
            errors.push({
                index: i,
                success: false,
                error: error.message,
                to: messageData.to
            });
        }
    }

    res.status(200).json(
        new ApiResponse(200, {
            totalMessages: messages.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors
        }, 'Bulk messages processed')
    );
});

// Get WhatsApp service status
export const getServiceStatus = asyncHandler(async (req, res) => {
    const status = WhatsAppService.getServiceStatus();

    res.status(200).json(
        new ApiResponse(200, status, 'WhatsApp service status retrieved')
    );
});

// Get message status
export const getMessageStatus = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const result = await WhatsAppService.getMessageStatus(messageId);

    res.status(200).json(
        new ApiResponse(200, result, 'Message status retrieved successfully')
    );
});

// Webhook verification
export const verifyWebhook = asyncHandler(async (req, res) => {
    const { mode, token, challenge } = req.query;

    const verificationCode = WhatsAppService.verifyWebhook(mode, token, challenge);

    if (verificationCode) {
        res.status(200).send(verificationCode);
    } else {
        res.status(403).send('Forbidden');
    }
});

// Process webhook
export const processWebhook = asyncHandler(async (req, res) => {
    const webhookData = await WhatsAppService.processWebhook(req.body);

    if (webhookData) {
        // Process incoming message
        console.log('Received WhatsApp message:', webhookData);
        
        // Here you can add logic to handle incoming messages
        // For example, auto-replies, customer support, etc.
        
        res.status(200).json(
            new ApiResponse(200, { received: true }, 'Webhook processed successfully')
        );
    } else {
        res.status(200).json(
            new ApiResponse(200, { received: false }, 'No message data found')
        );
    }
});

// Send appointment reminder to all upcoming appointments
export const sendBulkAppointmentReminders = asyncHandler(async (req, res) => {
    const { hoursBefore = 24 } = req.body;

    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + parseInt(hoursBefore));

    const appointments = await Appointment.find({
        date: {
            $gte: new Date(),
            $lte: reminderTime
        },
        status: 'confirmed'
    })
        .populate('userId', 'name phone')
        .populate('serviceId', 'name')
        .populate('stylistId', 'name');

    const results = [];
    const errors = [];

    for (const appointment of appointments) {
        if (appointment.userId.phone) {
            try {
                const appointmentData = {
                    customerName: appointment.userId.name,
                    customerPhone: appointment.userId.phone,
                    serviceName: appointment.serviceId.name,
                    stylistName: appointment.stylistId?.name || 'TBD',
                    appointmentDate: appointment.date,
                    appointmentTime: appointment.timeSlot,
                    location: appointment.location
                };

                const result = await WhatsAppService.sendAppointmentReminder(appointmentData);
                results.push({
                    appointmentId: appointment._id,
                    customerName: appointment.userId.name,
                    success: true,
                    messageId: result.messageId
                });
            } catch (error) {
                errors.push({
                    appointmentId: appointment._id,
                    customerName: appointment.userId.name,
                    success: false,
                    error: error.message
                });
            }
        }
    }

    res.status(200).json(
        new ApiResponse(200, {
            totalAppointments: appointments.length,
            remindersSent: results.length,
            failed: errors.length,
            results,
            errors
        }, 'Bulk appointment reminders processed')
    );
});

// Send promotional message to all customers
export const sendBulkPromotionalMessage = asyncHandler(async (req, res) => {
    const { title, description, discountPercentage, validUntil, promoCode, customerFilter = {} } = req.body;

    const customers = await User.find({
        role: { $in: ['customer', 'guest'] },
        phone: { $exists: true, $ne: null },
        ...customerFilter
    });

    const results = [];
    const errors = [];

    for (const customer of customers) {
        try {
            const customerData = {
                customerName: customer.name,
                customerPhone: customer.phone
            };

            const promotionData = {
                title,
                description,
                discountPercentage,
                validUntil,
                promoCode
            };

            const result = await WhatsAppService.sendPromotionalMessage(customerData, promotionData);
            results.push({
                customerId: customer._id,
                customerName: customer.name,
                success: true,
                messageId: result.messageId
            });
        } catch (error) {
            errors.push({
                customerId: customer._id,
                customerName: customer.name,
                success: false,
                error: error.message
            });
        }
    }

    res.status(200).json(
        new ApiResponse(200, {
            totalCustomers: customers.length,
            messagesSent: results.length,
            failed: errors.length,
            results,
            errors
        }, 'Bulk promotional messages processed')
    );
});






