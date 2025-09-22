# Complete Salon Management API Setup Guide

## Overview
This guide covers the complete setup and usage of the Salon Management API, which includes:
- User Authentication & Authorization
- Appointment Booking System
- Service Management
- Stylist Management
- Product Management
- Review System

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
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
   MONGODB_URI=mongodb://localhost:27017/salon-management
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-here
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here
   
   # Token Expiry
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=7d
   
   # Server
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
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

### 2. Create Sample Services
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

### 3. Create Sample Stylists
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

### 4. Create Sample Products
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

## Testing the API

### 1. Run Test Scripts
```bash
# Test appointment API
npm run test:api

# Test product API
npm run test:products
```

### 2. Manual Testing with Postman/Insomnia
Import the following collections:
- Authentication endpoints
- Appointment management
- Product management
- Service and stylist management

## Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (customer, admin)
- Secure password hashing
- Token refresh mechanism

### 📅 Appointment Management
- Book appointments with conflict checking
- Time slot availability
- Location-based services (home/salon)
- Cancellation with business rules
- Status management
- Admin oversight

### 🛍️ Product Management
- Complete CRUD operations
- Inventory management
- Stock tracking and alerts
- Product reviews and ratings
- Advanced search and filtering
- Category management
- Discount management

### 👥 User Management
- User registration and login
- Profile management
- Role-based permissions
- Account activation/deactivation

### 📊 Analytics & Reporting
- Appointment statistics
- Product analytics
- Low stock alerts
- Revenue tracking
- Category insights

## Business Rules

### Appointments
- Can only be scheduled for future dates
- No double-booking for stylists
- Users cannot have multiple appointments at the same time
- Cancellation allowed up to 2 hours before appointment
- Location-based availability

### Products
- SKU must be unique
- Stock cannot be negative
- Low stock alerts at reorder level
- Users can only review products once
- Discount dates must be valid

### Users
- Email must be unique
- Password minimum 6 characters
- Role-based access control
- Account can be deactivated

## Security Features

1. **Input Validation**
   - Comprehensive validation using express-validator
   - SQL injection prevention
   - XSS prevention

2. **Authentication**
   - JWT token validation
   - Role-based access control
   - Secure password hashing

3. **Data Protection**
   - Sensitive data exclusion
   - Input sanitization
   - Error handling

## Performance Optimizations

1. **Database Indexes**
   - Optimized queries for all models
   - Text search indexes
   - Compound indexes for filtering

2. **Pagination**
   - All list endpoints support pagination
   - Configurable page sizes
   - Efficient skip/limit queries

3. **Caching Considerations**
   - Featured products
   - Category statistics
   - Service lists

## Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salon-management
ACCESS_TOKEN_SECRET=your-production-secret-key
REFRESH_TOKEN_SECRET=your-production-refresh-secret
PORT=8000
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Security Considerations
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Add request logging
- Set up monitoring

### 3. Database Considerations
- Use MongoDB Atlas for production
- Set up database backups
- Monitor performance
- Consider sharding for large datasets

### 4. Scaling Considerations
- Use load balancers
- Implement caching (Redis)
- Consider microservices architecture
- Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGODB_URI
   - Ensure MongoDB is running
   - Verify network connectivity

2. **JWT Token Errors**
   - Check token secrets
   - Verify token expiration
   - Ensure proper token format

3. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Check data types

4. **Permission Errors**
   - Verify user role
   - Check authentication token
   - Ensure proper endpoint access

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## API Documentation

- **Appointment API**: `APPOINTMENT_API_DOCUMENTATION.md`
- **Product API**: `PRODUCT_API_DOCUMENTATION.md`
- **Auth API**: `AUTH_API_DOCUMENTATION.md`

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test with provided scripts
4. Verify environment configuration

## License

This project is licensed under the ISC License.
