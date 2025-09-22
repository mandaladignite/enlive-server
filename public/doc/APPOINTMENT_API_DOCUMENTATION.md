# Salon Appointment Booking API Documentation

## Overview
This API provides comprehensive functionality for booking salon appointments with support for both home and salon services. The API includes user authentication, service management, stylist management, and appointment booking with advanced features like time slot availability and conflict checking.

## Base URL
```
http://localhost:8000
```

## Authentication
All appointment-related endpoints require JWT authentication. Include the JWT token in the request headers:
```
Authorization: Bearer <your-jwt-token>
```

## Models

### User Model
- `_id`: ObjectId (auto-generated)
- `name`: String (required, max 50 chars)
- `email`: String (required, unique, valid email)
- `password`: String (required, min 6 chars, hashed)
- `role`: String (enum: "guest", "customer", "admin", default: "customer")
- `phone`: String (optional, valid phone number)
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Service Model
- `_id`: ObjectId (auto-generated)
- `name`: String (required, max 100 chars)
- `description`: String (optional, max 500 chars)
- `duration`: Number (required, 15-480 minutes)
- `price`: Number (required, min 0)
- `category`: String (enum: "hair", "nails", "skincare", "massage", "makeup", "other")
- `isActive`: Boolean (default: true)
- `availableAtHome`: Boolean (default: false)
- `availableAtSalon`: Boolean (default: true)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Stylist Model
- `_id`: ObjectId (auto-generated)
- `name`: String (required, max 50 chars)
- `email`: String (required, unique, valid email)
- `phone`: String (required, valid phone number)
- `specialties`: Array of Strings (enum: "hair", "nails", "skincare", "massage", "makeup", "other")
- `experience`: Number (min 0, default: 0)
- `rating`: Number (0-5, default: 0)
- `bio`: String (optional, max 500 chars)
- `workingHours`: Object with start/end times (HH:MM format)
- `workingDays`: Array of Strings (enum: "monday", "tuesday", etc.)
- `availableForHome`: Boolean (default: false)
- `availableForSalon`: Boolean (default: true)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Appointment Model
- `_id`: ObjectId (auto-generated)
- `userId`: ObjectId (required, ref: User)
- `serviceId`: ObjectId (required, ref: Service)
- `stylistId`: ObjectId (optional, ref: Stylist)
- `date`: Date (required, must be future date)
- `timeSlot`: String (required, HH:MM format)
- `location`: String (enum: "home", "salon", default: "salon")
- `status`: String (enum: "pending", "confirmed", "in_progress", "completed", "cancelled", "no_show", default: "pending")
- `notes`: String (optional, max 500 chars)
- `totalPrice`: Number (required, min 0)
- `address`: Object (optional, for home appointments)
  - `street`: String (optional, max 100 chars)
  - `city`: String (optional, max 50 chars)
  - `state`: String (optional, max 50 chars)
  - `zipCode`: String (optional, max 10 chars)
  - `country`: String (optional, max 50 chars, default: "India")
- `cancellationReason`: String (optional, max 200 chars)
- `cancelledAt`: Date (auto-set on cancellation)
- `cancelledBy`: ObjectId (ref: User, auto-set on cancellation)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## API Endpoints

### Authentication Endpoints
All authentication endpoints are available at `/auth` (see existing AUTH_API_DOCUMENTATION.md)

### Service Endpoints

#### GET /services
Get all services with optional filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by service category
- `isActive` (optional): Filter by active status (boolean)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": {
    "services": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalServices": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /services/:serviceId
Get a specific service by ID.

**Response:**
```json
{
  "success": true,
  "message": "Service retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Hair Cut",
    "description": "Professional hair cutting service",
    "duration": 60,
    "price": 500,
    "category": "hair",
    "isActive": true,
    "availableAtHome": false,
    "availableAtSalon": true
  }
}
```

### Stylist Endpoints

#### GET /stylists
Get all stylists with optional filtering and pagination.

