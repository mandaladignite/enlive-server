# Services & Stylists Admin API Documentation

## Overview
This API provides comprehensive functionality for managing salon services and stylists with full CRUD operations for admin users. The API supports both public access for browsing services/stylists and admin-only operations for complete management.

## Base URL
```
http://localhost:8000
```

## Authentication
- **Public Endpoints**: No authentication required (browsing services and stylists)
- **Admin Endpoints**: Admin role required (creating, updating, deleting services and stylists)

## Service Management API

### Public Endpoints

#### GET /services
Get all services with filtering and pagination.

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
    "services": [
      {
        "_id": "...",
        "name": "Hair Cut",
        "description": "Professional hair cutting service",
        "duration": 60,
        "price": 500,
        "category": "hair",
        "isActive": true,
        "availableAtHome": false,
        "availableAtSalon": true,
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
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
    "availableAtSalon": true,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Admin Endpoints

#### POST /services
Create a new service.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Hair Coloring",
  "description": "Professional hair coloring service with premium products",
  "duration": 120,
  "price": 800,
  "category": "hair",
  "availableAtHome": false,
  "availableAtSalon": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "...",
    "name": "Hair Coloring",
    "description": "Professional hair coloring service with premium products",
    "duration": 120,
    "price": 800,
    "category": "hair",
    "isActive": true,
    "availableAtHome": false,
    "availableAtSalon": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PUT /services/:serviceId
Update a service.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Premium Hair Coloring",
  "price": 1000,
  "duration": 150
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    // Updated service object
  }
}
```

#### DELETE /services/:serviceId
Delete a service permanently.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": null
}
```

#### PATCH /services/:serviceId/deactivate
Deactivate a service (soft delete).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Service deactivated successfully",
  "data": {
    // Updated service with isActive: false
  }
}
```

#### PATCH /services/:serviceId/reactivate
Reactivate a deactivated service.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Service reactivated successfully",
  "data": {
    // Updated service with isActive: true
  }
}
```

#### GET /services/admin/stats
Get service statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Service statistics retrieved successfully",
  "data": {
    "overview": {
      "totalServices": 25,
      "activeServices": 23,
      "averagePrice": 450.50,
      "averageDuration": 75.5
    },
    "categoryStats": [
      {
        "_id": "hair",
        "count": 10,
        "averagePrice": 600,
        "averageDuration": 90
      },
      {
        "_id": "nails",
        "count": 8,
        "averagePrice": 300,
        "averageDuration": 60
      }
    ],
    "availability": {
      "homeServices": 5,
      "salonServices": 23
    }
  }
}
```

## Stylist Management API

### Public Endpoints

#### GET /stylists
Get all stylists with filtering and pagination.

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
    "stylists": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@salon.com",
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
        "isActive": true,
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
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
    "email": "john@salon.com",
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
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Admin Endpoints

#### POST /stylists
Create a new stylist.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@salon.com",
  "phone": "+1234567891",
  "specialties": ["hair", "makeup"],
  "experience": 3,
  "rating": 4.2,
  "bio": "Creative stylist specializing in hair and makeup",
  "workingHours": {
    "start": "10:00",
    "end": "19:00"
  },
  "workingDays": ["tuesday", "wednesday", "thursday", "friday", "saturday"],
  "availableForHome": true,
  "availableForSalon": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stylist created successfully",
  "data": {
    "_id": "...",
    "name": "Jane Smith",
    "email": "jane@salon.com",
    "phone": "+1234567891",
    "specialties": ["hair", "makeup"],
    "experience": 3,
    "rating": 4.2,
    "bio": "Creative stylist specializing in hair and makeup",
    "workingHours": {
      "start": "10:00",
      "end": "19:00"
    },
    "workingDays": ["tuesday", "wednesday", "thursday", "friday", "saturday"],
    "availableForHome": true,
    "availableForSalon": true,
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PUT /stylists/:stylistId
Update a stylist.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Jane Smith-Wilson",
  "experience": 4,
  "rating": 4.5,
  "workingHours": {
    "start": "09:00",
    "end": "18:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stylist updated successfully",
  "data": {
    // Updated stylist object
  }
}
```

