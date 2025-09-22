# WhatsApp API Documentation

## Overview
This API provides comprehensive WhatsApp messaging functionality integrated with your salon management system. It automatically sends notifications for appointments, orders, and memberships, while also supporting custom messaging and promotional campaigns.

## Base URL
```
http://localhost:8000
```

## Authentication
Admin endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Environment Variables
Add these to your `.env` file:
```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

## WhatsApp Business API Setup

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app and select "Business" type
3. Add WhatsApp Business API product

### 2. Get Access Token
1. In your app dashboard, go to WhatsApp > API Setup
2. Generate a permanent access token
3. Copy the access token to your `.env` file

### 3. Get Phone Number ID
1. In WhatsApp > API Setup, find your phone number
2. Copy the Phone Number ID to your `.env` file

### 4. Set Webhook
1. Configure webhook URL: `https://yourdomain.com/whatsapp/webhook`
2. Set verify token in your `.env` file
3. Subscribe to `messages` events

## API Endpoints

### Public Webhook Endpoints

#### GET /whatsapp/webhook
Verify webhook for WhatsApp.

**Query Parameters:**
- `hub.mode` (required): Must be "subscribe"
- `hub.verify_token` (required): Your verify token
- `hub.challenge` (required): Challenge string from WhatsApp

**Response:**
```
challenge_string
```

#### POST /whatsapp/webhook
Process incoming WhatsApp messages.

**Request Body:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "id": "message_id",
          "from": "phone_number",
          "timestamp": "1234567890",
          "type": "text",
          "text": {
            "body": "Hello from WhatsApp!"
          }
        }],
        "contacts": [{
          "profile": {
            "name": "Contact Name"
          },
          "wa_id": "phone_number"
        }]
      }
    }]
  }]
}
```

### Admin Endpoints

#### GET /whatsapp/status
Get WhatsApp service status.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp service status retrieved",
  "data": {
    "configured": true,
    "apiUrl": "https://graph.facebook.com/v18.0",
    "phoneNumberId": "***1234"
  }
}
```

#### POST /whatsapp/send/custom
Send a custom text message.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Hello! This is a custom message from the salon.",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom message sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.xxx",
    "data": {
      "messaging_product": "whatsapp",
      "contacts": [{
        "input": "+1234567890",
        "wa_id": "1234567890"
      }],
      "messages": [{
        "id": "wamid.xxx"
      }]
    }
  }
}
```

#### POST /whatsapp/send/bulk
Send multiple custom messages.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "messages": [
    {
      "to": "+1234567890",
      "message": "Bulk message 1"
    },
    {
      "to": "+1234567891",
      "message": "Bulk message 2"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk messages processed",
  "data": {
    "totalMessages": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "index": 0,
        "success": true,
        "messageId": "wamid.xxx",
        "to": "+1234567890"
      }
    ],
    "errors": []
  }
}
```

### Appointment Notifications

#### POST /whatsapp/appointment/:appointmentId/confirm
Send appointment confirmation message.

**Authentication:** Required (Admin)

**Path Parameters:**
- `appointmentId`: MongoDB ObjectId of the appointment

**Request Body:**
```json
{
  "sendReminder": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.xxx"
  }
}
```

#### POST /whatsapp/appointment/:appointmentId/cancel
Send appointment cancellation message.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

#### POST /whatsapp/appointment/reminders/bulk
Send bulk appointment reminders.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "hoursBefore": 24
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk appointment reminders processed",
  "data": {
    "totalAppointments": 10,
    "remindersSent": 8,
    "failed": 2,
    "results": [
      {
        "appointmentId": "...",
        "customerName": "John Doe",
        "success": true,
        "messageId": "wamid.xxx"
      }
    ],
    "errors": [
      {
        "appointmentId": "...",
        "customerName": "Jane Doe",
        "success": false,
        "error": "Phone number not available"
      }
    ]
  }
}
```

### Order Notifications

#### POST /whatsapp/order/:orderId/confirm
Send order confirmation message.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Order confirmation sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.xxx"
  }
}
```

