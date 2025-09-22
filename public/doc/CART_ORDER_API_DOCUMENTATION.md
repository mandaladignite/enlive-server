# Shopping Cart & Order Management API Documentation

## Overview
This API provides comprehensive functionality for shopping cart management and order processing with Razorpay payment integration. It includes cart operations, order placement, payment processing, order tracking, and admin management features.

## Base URL
```
http://localhost:8000
```

## Authentication
All cart and order endpoints require JWT authentication. Include the JWT token in the request headers:
```
Authorization: Bearer <your-jwt-token>
```

## Models

### Cart Model
- `_id`: ObjectId (auto-generated)
- `userId`: ObjectId (required, ref: User, unique)
- `items`: Array of cart items
  - `productId`: ObjectId (required, ref: Product)
  - `quantity`: Number (required, 1-100)
  - `price`: Number (required, min 0)
  - `addedAt`: Date (auto-generated)
- `totalItems`: Number (auto-calculated)
- `totalAmount`: Number (auto-calculated)
- `discount`: Number (default: 0)
- `discountCode`: String (optional, max 20 chars)
- `shippingAddress`: Object (optional)
- `isActive`: Boolean (default: true)

### Order Model
- `_id`: ObjectId (auto-generated)
- `orderNumber`: String (required, unique, auto-generated)
- `userId`: ObjectId (required, ref: User)
- `items`: Array of order items
  - `productId`: ObjectId (required, ref: Product)
  - `productName`: String (required)
  - `productImage`: String (optional)
  - `quantity`: Number (required, min 1)
  - `price`: Number (required, min 0)
  - `totalPrice`: Number (required, min 0)
- `totalItems`: Number (required, min 1)
- `subtotal`: Number (required, min 0)
- `discount`: Number (default: 0)
- `discountCode`: String (optional)
- `shippingCharges`: Number (default: 0)
- `tax`: Number (default: 0)
- `totalAmount`: Number (required, min 0)
- `status`: String (enum: "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned")
- `shippingAddress`: Object (required)
- `paymentDetails`: Object (required)
- `notes`: String (optional, max 500 chars)
- `trackingNumber`: String (optional)
- `estimatedDelivery`: Date (optional)
- `deliveredAt`: Date (optional)
- `cancelledAt`: Date (optional)
- `cancelledBy`: ObjectId (ref: User)
- `cancellationReason`: String (optional)
- `returnRequestedAt`: Date (optional)
- `returnReason`: String (optional)
- `returnStatus`: String (enum: "none", "requested", "approved", "rejected", "completed")

## API Endpoints

### Cart Endpoints

#### GET /cart
Get user's cart with populated products.

**Authentication:** Required (Customer/Admin)

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [
      {
        "productId": {
          "_id": "...",
          "name": "Professional Hair Shampoo",
          "price": 25.99,
          "imageUrls": ["https://example.com/image1.jpg"],
          "brand": "SalonPro",
          "category": "hair_care",
          "stock": 50,
          "isActive": true
        },
        "quantity": 2,
        "price": 25.99,
        "addedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "totalItems": 2,
    "totalAmount": 51.98,
    "discount": 0,
    "discountCode": null,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+1234567890"
    },
    "finalAmount": 51.98,
    "isActive": true
  }
}
```

#### GET /cart/summary
Get cart summary without full product details.

**Authentication:** Required (Customer/Admin)

**Response:**
```json
{
  "success": true,
  "message": "Cart summary retrieved successfully",
  "data": {
    "totalItems": 2,
    "subtotal": 51.98,
    "discount": 0,
    "discountCode": null,
    "finalAmount": 51.98,
    "hasItems": true,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+1234567890"
    }
  }
}
```

#### POST /cart/items
Add item to cart.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "productId": "64a1b2c3d4e5f6789012345",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    // Updated cart with populated products
  }
}
```

#### PUT /cart/items/:productId
Update item quantity in cart.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    // Updated cart with populated products
  }
}
```

#### DELETE /cart/items/:productId
Remove item from cart.

**Authentication:** Required (Customer/Admin)

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    // Updated cart with populated products
  }
}
```

#### DELETE /cart
Clear entire cart.

**Authentication:** Required (Customer/Admin)

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    // Empty cart
  }
}
```

#### POST /cart/discount
Apply discount code to cart.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "discountCode": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    // Updated cart with discount applied
  }
}
```

