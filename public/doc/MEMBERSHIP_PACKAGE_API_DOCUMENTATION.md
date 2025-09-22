# Membership & Package Management API Documentation

## Overview
This API provides comprehensive functionality for managing salon memberships and packages. It includes admin CRUD operations for packages, public package browsing, and user membership management with purchase, tracking, and cancellation capabilities.

## Base URL
```
http://localhost:8000
```

## Authentication
- **Public Endpoints**: No authentication required (browsing packages)
- **User Endpoints**: Customer/Guest authentication required (membership management)
- **Admin Endpoints**: Admin role required (package and membership management)

## Package Management API

### Public Endpoints

#### GET /packages
Get all packages with filtering and pagination.

**Query Parameters:**
- `isActive` (optional): Filter by active status (boolean)
- `isPopular` (optional): Filter by popular status (boolean)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort field (sortOrder, price, name, createdAt)
- `sortOrder` (optional): Sort direction (asc, desc)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Packages retrieved successfully",
  "data": {
    "packages": [
      {
        "_id": "...",
        "name": "Premium Hair Care Package",
        "description": "Complete hair care package with premium services",
        "price": 2000,
        "discountedPrice": 1600,
        "duration": 3,
        "durationUnit": "months",
        "formattedDuration": "3 months",
        "benefits": [
          "Unlimited hair cuts",
          "Free hair wash",
          "Hair treatment included",
          "Priority booking"
        ],
        "discountPercentage": 20,
        "savingsAmount": 400,
        "maxAppointments": 10,
        "isActive": true,
        "isPopular": true,
        "sortOrder": 1,
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPackages": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /packages/popular
Get popular packages.

**Response:**
```json
{
  "success": true,
  "message": "Popular packages retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Premium Hair Care Package",
      "price": 2000,
      "discountedPrice": 1600,
      "isPopular": true
    }
  ]
}
```

#### GET /packages/price-range
Get packages within a price range.

**Query Parameters:**
- `minPrice` (required): Minimum price
- `maxPrice` (required): Maximum price

**Response:**
```json
{
  "success": true,
  "message": "Packages retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Basic Package",
      "price": 500,
      "discountedPrice": 500
    }
  ]
}
```

#### GET /packages/search
Search packages by name, description, or benefits.

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "packages": [...],
    "pagination": {...},
    "searchQuery": "hair"
  }
}
```

#### GET /packages/:packageId
Get a specific package by ID.

**Response:**
```json
{
  "success": true,
  "message": "Package retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Premium Hair Care Package",
    "description": "Complete hair care package with premium services",
    "price": 2000,
    "discountedPrice": 1600,
    "duration": 3,
    "durationUnit": "months",
    "formattedDuration": "3 months",
    "benefits": [...],
    "services": [...],
    "discountPercentage": 20,
    "savingsAmount": 400,
    "maxAppointments": 10,
    "isActive": true,
    "isPopular": true,
    "sortOrder": 1,
    "termsAndConditions": "Valid for 3 months from purchase date",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Admin Endpoints

#### POST /packages
Create a new package.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Premium Hair Care Package",
  "description": "Complete hair care package with premium services",
  "price": 2000,
  "duration": 3,
  "durationUnit": "months",
  "benefits": [
    "Unlimited hair cuts",
    "Free hair wash",
    "Hair treatment included",
    "Priority booking"
  ],
  "services": ["service_id_1", "service_id_2"],
  "discountPercentage": 20,
  "maxAppointments": 10,
  "isPopular": true,
  "sortOrder": 1,
  "termsAndConditions": "Valid for 3 months from purchase date"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package created successfully",
  "data": {
    "_id": "...",
    "name": "Premium Hair Care Package",
    "description": "Complete hair care package with premium services",
    "price": 2000,
    "discountedPrice": 1600,
    "duration": 3,
    "durationUnit": "months",
    "benefits": [...],
    "services": [...],
    "discountPercentage": 20,
    "maxAppointments": 10,
    "isActive": true,
    "isPopular": true,
    "sortOrder": 1,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PUT /packages/:packageId
Update a package.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Updated Package Name",
  "price": 2500,
  "discountPercentage": 25
}
```

#### DELETE /packages/:packageId
Delete a package permanently.

**Authentication:** Required (Admin)

#### PATCH /packages/:packageId/deactivate
Deactivate a package.

**Authentication:** Required (Admin)

#### PATCH /packages/:packageId/reactivate
Reactivate a package.

**Authentication:** Required (Admin)

#### PATCH /packages/:packageId/toggle-popular
Toggle popular status of a package.

**Authentication:** Required (Admin)

#### PATCH /packages/:packageId/sort-order
Update package sort order.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "sortOrder": 5
}
```

#### GET /packages/admin/stats
Get package statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Package statistics retrieved successfully",
  "data": {
    "overview": {
      "totalPackages": 25,
      "activePackages": 23,
      "popularPackages": 5,
      "averagePrice": 1200.50,
      "minPrice": 200,
      "maxPrice": 5000,
      "totalRevenue": 30000
    },
    "durationStats": [
      {
        "_id": "months",
        "count": 15,
        "averageDuration": 3.5,
        "averagePrice": 1500
      }
    ],
    "discountStats": [
      {
        "_id": "No Discount",
        "count": 10,
        "averagePrice": 800
      },
      {
        "_id": "0-10%",
        "count": 8,
        "averagePrice": 1200
      }
    ]
  }
}
```

## Membership Management API

### User Endpoints

#### GET /memberships/my/active
Get user's active memberships.

**Authentication:** Required (Customer/Guest)

**Response:**
```json
{
  "success": true,
  "message": "Active memberships retrieved successfully",
  "data": [
    {
      "_id": "...",
      "packageId": {
        "_id": "...",
        "name": "Premium Hair Care Package",
        "description": "Complete hair care package",
        "benefits": [...]
      },
      "packageName": "Premium Hair Care Package",
      "startDate": "2024-01-01T10:00:00.000Z",
      "expiryDate": "2024-04-01T10:00:00.000Z",
      "isActive": true,
      "paymentStatus": "paid",
      "amountPaid": 1600,
      "remainingAppointments": 8,
      "usedAppointments": 2,
      "daysRemaining": 45,
      "status": "active"
    }
  ]
}
```

#### GET /memberships/my/all
Get user's all memberships with filtering.

**Authentication:** Required (Customer/Guest)

**Query Parameters:**
- `status` (optional): Filter by status (active, expired, pending_payment, expiring_soon)
- `page` (optional): Page number
- `limit` (optional): Items per page

#### GET /memberships/my/:membershipId
Get a specific membership.

**Authentication:** Required (Customer/Guest)

#### POST /memberships/purchase
Purchase a membership.

**Authentication:** Required (Customer/Guest)

**Request Body:**
```json
{
  "packageId": "package_id_here",
  "paymentMethod": "razorpay",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Membership purchased successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "packageId": {
      "_id": "...",
      "name": "Premium Hair Care Package",
      "description": "Complete hair care package",
      "price": 2000,
      "duration": 3,
      "durationUnit": "months",
      "benefits": [...]
    },
    "packageName": "Premium Hair Care Package",
    "startDate": "2024-01-01T10:00:00.000Z",
    "expiryDate": "2024-04-01T10:00:00.000Z",
    "isActive": true,
    "paymentStatus": "pending",
    "amountPaid": 1600,
    "discountApplied": 400,
    "remainingAppointments": 10,
    "benefits": [...],
    "notes": "Optional notes",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PATCH /memberships/:membershipId/payment-status
Update payment status.

**Authentication:** Required (Customer/Guest)

**Request Body:**
```json
{
  "paymentStatus": "paid",
  "paymentId": "pay_123456789"
}
```

#### PATCH /memberships/my/:membershipId/cancel
Cancel a membership.

**Authentication:** Required (Customer/Guest)

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

#### PATCH /memberships/my/:membershipId/extend
Extend a membership.

**Authentication:** Required (Customer/Guest)

**Request Body:**
```json
{
  "additionalDays": 30
}
```

#### PATCH /memberships/my/:membershipId/use-appointment
Use an appointment (reduce remaining appointments).

**Authentication:** Required (Customer/Guest)

#### GET /memberships/my/stats
Get user's membership statistics.

**Authentication:** Required (Customer/Guest)

**Response:**
```json
{
  "success": true,
  "message": "Membership statistics retrieved successfully",
  "data": {
    "overview": {
      "totalMemberships": 5,
      "activeMemberships": 2,
      "totalSpent": 8000,
      "totalAppointmentsUsed": 15,
      "totalAppointmentsRemaining": 25
    },
    "recentMemberships": [
      {
        "_id": "...",
        "packageId": {
          "_id": "...",
          "name": "Premium Package",
          "price": 2000
        },
        "startDate": "2024-01-01T10:00:00.000Z",
        "expiryDate": "2024-04-01T10:00:00.000Z",
        "amountPaid": 1600
      }
    ]
  }
}
```

### Admin Endpoints

#### GET /memberships/admin/all
Get all memberships with filtering.

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (optional): Filter by status (active, expired, expiring_soon)
- `userId` (optional): Filter by user ID
- `packageId` (optional): Filter by package ID
- `paymentStatus` (optional): Filter by payment status
- `page` (optional): Page number
- `limit` (optional): Items per page

#### GET /memberships/admin/:membershipId
Get membership by ID.

**Authentication:** Required (Admin)

#### PUT /memberships/admin/:membershipId
Update membership.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "paymentStatus": "paid",
  "paymentId": "pay_123456789",
  "amountPaid": 1600,
  "remainingAppointments": 8,
  "notes": "Updated by admin"
}
```

#### PATCH /memberships/admin/:membershipId/cancel
Cancel membership (admin).

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "reason": "Policy violation"
}
```

#### GET /memberships/admin/stats
Get membership statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Membership statistics retrieved successfully",
  "data": {
    "overview": {
      "totalMemberships": 150,
      "activeMemberships": 120,
      "expiredMemberships": 25,
      "expiringSoon": 5,
      "totalRevenue": 240000
    },
    "packageStats": [
      {
        "_id": "Premium Hair Care Package",
        "count": 45,
        "totalRevenue": 72000,
        "averageAmount": 1600
      }
    ],
    "monthlyStats": [
      {
        "_id": { "year": 2024, "month": 1 },
        "count": 25,
        "revenue": 40000
      }
    ]
  }
}
```

#### GET /memberships/admin/search
Search memberships.

**Authentication:** Required (Admin)

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

## Data Models

### Package Model
```javascript
{
  name: String, // Required, unique
  description: String, // Required
  price: Number, // Required, min: 0
  duration: Number, // Required, min: 1
  durationUnit: String, // Enum: days, weeks, months, years
  benefits: [String], // Array of benefit descriptions
  services: [ObjectId], // References to Service model
  discountPercentage: Number, // 0-100, default: 0
  maxAppointments: Number, // null = unlimited
  isActive: Boolean, // default: true
  isPopular: Boolean, // default: false
  sortOrder: Number, // default: 0
  termsAndConditions: String
}
```

### Membership Model
```javascript
{
  userId: ObjectId, // Reference to User
  packageId: ObjectId, // Reference to Package
  packageName: String, // Cached package name
  description: String, // Cached package description
  startDate: Date, // Required
  expiryDate: Date, // Required
  isActive: Boolean, // default: true
  paymentStatus: String, // Enum: pending, paid, failed, refunded
  paymentId: String, // Payment gateway ID
  paymentMethod: String, // Enum: razorpay, cash, card, upi, wallet
  amountPaid: Number, // Required
  discountApplied: Number, // default: 0
  remainingAppointments: Number, // null = unlimited
  usedAppointments: Number, // default: 0
  benefits: [String], // Cached package benefits
  notes: String,
  activatedBy: ObjectId, // Reference to User
  activatedAt: Date,
  cancelledAt: Date,
  cancelledBy: ObjectId, // Reference to User
  cancellationReason: String
}
```

## Business Rules

### Package Management
- Package names must be unique
- Duration must be positive
- Discount percentage must be between 0-100
- Packages can be deactivated instead of deleted
- Popular packages are highlighted in listings

### Membership Management
- Users can only have one active membership per package
- Memberships are created with pending payment status
- Payment status must be updated to 'paid' for activation
- Appointments are tracked if package has maxAppointments limit
- Memberships can be extended by additional days
- Cancelled memberships cannot be reactivated

### Payment Integration
- Supports multiple payment methods
- Payment status tracking
- Refund capability
- Payment ID storage for reconciliation

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
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Usage Examples

### Purchase a Membership
```bash
curl -X POST http://localhost:8000/memberships/purchase \
  -H "Authorization: Bearer <customer-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "64a1b2c3d4e5f6789012345",
    "paymentMethod": "razorpay",
    "notes": "Looking forward to the services"
  }'
