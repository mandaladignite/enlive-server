# Salon Appointment Booking API - Setup Guide

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
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/salon-booking
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
   
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

## Database Setup

The API will automatically create the necessary collections when you start the server. However, you'll need to manually create some initial data:

### 1. Create Admin User
Use the existing auth endpoints to register an admin user:
```bash
POST /auth/register
{
  "name": "Admin User",
  "email": "admin@salon.com",
  "password": "admin123",
  "role": "admin"
}
```

### 2. Create Services
```bash
POST /services (requires admin authentication)
{
  "name": "Hair Cut",
  "description": "Professional hair cutting service",
  "duration": 60,
  "price": 500,
  "category": "hair",
  "availableAtHome": false,
  "availableAtSalon": true
}
```

### 3. Create Stylists
```bash
POST /stylists (requires admin authentication)
{
  "name": "John Doe",
  "email": "john@salon.com",
  "phone": "+1234567890",
  "specialties": ["hair"],
  "experience": 5,
  "rating": 4.5,
  "bio": "Professional stylist with 5 years experience",
  "workingHours": {
    "start": "09:00",
    "end": "18:00"
  },
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "availableForHome": false,
  "availableForSalon": true
}
```

## Testing the API

1. **Run the Test Script**
   ```bash
   npm run test:api
   ```

2. **Manual Testing with Postman/Insomnia**
   - Import the API endpoints from the documentation
   - Start with authentication endpoints
   - Create test data (services, stylists)
   - Test appointment booking flow

## API Endpoints Overview

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token

### Services
- `GET /services` - Get all services
- `GET /services/:id` - Get specific service

### Stylists
- `GET /stylists` - Get all stylists
- `GET /stylists/:id` - Get specific stylist

### Appointments
- `POST /appointments` - Create appointment
- `GET /appointments/my-appointments` - Get user's appointments
- `GET /appointments` - Get all appointments (admin)
- `GET /appointments/:id` - Get specific appointment
- `PUT /appointments/:id` - Update appointment
- `PATCH /appointments/:id/cancel` - Cancel appointment
- `GET /appointments/time-slots/available` - Get available time slots
- `GET /appointments/stats/overview` - Get statistics (admin)

## Features

### ✅ Implemented Features
- JWT-based authentication
- User role management (customer, admin)
- Service management
- Stylist management
- Appointment booking with conflict checking
- Time slot availability checking
- Appointment status management
- Cancellation with business rules
- Pagination and filtering
- Input validation
- Error handling
- Comprehensive API documentation

### 🔧 Business Rules
- Appointments can only be scheduled for future dates
- No double-booking for stylists
- Users cannot have multiple appointments at the same time
- Cancellation allowed up to 2 hours before appointment
- Location-based service and stylist availability
- Working hours and days validation

### 📊 Database Indexes
- Optimized queries with proper indexing
- Efficient appointment lookups
- Performance-optimized for large datasets

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify database permissions

2. **JWT Token Errors**
   - Check ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET
   - Ensure tokens are not expired
   - Verify token format in Authorization header

3. **Validation Errors**
   - Check request body format
   - Ensure required fields are provided
   - Verify data types and constraints

4. **Permission Errors**
   - Verify user role for admin-only endpoints
   - Check authentication token
   - Ensure user is active

### Logs
Check the console output for detailed error messages and stack traces.

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Implement rate limiting
   - Add request validation middleware
   - Use HTTPS in production

2. **Performance**
   - Implement caching for frequently accessed data
   - Add database connection pooling
   - Consider CDN for static assets

3. **Monitoring**
   - Add logging middleware
   - Implement health checks
   - Monitor database performance
   - Set up error tracking

4. **Scalability**
   - Consider horizontal scaling
   - Implement load balancing
   - Use database sharding if needed
   - Add queue system for heavy operations

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test with the provided test script
4. Verify environment configuration