#### DELETE /cart/discount
Remove discount code from cart.

**Authentication:** Required (Customer/Admin)

**Response:**
```json
{
  "success": true,
  "message": "Discount removed successfully",
  "data": {
    // Updated cart without discount
  }
}
```

#### PUT /cart/shipping-address
Update shipping address in cart.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "phone": "+1234567890",
  "country": "India"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipping address updated successfully",
  "data": {
    // Updated cart with shipping address
  }
}
```

### Order Endpoints

#### POST /orders
Create order from cart.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "paymentMethod": "razorpay",
  "notes": "Please handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD1234567890123",
      "userId": "...",
      "items": [...],
      "totalItems": 2,
      "subtotal": 51.98,
      "discount": 0,
      "shippingCharges": 0,
      "tax": 9.36,
      "totalAmount": 61.34,
      "status": "pending",
      "shippingAddress": {...},
      "paymentDetails": {
        "method": "razorpay",
        "status": "pending",
        "amount": 61.34,
        "currency": "INR",
        "razorpayOrderId": "order_1234567890"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "razorpayOrder": {
      "id": "order_1234567890",
      "amount": 6134,
      "currency": "INR",
      "receipt": "ORD1234567890123",
      "status": "created",
      "created_at": 1642234567
    },
    "paymentKey": "rzp_test_1234567890"
  }
}
```

#### POST /orders/verify-payment
Verify Razorpay payment and confirm order.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "signature": "signature_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and order confirmed successfully",
  "data": {
    "order": {
      // Updated order with confirmed status
    },
    "receipt": {
      "orderNumber": "ORD1234567890123",
      "date": "2024-01-15T10:00:00.000Z",
      "items": [...],
      "subtotal": 51.98,
      "discount": 0,
      "shipping": 0,
      "tax": 9.36,
      "total": 61.34,
      "paymentMethod": "razorpay",
      "paymentStatus": "completed"
    }
  }
}
```

#### GET /orders/my-orders
Get user's orders with pagination and filtering.

**Authentication:** Required (Customer/Admin)

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field ("createdAt", "totalAmount", "status")
- `sortOrder` (optional): Sort order ("asc", "desc")

**Response:**
```json
{
  "success": true,
  "message": "User orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderNumber": "ORD1234567890123",
        "totalAmount": 61.34,
        "status": "confirmed",
        "paymentDetails": {
          "status": "completed",
          "method": "razorpay"
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /orders/:orderId
Get single order details.

**Authentication:** Required (Customer/Admin - customers can only access their own orders)

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "...",
    "orderNumber": "ORD1234567890123",
    "userId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "productId": {
          "_id": "...",
          "name": "Professional Hair Shampoo",
          "imageUrls": ["https://example.com/image1.jpg"],
          "brand": "SalonPro",
          "category": "hair_care"
        },
        "productName": "Professional Hair Shampoo",
        "productImage": "https://example.com/image1.jpg",
        "quantity": 2,
        "price": 25.99,
        "totalPrice": 51.98
      }
    ],
    "totalItems": 2,
    "subtotal": 51.98,
    "discount": 0,
    "shippingCharges": 0,
    "tax": 9.36,
    "totalAmount": 61.34,
    "status": "confirmed",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+1234567890"
    },
    "paymentDetails": {
      "method": "razorpay",
      "status": "completed",
      "razorpayOrderId": "order_1234567890",
      "razorpayPaymentId": "pay_1234567890",
      "amount": 61.34,
      "currency": "INR",
      "paidAt": "2024-01-15T10:05:00.000Z"
    },
    "trackingNumber": "TRK123456789",
    "estimatedDelivery": "2024-01-20T18:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### PATCH /orders/:orderId/cancel
Cancel order.

**Authentication:** Required (Customer/Admin - customers can only cancel their own orders)

**Request Body:**
```json
{
  "reason": "Change of mind"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    // Updated order with cancelled status
  }
}
```

#### POST /orders/:orderId/return
Request order return.

**Authentication:** Required (Customer/Admin - customers can only return their own orders)

**Request Body:**
```json
{
  "reason": "Product damaged"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "data": {
    // Updated order with return request
  }
}
```

#### GET /orders/:orderId/tracking
Get order tracking information.

**Authentication:** Required (Customer/Admin - customers can only track their own orders)