#### POST /whatsapp/order/:orderId/status
Send order status update message.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-12-30T18:00:00.000Z"
}
```

### Membership Notifications

#### POST /whatsapp/membership/:membershipId/confirm
Send membership confirmation message.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Membership confirmation sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.xxx"
  }
}
```

### Promotional Messages

#### POST /whatsapp/promotional/:userId
Send promotional message to specific user.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Special Offer!",
  "description": "Get 20% off on all hair services this week",
  "discountPercentage": 20,
  "validUntil": "2024-12-31T23:59:59.000Z",
  "promoCode": "HAIR20"
}
```

#### POST /whatsapp/promotional/bulk
Send promotional message to multiple users.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "New Year Special!",
  "description": "Ring in the new year with 30% off all services",
  "discountPercentage": 30,
  "validUntil": "2024-12-31T23:59:59.000Z",
  "promoCode": "NEWYEAR30",
  "customerFilter": {
    "role": "customer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk promotional messages processed",
  "data": {
    "totalCustomers": 100,
    "messagesSent": 95,
    "failed": 5,
    "results": [
      {
        "customerId": "...",
        "customerName": "John Doe",
        "success": true,
        "messageId": "wamid.xxx"
      }
    ],
    "errors": [
      {
        "customerId": "...",
        "customerName": "Jane Doe",
        "success": false,
        "error": "Phone number not available"
      }
    ]
  }
}
```

### Message Management

#### GET /whatsapp/message/:messageId/status
Get message delivery status.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Message status retrieved successfully",
  "data": {
    "id": "wamid.xxx",
    "status": "delivered",
    "timestamp": "1234567890"
  }
}
```

## Message Templates

### Appointment Confirmation
```
🎉 *Appointment Confirmed!*

Hello {customerName}! Your appointment has been confirmed.

📅 *Date:* {formattedDate}
🕐 *Time:* {formattedTime}
💇 *Service:* {serviceName}
👨‍💼 *Stylist:* {stylistName}
📍 *Location:* {location}

Your appointment ID is: {appointmentId}

Please arrive 10 minutes before your scheduled time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Thank you for choosing our salon! 💅✨
```

### Appointment Reminder
```
⏰ *Appointment Reminder*

Hello {customerName}! This is a friendly reminder about your upcoming appointment.

📅 *Date:* {formattedDate}
🕐 *Time:* {formattedTime}
💇 *Service:* {serviceName}
👨‍💼 *Stylist:* {stylistName}
📍 *Location:* {location}

Please arrive 10 minutes before your scheduled time. We're excited to see you! 💅✨
```

### Appointment Cancellation
```
❌ *Appointment Cancelled*

Hello {customerName}, your appointment has been cancelled.

📅 *Date:* {formattedDate}
🕐 *Time:* {formattedTime}
💇 *Service:* {serviceName}
📝 *Reason:* {reason}

We apologize for any inconvenience. Please feel free to book a new appointment at your convenience.

Thank you for your understanding! 💅✨
```

### Order Confirmation
```
🛍️ *Order Confirmed!*

Hello {customerName}! Your order has been confirmed and is being processed.

🆔 *Order ID:* {orderId}
💰 *Total Amount:* ₹{totalAmount}
📦 *Items:*
{itemsList}
📍 *Delivery Address:* {deliveryAddress}
🚚 *Estimated Delivery:* {estimatedDelivery}

You will receive another message when your order is ready for pickup/delivery.

Thank you for your purchase! 💅✨
```

### Order Status Update
```
📦 *Order Update*

Hello {customerName}!

{statusMessage}

🆔 *Order ID:* {orderId}
📋 *Tracking Number:* {trackingNumber}
📅 *Estimated Delivery:* {estimatedDelivery}

Thank you for choosing our salon! 💅✨
```

### Membership Confirmation
```
🎉 *Membership Activated!*

Hello {customerName}! Your membership has been successfully activated.

