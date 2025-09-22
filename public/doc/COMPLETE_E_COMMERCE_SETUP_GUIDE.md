# Complete E-Commerce Salon Management API Setup Guide

## Overview
This guide covers the complete setup and usage of the E-Commerce Salon Management API, which includes:
- User Authentication & Authorization
- Appointment Booking System
- Service Management
- Stylist Management
- Product Management
- Shopping Cart System
- Order Management with Razorpay Payment Integration
- Review System

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Razorpay account (for payment processing)
- npm or yarn package manager

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/salon-ecommerce
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-here
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here
   
   # Token Expiry
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=7d
   
   # Server
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

3. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints Overview

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token

### Appointments (`/appointments`)
- `POST /appointments` - Create appointment (Auth required)
- `GET /appointments/my-appointments` - Get user's appointments (Auth required)
- `GET /appointments` - Get all appointments (Admin only)
- `GET /appointments/:id` - Get single appointment (Auth required)
- `PUT /appointments/:id` - Update appointment (Auth required)
- `PATCH /appointments/:id/cancel` - Cancel appointment (Auth required)
- `GET /appointments/time-slots/available` - Get available time slots (Auth required)
- `GET /appointments/stats/overview` - Get statistics (Admin only)

### Services (`/services`)
- `GET /services` - Get all services (Public)
- `GET /services/:id` - Get single service (Public)

### Stylists (`/stylists`)
- `GET /stylists` - Get all stylists (Public)
- `GET /stylists/:id` - Get single stylist (Public)

### Products (`/products`)
- `GET /products` - Get all products (Public)
- `GET /products/search` - Search products (Public)
- `GET /products/featured` - Get featured products (Public)
- `GET /products/categories` - Get categories (Public)
- `GET /products/:id` - Get single product (Public)
- `GET /products/:id/reviews` - Get product reviews (Public)
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)
- `PATCH /products/:id/deactivate` - Deactivate product (Admin only)
- `PATCH /products/:id/reactivate` - Reactivate product (Admin only)
- `PATCH /products/:id/stock` - Update stock (Admin only)
- `POST /products/:id/reviews` - Add review (Auth required)
- `GET /products/admin/low-stock` - Get low stock products (Admin only)
- `GET /products/admin/stats` - Get statistics (Admin only)

### Cart (`/cart`)
- `GET /cart` - Get user's cart (Auth required)
- `GET /cart/summary` - Get cart summary (Auth required)
- `POST /cart/items` - Add item to cart (Auth required)
- `PUT /cart/items/:productId` - Update item quantity (Auth required)
- `DELETE /cart/items/:productId` - Remove item from cart (Auth required)
- `DELETE /cart` - Clear cart (Auth required)
- `POST /cart/discount` - Apply discount code (Auth required)
- `DELETE /cart/discount` - Remove discount code (Auth required)
- `PUT /cart/shipping-address` - Update shipping address (Auth required)

### Orders (`/orders`)
- `POST /orders` - Create order from cart (Auth required)
- `POST /orders/verify-payment` - Verify Razorpay payment (Auth required)
- `GET /orders/my-orders` - Get user's orders (Auth required)
- `GET /orders/:id` - Get single order (Auth required)
- `PATCH /orders/:id/cancel` - Cancel order (Auth required)
- `POST /orders/:id/return` - Request return (Auth required)
- `GET /orders/:id/tracking` - Get order tracking (Auth required)
- `GET /orders/admin/all` - Get all orders (Admin only)
- `PATCH /orders/admin/:id/status` - Update order status (Admin only)
- `PATCH /orders/admin/:id/return` - Process return (Admin only)
- `GET /orders/admin/stats` - Get order statistics (Admin only)

## Razorpay Setup

### 1. Create Razorpay Account
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account
3. Complete KYC verification
4. Get your API keys from the dashboard

### 2. Configure Environment Variables
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

### 3. Test Payment Flow
The API includes mock payment verification for testing. In production, integrate with Razorpay's frontend SDK.

## Database Setup

### 1. Create Admin User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@salon.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Create Sample Products
```bash
curl -X POST http://localhost:8000/products \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Hair Shampoo",
    "category": "hair_care",
    "price": 25.99,
    "stock": 50,
    "description": "Gentle cleansing shampoo for all hair types",
    "imageUrls": ["https://example.com/shampoo1.jpg"],
    "brand": "SalonPro",
    "sku": "SP-HS-001",
    "isFeatured": true
  }'
```

### 3. Create Sample Services
```bash
curl -X POST http://localhost:8000/services \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hair Cut",
    "description": "Professional hair cutting service",
    "duration": 60,
    "price": 500,
    "category": "hair",
    "availableAtHome": false,
    "availableAtSalon": true
  }'
```

### 4. Create Sample Stylists
```bash
curl -X POST http://localhost:8000/stylists \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@salon.com",
    "phone": "+1234567890",
    "specialties": ["hair"],
    "experience": 5,
    "rating": 4.5,
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    },
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "availableForHome": false,
    "availableForSalon": true
  }'
```

## Testing the API

### 1. Run Test Scripts
```bash
# Test appointment API
npm run test:api

# Test product API
npm run test:products

# Test cart and order API
npm run test:cart-order
```

### 2. Manual Testing with Postman/Insomnia
Import the following collections:
- Authentication endpoints
- Appointment management
- Product management
- Cart management
- Order management
- Service and stylist management