**Response:**
```json
{
  "success": true,
  "message": "Order tracking information retrieved successfully",
  "data": {
    "orderNumber": "ORD1234567890123",
    "status": "shipped",
    "trackingNumber": "TRK123456789",
    "estimatedDelivery": "2024-01-20T18:00:00.000Z",
    "deliveredAt": null,
    "orderDate": "2024-01-15T10:00:00.000Z",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "description": "Order placed"
      },
      {
        "status": "confirmed",
        "timestamp": "2024-01-15T10:05:00.000Z",
        "description": "Order confirmed"
      },
      {
        "status": "shipped",
        "timestamp": "2024-01-16T09:00:00.000Z",
        "description": "Order shipped"
      }
    ]
  }
}
```

### Admin Order Endpoints

#### GET /orders/admin/all
Get all orders with advanced filtering (Admin only).

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order

**Response:**
```json
{
  "success": true,
  "message": "All orders retrieved successfully",
  "data": {
    "orders": [...],
    "pagination": {...}
  }
}
```

#### PATCH /orders/admin/:orderId/status
Update order status (Admin only).

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-01-20T18:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    // Updated order
  }
}
```

#### PATCH /orders/admin/:orderId/return
Process return request (Admin only).

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Valid return request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Return approved successfully",
  "data": {
    // Updated order with return processed
  }
}
```

#### GET /orders/admin/stats
Get order statistics (Admin only).

**Authentication:** Required (Admin)

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics
- `userId` (optional): User ID for user-specific statistics

**Response:**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "overview": {
      "totalOrders": 150,
      "totalRevenue": 125000,
      "averageOrderValue": 833.33,
      "pendingOrders": 15,
      "completedOrders": 120,
      "cancelledOrders": 15
    },
    "statusBreakdown": [
      {
        "_id": "delivered",
        "count": 120,
        "totalAmount": 100000
      },
      {
        "_id": "pending",
        "count": 15,
        "totalAmount": 12500
      }
    ]
  }
}
```

## Razorpay Integration

### Environment Variables
Add these to your `.env` file:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Payment Flow
1. **Create Order**: POST `/orders` creates order and Razorpay order
2. **Frontend Payment**: Use Razorpay SDK with returned order details
3. **Verify Payment**: POST `/orders/verify-payment` verifies and confirms order

### Supported Payment Methods
- Razorpay (online payment)
- COD (Cash on Delivery) - for future implementation
- Wallet - for future implementation
- Card - for future implementation

## Business Rules

### Cart Management
- Users can only have one active cart
- Cart items are automatically removed if product becomes inactive
- Stock validation prevents adding more items than available
- Cart is cleared after successful order creation

### Order Management
- Orders can only be cancelled if status is "pending" or "confirmed"
- Orders can only be returned within 7 days of delivery
- Stock is updated when order is confirmed
- Stock is restored when order is cancelled or returned

### Payment Processing
- Razorpay orders are created with unique receipt numbers
- Payment signatures are verified for security
- Refunds are processed automatically for cancellations/returns
- Payment status is tracked throughout order lifecycle

### Discount System
- Mock discount codes are implemented (WELCOME10, SAVE50, etc.)
- Discounts are applied to cart before order creation
- Discount validation includes minimum order amount requirements

## Error Responses

All error responses follow this format:

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

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Complete Shopping Flow
```bash
# 1. Add items to cart
curl -X POST http://localhost:8000/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "64a1b2c3d4e5f6789012345", "quantity": 2}'

# 2. Update shipping address
curl -X PUT http://localhost:8000/cart/shipping-address \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zipCode": "400001", "phone": "+1234567890"}'

# 3. Create order
curl -X POST http://localhost:8000/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "razorpay", "notes": "Handle with care"}'

# 4. Verify payment (after frontend payment)
curl -X POST http://localhost:8000/orders/verify-payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order_1234567890", "paymentId": "pay_1234567890", "signature": "signature_1234567890"}'
```

### Admin Order Management
```bash
# Get all orders
curl -X GET "http://localhost:8000/orders/admin/all?status=delivered&page=1&limit=10" \
  -H "Authorization: Bearer <admin-token>"

# Update order status
curl -X PATCH http://localhost:8000/orders/admin/64a1b2c3d4e5f6789012345/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped", "trackingNumber": "TRK123456789"}'

# Process return
curl -X PATCH http://localhost:8000/orders/admin/64a1b2c3d4e5f6789012345/return \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "reason": "Valid return request"}'
```