```

### Update Payment Status
```bash
curl -X PATCH http://localhost:8000/memberships/64a1b2c3d4e5f6789012346/payment-status \
  -H "Authorization: Bearer <customer-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "paid",
    "paymentId": "pay_123456789"
  }'
```

### Create a Package (Admin)
```bash
curl -X POST http://localhost:8000/packages \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Spa Package",
    "description": "Complete spa experience with premium treatments",
    "price": 5000,
    "duration": 6,
    "durationUnit": "months",
    "benefits": [
      "Unlimited spa sessions",
      "Premium products included",
      "Personal consultation",
      "Priority booking"
    ],
    "discountPercentage": 15,
    "maxAppointments": 20,
    "isPopular": true
  }'
```

### Get User's Active Memberships
```bash
curl -X GET http://localhost:8000/memberships/my/active \
  -H "Authorization: Bearer <customer-token>"
```

### Get Membership Statistics (Admin)
```bash
curl -X GET http://localhost:8000/memberships/admin/stats \
  -H "Authorization: Bearer <admin-token>"
```

## Testing

### Run Tests
```bash
# Test all membership and package endpoints
npm run test:membership

# Test specific functionality
npm run test:api
npm run test:products
npm run test:cart-order
npm run test:services-stylists
npm run test:auth
```

This API provides a complete solution for managing salon memberships and packages, enabling customers to browse and purchase memberships while giving admins full control over package management and membership oversight.