## Complete E-Commerce Flow

### 1. Customer Journey
```bash
# 1. Register/Login
POST /auth/register
POST /auth/login

# 2. Browse Products
GET /products
GET /products/search?q=shampoo

# 3. Add to Cart
POST /cart/items
{
  "productId": "64a1b2c3d4e5f6789012345",
  "quantity": 2
}

# 4. Update Cart
PUT /cart/items/:productId
{
  "quantity": 3
}

# 5. Apply Discount
POST /cart/discount
{
  "discountCode": "WELCOME10"
}

# 6. Set Shipping Address
PUT /cart/shipping-address
{
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "phone": "+1234567890"
}

# 7. Create Order
POST /orders
{
  "paymentMethod": "razorpay",
  "notes": "Handle with care"
}

# 8. Verify Payment (after frontend payment)
POST /orders/verify-payment
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "signature": "signature_1234567890"
}

# 9. Track Order
GET /orders/:orderId/tracking
```

### 2. Admin Management
```bash
# 1. Manage Products
POST /products
PUT /products/:id
DELETE /products/:id
PATCH /products/:id/stock

# 2. Manage Orders
GET /orders/admin/all
PATCH /orders/admin/:id/status
PATCH /orders/admin/:id/return

# 3. View Statistics
GET /orders/admin/stats
GET /products/admin/stats
GET /appointments/stats/overview
```

## Key Features

### 🛒 Shopping Cart System
- Add/remove/update items
- Quantity validation
- Stock checking
- Discount code support
- Shipping address management
- Cart persistence

### 💳 Order Management
- Order creation from cart
- Razorpay payment integration
- Order status tracking
- Return/refund processing
- Order history
- Admin order management

### 📦 Product Management
- Complete CRUD operations
- Inventory management
- Stock tracking
- Product reviews
- Category management
- Search and filtering

### 📅 Appointment System
- Book appointments
- Time slot management
- Stylist availability
- Location-based services
- Cancellation policies

### 👥 User Management
- Role-based access control
- Authentication & authorization
- Profile management
- Order history

## Business Rules

### Cart Management
- Users can only have one active cart
- Cart items are validated against product availability
- Stock is checked before adding items
- Cart is cleared after successful order creation

### Order Management
- Orders can only be cancelled if status is "pending" or "confirmed"
- Orders can only be returned within 7 days of delivery
- Stock is updated when order is confirmed
- Automatic refunds for cancellations/returns

### Payment Processing
- Razorpay integration for secure payments
- Payment signature verification
- Automatic refund processing
- Payment status tracking

### Product Management
- SKU uniqueness validation
- Stock level monitoring
- Low stock alerts
- Product activation/deactivation

## Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Secure password hashing

2. **Payment Security**
   - Razorpay signature verification
   - Secure payment processing
   - PCI compliance through Razorpay

3. **Data Validation**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection

4. **API Security**
   - Rate limiting (recommended for production)
   - CORS configuration
   - Error handling without sensitive data exposure

## Performance Optimizations

1. **Database Indexing**
   - Optimized queries for all models
   - Text search indexes
   - Compound indexes for filtering

2. **Caching Strategy**
   - Product lists (Redis recommended)
   - Featured products
   - Category statistics
   - User sessions

3. **Pagination**
   - All list endpoints support pagination
   - Configurable page sizes
   - Efficient skip/limit queries

## Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salon-ecommerce
ACCESS_TOKEN_SECRET=your-production-secret-key
REFRESH_TOKEN_SECRET=your-production-refresh-secret
RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
PORT=8000
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Security Considerations
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Add request logging
- Set up monitoring and alerting

### 3. Database Considerations
- Use MongoDB Atlas for production
- Set up database backups
- Monitor performance
- Consider sharding for large datasets

### 4. Payment Considerations
- Use Razorpay production keys
- Implement webhook handling
- Set up payment monitoring
- Configure refund policies

## Monitoring & Analytics

### 1. Key Metrics to Track
- Order conversion rate
- Average order value
- Cart abandonment rate
- Payment success rate
- Product performance
- User engagement

### 2. Recommended Tools
- Application monitoring (New Relic, DataDog)
- Error tracking (Sentry)
- Analytics (Google Analytics, Mixpanel)
- Log management (ELK Stack, Splunk)

## Troubleshooting

### Common Issues

1. **Razorpay Integration**
   - Verify API keys are correct
   - Check webhook endpoints
   - Ensure proper signature verification

2. **Cart Issues**
   - Check product availability
   - Verify stock levels
   - Clear cart if corrupted

3. **Order Processing**
   - Verify payment status
   - Check order status transitions
   - Monitor stock updates

4. **Database Issues**
   - Check connection string
   - Verify indexes
   - Monitor query performance

## API Documentation

- **Complete API**: `COMPLETE_API_SETUP_GUIDE.md`
- **Appointment API**: `APPOINTMENT_API_DOCUMENTATION.md`
- **Product API**: `PRODUCT_API_DOCUMENTATION.md`
- **Cart & Order API**: `CART_ORDER_API_DOCUMENTATION.md`
- **Auth API**: `AUTH_API_DOCUMENTATION.md`

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test with provided scripts
4. Verify environment configuration
5. Check Razorpay dashboard for payment issues

## License

This project is licensed under the ISC License.