#### DELETE /stylists/:stylistId
Delete a stylist permanently.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Stylist deleted successfully",
  "data": null
}
```

#### PATCH /stylists/:stylistId/deactivate
Deactivate a stylist (soft delete).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Stylist deactivated successfully",
  "data": {
    // Updated stylist with isActive: false
  }
}
```

#### PATCH /stylists/:stylistId/reactivate
Reactivate a deactivated stylist.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Stylist reactivated successfully",
  "data": {
    // Updated stylist with isActive: true
  }
}
```

#### PATCH /stylists/:stylistId/rating
Update stylist rating.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "rating": 4.8
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stylist rating updated successfully",
  "data": {
    // Updated stylist with new rating
  }
}
```

#### GET /stylists/admin/stats
Get stylist statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Stylist statistics retrieved successfully",
  "data": {
    "overview": {
      "totalStylists": 15,
      "activeStylists": 14,
      "averageRating": 4.3,
      "averageExperience": 4.2
    },
    "specialtyStats": [
      {
        "_id": "hair",
        "count": 8,
        "averageRating": 4.4
      },
      {
        "_id": "skincare",
        "count": 5,
        "averageRating": 4.2
      }
    ],
    "availability": {
      "homeStylists": 6,
      "salonStylists": 14
    },
    "experienceDistribution": [
      {
        "_id": "0-1 years",
        "count": 2
      },
      {
        "_id": "1-3 years",
        "count": 4
      },
      {
        "_id": "3-5 years",
        "count": 6
      },
      {
        "_id": "5-10 years",
        "count": 3
      }
    ]
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

### Service Management
- Service names must be unique (case-insensitive)
- Duration must be between 15 and 480 minutes
- Price must be non-negative
- At least one location (home or salon) must be available
- Services can be deactivated instead of deleted

### Stylist Management
- Stylist emails must be unique (case-insensitive)
- Working hours must be valid (start time before end time)
- At least one working day is required
- Rating must be between 0 and 5
- Experience must be non-negative
- Stylists can be deactivated instead of deleted

### Validation Rules
- All required fields must be provided for creation
- Email format validation for stylists
- Phone number format validation
- Time format validation (HH:MM)
- Category and specialty enum validation

## Usage Examples

### Creating a Service (Admin)
```bash
curl -X POST http://localhost:8000/services \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hair Treatment",
    "description": "Deep conditioning hair treatment",
    "duration": 90,
    "price": 600,
    "category": "hair",
    "availableAtHome": false,
    "availableAtSalon": true
  }'
```

### Creating a Stylist (Admin)
```bash
curl -X POST http://localhost:8000/stylists \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Johnson",
    "email": "mike@salon.com",
    "phone": "+1234567892",
    "specialties": ["hair", "nails"],
    "experience": 7,
    "rating": 4.7,
    "bio": "Senior stylist with expertise in hair and nail art",
    "workingHours": {
      "start": "08:00",
      "end": "17:00"
    },
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "availableForHome": true,
    "availableForSalon": true
  }'
```

### Updating a Service (Admin)
```bash
curl -X PUT http://localhost:8000/services/64a1b2c3d4e5f6789012345 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 700,
    "duration": 120
  }'
```

### Deactivating a Stylist (Admin)
```bash
curl -X PATCH http://localhost:8000/stylists/64a1b2c3d4e5f6789012346/deactivate \
  -H "Authorization: Bearer <admin-token>"
```

### Getting Statistics (Admin)
```bash
# Service statistics
curl -X GET http://localhost:8000/services/admin/stats \
  -H "Authorization: Bearer <admin-token>"

# Stylist statistics
curl -X GET http://localhost:8000/stylists/admin/stats \
  -H "Authorization: Bearer <admin-token>"
```

## Admin Panel Integration

### Service Management Features
- Create, edit, and delete services
- Manage service availability (home/salon)
- Set pricing and duration
- Categorize services
- View service statistics
- Activate/deactivate services

### Stylist Management Features
- Create, edit, and delete stylists
- Manage stylist profiles and specialties
- Set working hours and days
- Update ratings and experience
- Manage availability (home/salon)
- View stylist statistics
- Activate/deactivate stylists

### Dashboard Analytics
- Total services and stylists count
- Active vs inactive counts
- Average pricing and ratings
- Category and specialty breakdowns
- Availability statistics
- Experience distribution

This API provides complete admin functionality for managing salon services and stylists, enabling full control over the salon's service offerings and staff management through the admin panel.