📦 *Package:* {packageName}
🆔 *Membership ID:* {membershipId}
📅 *Start Date:* {startDate}
📅 *Expiry Date:* {expiryDate}
🎁 *Benefits:*
{benefitsList}

Welcome to our premium membership program! Enjoy exclusive benefits and special offers.

Thank you for choosing our salon! 💅✨
```

### Promotional Message
```
🎉 *Special Offer!*

Hello {customerName}! We have an exclusive offer just for you!

🏷️ *{title}*
📝 *{description}*
💰 *Discount:* {discountPercentage}% OFF
🎫 *Promo Code:* {promoCode}
⏰ *Valid Until:* {validUntil}

Don't miss out on this amazing deal! Book your appointment now.

Thank you for being a valued customer! 💅✨
```

## Automatic Notifications

### Appointment System Integration
- **Appointment Creation**: Automatically sends confirmation when appointment is created
- **Appointment Cancellation**: Sends cancellation notification when appointment is cancelled
- **Manual Triggers**: Admin can manually send confirmations and reminders

### Order System Integration
- **Order Creation**: Automatically sends confirmation when order is placed
- **Status Updates**: Sends notification when order status changes
- **Tracking Updates**: Includes tracking information when available

### Membership System Integration
- **Membership Purchase**: Automatically sends confirmation when membership is purchased
- **Manual Triggers**: Admin can manually send membership confirmations

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalidValue"
    }
  ]
}
```

### WhatsApp Service Errors
- **Service Not Configured**: When WhatsApp credentials are missing
- **Invalid Phone Number**: When phone number format is incorrect
- **Message Send Failed**: When WhatsApp API returns an error
- **Rate Limiting**: When too many messages are sent too quickly

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Send Custom Message
```bash
curl -X POST http://localhost:8000/whatsapp/send/custom \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hello! This is a test message from the salon API."
  }'
```

### Send Appointment Confirmation
```bash
curl -X POST http://localhost:8000/whatsapp/appointment/64a1b2c3d4e5f6789012345/confirm \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Send Bulk Promotional Message
```bash
curl -X POST http://localhost:8000/whatsapp/promotional/bulk \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Special!",
    "description": "Get 25% off on all summer services",
    "discountPercentage": 25,
    "validUntil": "2024-08-31T23:59:59.000Z",
    "promoCode": "SUMMER25"
  }'
```

### Send Order Status Update
```bash
curl -X POST http://localhost:8000/whatsapp/order/64a1b2c3d4e5f6789012345/status \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TRK123456789",
    "estimatedDelivery": "2024-12-30T18:00:00.000Z"
  }'
```

## Testing

### Run Tests
```bash
# Test all WhatsApp endpoints
npm run test:whatsapp

# Test specific functionality
npm run test:api
npm run test:products
npm run test:cart-order
npm run test:services-stylists
npm run test:auth
npm run test:membership
npm run test:profile
npm run test:gallery
```

### Test Coverage
- WhatsApp service configuration and status
- Custom message sending (single and bulk)
- Appointment notification integration
- Order notification integration
- Membership notification integration
- Promotional message campaigns
- Webhook verification and processing
- Error handling and validation

## Best Practices

### Message Content
- Keep messages concise and clear
- Use emojis sparingly and appropriately
- Include relevant information (dates, times, IDs)
- Provide clear call-to-action when needed
- Use proper formatting with asterisks for bold text

### Timing
- Send appointment reminders 24 hours before
- Send order confirmations immediately after creation
- Send status updates as soon as status changes
- Avoid sending messages outside business hours

### Error Handling
- Always check if WhatsApp service is configured
- Handle phone number validation
- Implement retry logic for failed messages
- Log errors for debugging
- Don't fail main operations if WhatsApp fails

### Rate Limiting
- Respect WhatsApp rate limits
- Implement queuing for bulk messages
- Monitor API usage and costs
- Use bulk endpoints for multiple recipients

This WhatsApp API provides a complete solution for automated customer communication, ensuring your salon stays connected with customers through their preferred messaging platform while maintaining professional and engaging communication.

