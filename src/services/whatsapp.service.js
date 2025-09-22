import axios from 'axios';
import moment from 'moment';
import { ApiError } from '../utils/ApiError.js';

class WhatsAppService {
    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        
        if (!this.accessToken || !this.phoneNumberId) {
            console.warn('WhatsApp credentials not configured. WhatsApp notifications will be disabled.');
            this.isConfigured = false;
        } else {
            this.isConfigured = true;
        }
    }

    // Send a simple text message
    async sendTextMessage(to, message) {
        try {
            if (!this.isConfigured) {
                console.log('WhatsApp service not configured, skipping message');
                return { success: false, message: 'WhatsApp service not configured' };
            }

            const response = await axios.post(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: {
                        body: message
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.messages[0].id,
                data: response.data
            };
        } catch (error) {
            console.error('WhatsApp text message error:', error.response?.data || error.message);
            throw new ApiError(500, `Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Send a template message
    async sendTemplateMessage(to, templateName, languageCode = 'en_US', parameters = []) {
        try {
            if (!this.accessToken || !this.phoneNumberId) {
                throw new ApiError(500, 'WhatsApp service not configured');
            }

            const templateData = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            };

            // Add parameters if provided
            if (parameters.length > 0) {
                templateData.template.components = [{
                    type: 'body',
                    parameters: parameters.map(param => ({
                        type: 'text',
                        text: param
                    }))
                }];
            }

            const response = await axios.post(
                `${this.apiUrl}/${this.phoneNumberId}/messages`,
                templateData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.messages[0].id,
                data: response.data
            };
        } catch (error) {
            console.error('WhatsApp template message error:', error.response?.data || error.message);
            throw new ApiError(500, `Failed to send WhatsApp template: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Send appointment confirmation message
    async sendAppointmentConfirmation(appointmentData) {
        const {
            customerName,
            customerPhone,
            serviceName,
            stylistName,
            appointmentDate,
            appointmentTime,
            location,
            appointmentId
        } = appointmentData;

        const formattedDate = moment(appointmentDate).format('MMMM Do, YYYY');
        const formattedTime = moment(appointmentTime, 'HH:mm').format('h:mm A');

        const message = `🎉 *Appointment Confirmed!*

Hello ${customerName}! Your appointment has been confirmed.

📅 *Date:* ${formattedDate}
🕐 *Time:* ${formattedTime}
💇 *Service:* ${serviceName}
👨‍💼 *Stylist:* ${stylistName}
📍 *Location:* ${location}

Your appointment ID is: ${appointmentId}

Please arrive 10 minutes before your scheduled time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Thank you for choosing our salon! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send appointment reminder message
    async sendAppointmentReminder(appointmentData) {
        const {
            customerName,
            customerPhone,
            serviceName,
            stylistName,
            appointmentDate,
            appointmentTime,
            location
        } = appointmentData;

        const formattedDate = moment(appointmentDate).format('MMMM Do, YYYY');
        const formattedTime = moment(appointmentTime, 'HH:mm').format('h:mm A');

        const message = `⏰ *Appointment Reminder*

Hello ${customerName}! This is a friendly reminder about your upcoming appointment.

📅 *Date:* ${formattedDate}
🕐 *Time:* ${formattedTime}
💇 *Service:* ${serviceName}
👨‍💼 *Stylist:* ${stylistName}
📍 *Location:* ${location}

Please arrive 10 minutes before your scheduled time. We're excited to see you! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send appointment cancellation message
    async sendAppointmentCancellation(appointmentData) {
        const {
            customerName,
            customerPhone,
            serviceName,
            appointmentDate,
            appointmentTime,
            reason
        } = appointmentData;

        const formattedDate = moment(appointmentDate).format('MMMM Do, YYYY');
        const formattedTime = moment(appointmentTime, 'HH:mm').format('h:mm A');

        const message = `❌ *Appointment Cancelled*

Hello ${customerName}, your appointment has been cancelled.

📅 *Date:* ${formattedDate}
🕐 *Time:* ${formattedTime}
💇 *Service:* ${serviceName}
${reason ? `📝 *Reason:* ${reason}` : ''}

We apologize for any inconvenience. Please feel free to book a new appointment at your convenience.

Thank you for your understanding! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send order confirmation message
    async sendOrderConfirmation(orderData) {
        const {
            customerName,
            customerPhone,
            orderId,
            totalAmount,
            items,
            deliveryAddress,
            estimatedDelivery
        } = orderData;

        const formattedDate = moment(estimatedDelivery).format('MMMM Do, YYYY');
        const itemsList = items.map(item => `• ${item.name} x${item.quantity} - ₹${item.price}`).join('\n');

        const message = `🛍️ *Order Confirmed!*

Hello ${customerName}! Your order has been confirmed and is being processed.

🆔 *Order ID:* ${orderId}
💰 *Total Amount:* ₹${totalAmount}
📦 *Items:*
${itemsList}
${deliveryAddress ? `📍 *Delivery Address:* ${deliveryAddress}` : ''}
🚚 *Estimated Delivery:* ${formattedDate}

You will receive another message when your order is ready for pickup/delivery.

Thank you for your purchase! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send order status update message
    async sendOrderStatusUpdate(orderData) {
        const {
            customerName,
            customerPhone,
            orderId,
            status,
            trackingNumber,
            estimatedDelivery
        } = orderData;

        const statusMessages = {
            'processing': '🔄 Your order is being processed',
            'shipped': '🚚 Your order has been shipped',
            'out_for_delivery': '🚛 Your order is out for delivery',
            'delivered': '✅ Your order has been delivered',
            'cancelled': '❌ Your order has been cancelled'
        };

        const statusMessage = statusMessages[status] || `📦 Your order status: ${status}`;
        const formattedDate = estimatedDelivery ? moment(estimatedDelivery).format('MMMM Do, YYYY') : '';

        let message = `📦 *Order Update*

Hello ${customerName}!

${statusMessage}

🆔 *Order ID:* ${orderId}
${trackingNumber ? `📋 *Tracking Number:* ${trackingNumber}` : ''}
${formattedDate ? `📅 *Estimated Delivery:* ${formattedDate}` : ''}

Thank you for choosing our salon! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send membership confirmation message
    async sendMembershipConfirmation(membershipData) {
        const {
            customerName,
            customerPhone,
            packageName,
            startDate,
            expiryDate,
            benefits,
            membershipId
        } = membershipData;

        const formattedStartDate = moment(startDate).format('MMMM Do, YYYY');
        const formattedExpiryDate = moment(expiryDate).format('MMMM Do, YYYY');
        const benefitsList = benefits.map(benefit => `• ${benefit}`).join('\n');

        const message = `🎉 *Membership Activated!*

Hello ${customerName}! Your membership has been successfully activated.

📦 *Package:* ${packageName}
🆔 *Membership ID:* ${membershipId}
📅 *Start Date:* ${formattedStartDate}
📅 *Expiry Date:* ${formattedExpiryDate}
🎁 *Benefits:*
${benefitsList}

Welcome to our premium membership program! Enjoy exclusive benefits and special offers.

Thank you for choosing our salon! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send promotional message
    async sendPromotionalMessage(customerData, promotionData) {
        const {
            customerName,
            customerPhone
        } = customerData;

        const {
            title,
            description,
            discountPercentage,
            validUntil,
            promoCode
        } = promotionData;

        const formattedValidUntil = moment(validUntil).format('MMMM Do, YYYY');

        const message = `🎉 *Special Offer!*

Hello ${customerName}! We have an exclusive offer just for you!

🏷️ *${title}*
📝 *${description}*
💰 *Discount:* ${discountPercentage}% OFF
${promoCode ? `🎫 *Promo Code:* ${promoCode}` : ''}
⏰ *Valid Until:* ${formattedValidUntil}

Don't miss out on this amazing deal! Book your appointment now.

Thank you for being a valued customer! 💅✨`;

        return await this.sendTextMessage(customerPhone, message);
    }

    // Send custom message
    async sendCustomMessage(to, message, messageType = 'text') {
        if (messageType === 'text') {
            return await this.sendTextMessage(to, message);
        } else {
            throw new ApiError(400, 'Unsupported message type');
        }
    }

    // Verify webhook
    verifyWebhook(mode, token, challenge) {
        if (mode === 'subscribe' && token === this.verifyToken) {
            return challenge;
        }
        return null;
    }

    // Process incoming webhook
    async processWebhook(body) {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (value?.messages) {
                const message = value.messages[0];
                const contact = value.contacts?.[0];

                return {
                    messageId: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                    text: message.text?.body,
                    contact: contact ? {
                        name: contact.profile?.name,
                        phone: contact.wa_id
                    } : null
                };
            }

            return null;
        } catch (error) {
            console.error('Webhook processing error:', error);
            throw new ApiError(500, 'Failed to process webhook');
        }
    }

    // Get message status
    async getMessageStatus(messageId) {
        try {
            if (!this.accessToken || !this.phoneNumberId) {
                throw new ApiError(500, 'WhatsApp service not configured');
            }

            const response = await axios.get(
                `${this.apiUrl}/${this.phoneNumberId}/messages/${messageId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Get message status error:', error.response?.data || error.message);
            throw new ApiError(500, `Failed to get message status: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Check if WhatsApp service is configured
    isConfigured() {
        return !!(this.accessToken && this.phoneNumberId);
    }

    // Get service status
    getServiceStatus() {
        return {
            configured: this.isConfigured(),
            apiUrl: this.apiUrl,
            phoneNumberId: this.phoneNumberId ? '***' + this.phoneNumberId.slice(-4) : null
        };
    }
}

export default new WhatsAppService();