**Query Parameters:**
- `specialty` (optional): Filter by specialty
- `isActive` (optional): Filter by active status (boolean)
- `availableForHome` (optional): Filter by home availability (boolean)
- `availableForSalon` (optional): Filter by salon availability (boolean)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Stylists retrieved successfully",
  "data": {
    "stylists": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalStylists": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /stylists/:stylistId
Get a specific stylist by ID.

**Response:**
```json
{
  "success": true,
  "message": "Stylist retrieved successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "specialties": ["hair", "skincare"],
    "experience": 5,
    "rating": 4.5,
    "bio": "Professional stylist with 5 years experience",
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    },
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "availableForHome": false,
    "availableForSalon": true,
    "isActive": true
  }
}
```

### Appointment Endpoints

#### POST /appointments
Create a new appointment.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "serviceId": "64a1b2c3d4e5f6789012345",
  "stylistId": "64a1b2c3d4e5f6789012346", // optional
  "date": "2024-01-15T00:00:00.000Z",
  "timeSlot": "14:30",
  "location": "salon", // or "home"
  "notes": "Please be gentle with my hair", // optional
  "address": { // required if location is "home"
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "serviceId": {
      "_id": "...",
      "name": "Hair Cut",
      "description": "Professional hair cutting service",
      "duration": 60,
      "price": 500,
      "category": "hair"
    },
    "stylistId": {
      "_id": "...",
      "name": "John Doe",
      "specialties": ["hair"],
      "rating": 4.5
    },
    "date": "2024-01-15T00:00:00.000Z",
    "timeSlot": "14:30",
    "location": "salon",
    "status": "pending",
    "notes": "Please be gentle with my hair",
    "totalPrice": 500,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### GET /appointments/my-appointments
Get current user's appointments.

**Authentication:** Required (Customer/Admin)

**Query Parameters:**
- `status` (optional): Filter by appointment status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field ("date", "createdAt", "status", "totalPrice")
- `sortOrder` (optional): Sort order ("asc", "desc")

**Response:**
```json
{
  "success": true,
  "message": "User appointments retrieved successfully",
  "data": {
    "appointments": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAppointments": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /appointments
Get all appointments (Admin only).

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (optional): Filter by appointment status
- `location` (optional): Filter by location ("home", "salon")
- `stylistId` (optional): Filter by stylist ID
- `date` (optional): Filter by specific date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field ("date", "createdAt", "status", "totalPrice")
- `sortOrder` (optional): Sort order ("asc", "desc")

**Response:**
```json
{
  "success": true,
  "message": "All appointments retrieved successfully",
  "data": {
    "appointments": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalAppointments": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /appointments/:appointmentId
Get a specific appointment.

**Authentication:** Required (Customer/Admin - customers can only access their own appointments)

**Response:**
```json
{
  "success": true,
  "message": "Appointment retrieved successfully",
  "data": {
    "_id": "...",
    "userId": {
      "_id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567890"
    },
    "serviceId": {
      "_id": "...",
      "name": "Hair Cut",
      "description": "Professional hair cutting service",
      "duration": 60,
      "price": 500,
      "category": "hair"
    },
    "stylistId": {
      "_id": "...",
      "name": "John Doe",
      "specialties": ["hair"],
      "rating": 4.5
    },
    "date": "2024-01-15T00:00:00.000Z",
    "timeSlot": "14:30",
    "location": "salon",
    "status": "pending",
    "notes": "Please be gentle with my hair",
    "totalPrice": 500,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PUT /appointments/:appointmentId
Update an appointment.

**Authentication:** Required (Customer/Admin - customers can only update their own appointments)

**Request Body:**
```json
{
  "serviceId": "64a1b2c3d4e5f6789012345", // optional
  "stylistId": "64a1b2c3d4e5f6789012346", // optional
  "date": "2024-01-16T00:00:00.000Z", // optional
  "timeSlot": "15:00", // optional
  "location": "home", // optional
  "notes": "Updated notes", // optional
  "address": { // optional
    "street": "456 Oak Ave",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400002",
    "country": "India"
  },
  "status": "confirmed" // optional, admin only
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    // Updated appointment object
  }
}
```

#### PATCH /appointments/:appointmentId/cancel
Cancel an appointment.

**Authentication:** Required (Customer/Admin - customers can only cancel their own appointments)

**Request Body:**
```json
{
  "cancellationReason": "Change of plans" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    // Updated appointment object with status: "cancelled"
  }
}
```

#### GET /appointments/time-slots/available
Get available time slots for a stylist on a specific date.

**Authentication:** Required (Customer/Admin)

**Query Parameters:**
- `stylistId` (required): Stylist ID
- `date` (required): Date in ISO format

**Response:**
```json
{
  "success": true,
  "message": "Available time slots retrieved successfully",
  "data": {
    "availableSlots": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
  }
}
```

#### GET /appointments/stats/overview
Get appointment statistics (Admin only).

**Authentication:** Required (Admin)

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

**Response:**
```json
{
  "success": true,
  "message": "Appointment statistics retrieved successfully",
  "data": {
    "stats": [
      {
        "_id": "pending",
        "count": 15,
        "totalRevenue": 7500
      },
      {
        "_id": "confirmed",
        "count": 25,
        "totalRevenue": 12500
      },
      {
        "_id": "completed",
        "count": 50,
        "totalRevenue": 25000
      },
      {
        "_id": "cancelled",
        "count": 5,
        "totalRevenue": 2500
      }
    ],
    "totalAppointments": 95,
    "totalRevenue": 47500
  }
}
```

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

## Business Rules

1. **Appointment Scheduling:**
   - Appointments can only be scheduled for future dates
   - Time slots are in 30-minute intervals
   - Stylists can only be booked during their working hours and days
   - No double-booking allowed for the same stylist at the same time
   - Users cannot have multiple appointments at the same time

2. **Cancellation Policy:**
   - Appointments can be cancelled up to 2 hours before the scheduled time
   - Admins can cancel appointments at any time
   - Cancelled appointments cannot be updated

3. **Location Availability:**
   - Services must be available for the selected location (home/salon)
   - Stylists must be available for the selected location
   - Home appointments require a valid address

4. **Status Transitions:**
   - `pending` → `confirmed` → `in_progress` → `completed`
   - Any status can transition to `cancelled`
   - `completed` and `cancelled` appointments cannot be modified

## Rate Limiting
- No specific rate limiting implemented
- Consider implementing rate limiting for production use

## CORS
- CORS is enabled for the configured origin (default: http://localhost:3000)
- Credentials are supported for authentication

## Database Indexes
The following indexes are created for optimal performance:
- `{ userId: 1, date: 1 }` on appointments
- `{ stylistId: 1, date: 1, timeSlot: 1 }` on appointments
- `{ date: 1, status: 1 }` on appointments
