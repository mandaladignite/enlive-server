import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { 
    createRazorpayOrder, 
    verifyPaymentSignature, 
    capturePayment,
    refundPayment,
    calculateShippingCharges,
    calculateTax,
    generatePaymentReceipt
} from "../utils/razorpay.js";
import WhatsAppService from "../services/whatsapp.service.js";

// Create order from cart
export const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { paymentMethod = 'razorpay', notes = '' } = req.body;

    // Get user's cart
    const cart = await Cart.getCartWithProducts(userId);
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    // Validate shipping address
    if (!cart.shippingAddress || !cart.shippingAddress.street) {
        throw new ApiError(400, "Shipping address is required");
    }

    // Calculate order totals
    const subtotal = cart.totalAmount;
    const discount = cart.discount;
    const shippingCharges = calculateShippingCharges(subtotal - discount, cart.shippingAddress);
    const tax = calculateTax(subtotal - discount);
    const totalAmount = subtotal - discount + shippingCharges + tax;

    // Create order items
    const orderItems = cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.imageUrls[0] || '',
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity
    }));

    // Create order
    const order = new Order({
        userId,
        items: orderItems,
        totalItems: cart.totalItems,
        subtotal,
        discount,
        discountCode: cart.discountCode,
        shippingCharges,
        tax,
        totalAmount,
        status: 'pending',
        shippingAddress: cart.shippingAddress,
        paymentDetails: {
            method: paymentMethod,
            status: 'pending',
            amount: totalAmount,
            currency: 'INR'
        },
        notes
    });

    await order.save();

    // Create Razorpay order if payment method is razorpay
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
        const razorpayResult = await createRazorpayOrder(
            totalAmount,
            'INR',
            order.orderNumber
        );

        if (!razorpayResult.success) {
            throw new ApiError(400, `Payment initialization failed: ${razorpayResult.error}`);
        }

        razorpayOrder = razorpayResult.order;
        
        // Update order with Razorpay order ID
        order.paymentDetails.razorpayOrderId = razorpayOrder.id;
        await order.save();
    }

    // Clear cart after successful order creation
    await cart.clearCart();

    // Populate order for WhatsApp notification
    await order.populate('userId', 'name phone');

    // Send WhatsApp order confirmation if user has phone number
    if (order.userId.phone && WhatsAppService.isConfigured()) {
        try {
            const orderData = {
                customerName: order.userId.name,
                customerPhone: order.userId.phone,
                orderId: order._id,
                totalAmount: order.totalAmount,
                items: orderItems.map(item => ({
                    name: item.productName,
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryAddress: order.shippingAddress?.formattedAddress,
                estimatedDelivery: order.estimatedDelivery
            };

            await WhatsAppService.sendOrderConfirmation(orderData);
        } catch (error) {
            console.error('Failed to send WhatsApp order confirmation:', error.message);
            // Don't fail the order creation if WhatsApp fails
        }
    }

    res.status(201).json(
        new ApiResponse(201, {
            order,
            razorpayOrder,
            paymentKey: process.env.RAZORPAY_KEY_ID
        }, "Order created successfully")
    );
});

// Verify payment and update order
export const verifyPayment = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
        throw new ApiError(400, "Order ID, Payment ID, and Signature are required");
    }

    // Find order
    const order = await Order.findOne({ 
        userId, 
        'paymentDetails.razorpayOrderId': orderId 
    });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Verify payment signature
    const verification = verifyPaymentSignature(orderId, paymentId, signature);
    if (!verification.success) {
        throw new ApiError(400, "Invalid payment signature");
    }

    // Update payment details
    await order.updatePaymentStatus('completed', paymentId, signature);

    // Update order status to confirmed
    await order.updateStatus('confirmed');

    // Update product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } }
        );
    }

    res.status(200).json(
        new ApiResponse(200, {
            order,
            receipt: generatePaymentReceipt(order)
        }, "Payment verified and order confirmed successfully")
    );
});

// Get user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { userId };
    if (status) {
        query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
        .populate('items.productId', 'name imageUrls brand category')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "User orders retrieved successfully")
    );
});

// Get single order
export const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = { _id: orderId };
    
    // If not admin, only allow access to own orders
    if (userRole !== "admin") {
        query.userId = userId;
    }

    const order = await Order.findOne(query)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name imageUrls brand category description');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(
        new ApiResponse(200, order, "Order retrieved successfully")
    );
});

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    const { reason = 'Customer request' } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.canBeCancelled) {
        throw new ApiError(400, "Order cannot be cancelled");
    }

    // Update order status
    await order.updateStatus('cancelled', userId);
    order.cancellationReason = reason;
    await order.save();

    // Restore product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
        );
    }

    // Process refund if payment was completed
    if (order.paymentDetails.status === 'completed' && order.paymentDetails.razorpayPaymentId) {
        const refundResult = await refundPayment(
            order.paymentDetails.razorpayPaymentId,
            order.totalAmount,
            { reason: 'Order cancelled' }
        );

        if (refundResult.success) {
            await order.processRefund(order.totalAmount, 'Order cancelled');
        }
    }

    res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});

// Request return
export const requestReturn = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError(400, "Return reason is required");
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.canBeReturned) {
        throw new ApiError(400, "Order cannot be returned");
    }

    await order.requestReturn(reason);

    res.status(200).json(
        new ApiResponse(200, order, "Return request submitted successfully")
    );
});

// Get order tracking info
export const getOrderTracking = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = { _id: orderId };
    
    // If not admin, only allow access to own orders
    if (userRole !== "admin") {
        query.userId = userId;
    }

    const order = await Order.findOne(query)
        .select('orderNumber status trackingNumber estimatedDelivery deliveredAt createdAt');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const trackingInfo = {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        orderDate: order.createdAt,
        statusHistory: getStatusHistory(order)
    };

    res.status(200).json(
        new ApiResponse(200, trackingInfo, "Order tracking information retrieved successfully")
    );
});

// Admin: Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
    const { 
        status, 
        paymentStatus, 
        userId, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query['paymentDetails.status'] = paymentStatus;
    if (userId) query.userId = userId;
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name imageUrls brand category')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, "All orders retrieved successfully")
    );
});

// Admin: Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Update order status
    await order.updateStatus(status);

    // Update tracking information
    if (trackingNumber) {
        order.trackingNumber = trackingNumber;
    }
    if (estimatedDelivery) {
        order.estimatedDelivery = new Date(estimatedDelivery);
    }

    await order.save();

    // Populate order for WhatsApp notification
    await order.populate('userId', 'name phone');

    // Send WhatsApp status update if user has phone number
    if (order.userId.phone && WhatsAppService.isConfigured()) {
        try {
            const orderData = {
                customerName: order.userId.name,
                customerPhone: order.userId.phone,
                orderId: order._id,
                status,
                trackingNumber,
                estimatedDelivery
            };

            await WhatsAppService.sendOrderStatusUpdate(orderData);
        } catch (error) {
            console.error('Failed to send WhatsApp status update:', error.message);
            // Don't fail the status update if WhatsApp fails
        }
    }

    res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

// Admin: Process return
export const processReturn = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
        throw new ApiError(400, "Action must be 'approve' or 'reject'");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.returnStatus !== 'requested') {
        throw new ApiError(400, "No return request found for this order");
    }

    order.returnStatus = action === 'approve' ? 'approved' : 'rejected';
    
    if (action === 'approve') {
        // Process refund
        if (order.paymentDetails.status === 'completed' && order.paymentDetails.razorpayPaymentId) {
            const refundResult = await refundPayment(
                order.paymentDetails.razorpayPaymentId,
                order.totalAmount,
                { reason: reason || 'Return approved' }
            );

            if (refundResult.success) {
                await order.processRefund(order.totalAmount, reason || 'Return approved');
            }
        }

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } }
            );
        }

        order.status = 'returned';
    }

    await order.save();

    res.status(200).json(
        new ApiResponse(200, order, `Return ${action}d successfully`)
    );
});

// Admin: Get order statistics
export const getOrderStats = asyncHandler(async (req, res) => {
    const { startDate, endDate, userId } = req.query;

    const stats = await Order.getOrderStats(userId, startDate, endDate);

    res.status(200).json(
        new ApiResponse(200, stats, "Order statistics retrieved successfully")
    );
});

// Helper function to get status history
const getStatusHistory = (order) => {
    const history = [
        {
            status: 'pending',
            timestamp: order.createdAt,
            description: 'Order placed'
        }
    ];

    if (order.status === 'confirmed' || order.status === 'processing' || 
        order.status === 'shipped' || order.status === 'delivered') {
        history.push({
            status: 'confirmed',
            timestamp: order.updatedAt,
            description: 'Order confirmed'
        });
    }

    if (order.status === 'processing' || order.status === 'shipped' || 
        order.status === 'delivered') {
        history.push({
            status: 'processing',
            timestamp: order.updatedAt,
            description: 'Order being processed'
        });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
        history.push({
            status: 'shipped',
            timestamp: order.updatedAt,
            description: 'Order shipped'
        });
    }

    if (order.status === 'delivered' && order.deliveredAt) {
        history.push({
            status: 'delivered',
            timestamp: order.deliveredAt,
            description: 'Order delivered'
        });
    }

    if (order.status === 'cancelled' && order.cancelledAt) {
        history.push({
            status: 'cancelled',
            timestamp: order.cancelledAt,
            description: 'Order cancelled'
        });
    }

    return history;
};
