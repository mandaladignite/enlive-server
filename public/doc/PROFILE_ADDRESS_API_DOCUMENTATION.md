# Profile & Address Management API Documentation

## Overview
This API provides comprehensive functionality for managing user profiles and addresses. Authenticated users can view and update their profile information, manage saved addresses, and perform various address-related operations with full CRUD capabilities.

## Base URL
```
http://localhost:8000
```

## Authentication
All endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Profile Management API

### GET /profile
Get user profile information including default address.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "isActive": true,
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "gender": "male",
      "bio": "Software developer and salon enthusiast",
      "profilePicture": "https://example.com/profile.jpg",
      "preferences": {
        "notifications": true,
        "emailNotifications": true,
        "smsNotifications": false,
        "language": "en",
        "timezone": "Asia/Kolkata",
        "theme": "light"
      },
      "lastLogin": "2024-01-01T10:00:00.000Z",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    "defaultAddress": {
      "_id": "...",
      "label": "Home",
      "formattedAddress": "123 Main Street, Near Central Mall, Mumbai, Maharashtra, 400001, India",
      "shortAddress": "Mumbai, Maharashtra - 400001",
      "isDefault": true
    }
  }
}
```

### PUT /profile
Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bio": "Updated bio information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "...",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567891",
    "role": "customer",
    "isActive": true,
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "gender": "male",
    "bio": "Updated bio information",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### PUT /profile/change-password
Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

### PUT /profile/preferences
Update user preferences.

**Authentication:** Required

**Request Body:**
```json
{
  "notifications": true,
  "emailNotifications": true,
  "smsNotifications": false,
  "language": "en",
  "timezone": "Asia/Kolkata",
  "theme": "light"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User preferences updated successfully",
  "data": {
    "notifications": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "language": "en",
    "timezone": "Asia/Kolkata",
    "theme": "light"
  }
}
```

### GET /profile/stats
Get user statistics.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "addressCount": 3,
    "hasDefaultAddress": true,
    "defaultAddress": {
      "id": "...",
      "label": "Home",
      "shortAddress": "Mumbai, Maharashtra - 400001",
      "isDefault": true,
      "addressType": "home"
    },
    "recentAddresses": [
      {
        "_id": "...",
        "label": "Work",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "isDefault": false,
        "addressType": "work"
      }
    ]
  }
}
```

### PUT /profile/profile-picture
Upload profile picture.

**Authentication:** Required

**Request Body:**
```json
{
  "profilePictureUrl": "https://example.com/profile-picture.jpg"
}
```

### GET /profile/activity
Get user activity log.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET /profile/export
Export user data (GDPR compliance).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User data exported successfully",
  "data": {
    "profile": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      // ... complete user profile
    },
    "addresses": [
      {
        "_id": "...",
        "label": "Home",
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        // ... complete address details
      }
    ],
    "exportDate": "2024-01-01T10:00:00.000Z",
    "dataVersion": "1.0"
  }
}
```

### DELETE /profile/account
Delete user account.

**Authentication:** Required

**Request Body:**
```json
{
  "password": "currentpassword123"
}
```

## Address Management API

### GET /addresses
Get user's addresses.

**Authentication:** Required

**Query Parameters:**
- `includeInactive` (optional): Include inactive addresses (boolean, default: false)

**Response:**
```json
{
  "success": true,
  "message": "User addresses retrieved successfully",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "label": "Home",
      "street": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "landmark": "Near Central Mall",
      "isDefault": true,
      "isActive": true,
      "addressType": "home",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      },
      "contactNumber": "+1234567890",
      "instructions": "Ring the doorbell twice",
      "formattedAddress": "123 Main Street, Apartment 4B, Near Central Mall, Mumbai, Maharashtra, 400001, India",
      "shortAddress": "Mumbai, Maharashtra - 400001",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### GET /addresses/:addressId
Get a specific address.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Address retrieved successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "label": "Home",
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "landmark": "Near Central Mall",
    "isDefault": true,
    "isActive": true,
    "addressType": "home",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "contactNumber": "+1234567890",
    "instructions": "Ring the doorbell twice",
    "formattedAddress": "123 Main Street, Apartment 4B, Near Central Mall, Mumbai, Maharashtra, 400001, India",
    "shortAddress": "Mumbai, Maharashtra - 400001",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### POST /addresses
Create a new address.

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Home",
  "street": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "landmark": "Near Central Mall",
  "isDefault": false,
  "addressType": "home",
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "contactNumber": "+1234567890",
  "instructions": "Ring the doorbell twice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "label": "Home",
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "landmark": "Near Central Mall",
    "isDefault": true,
    "isActive": true,
    "addressType": "home",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "contactNumber": "+1234567890",
    "instructions": "Ring the doorbell twice",
    "formattedAddress": "123 Main Street, Apartment 4B, Near Central Mall, Mumbai, Maharashtra, 400001, India",
    "shortAddress": "Mumbai, Maharashtra - 400001",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### PUT /addresses/:addressId
Update an address.

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Home - Updated",
  "street": "123 Main Street, Apartment 4B, Floor 2",
  "landmark": "Near Central Mall and Metro Station",
  "isDefault": true
}
```

### DELETE /addresses/:addressId
Delete an address (soft delete).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": {}
}
```

### PATCH /addresses/:addressId/set-default
Set an address as default.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Default address updated successfully",
  "data": {
    "_id": "...",
    "label": "Home",
    "isDefault": true,
    // ... complete address details
  }
}
```

### GET /addresses/default/current
Get the current default address.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Default address retrieved successfully",
  "data": {
    "_id": "...",
    "label": "Home",
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "isDefault": true,
    "formattedAddress": "123 Main Street, Apartment 4B, Near Central Mall, Mumbai, Maharashtra, 400001, India",
    "shortAddress": "Mumbai, Maharashtra - 400001"
  }
}
```

### GET /addresses/search/location
Search addresses by location.

**Authentication:** Required

**Query Parameters:**
- `city` (optional): City name
- `state` (optional): State name
- `pincode` (optional): Pincode

**Response:**
```json
{
  "success": true,
  "message": "Addresses found successfully",
  "data": [
    {
      "_id": "...",
      "userId": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "label": "Home",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "formattedAddress": "123 Main Street, Mumbai, Maharashtra, 400001, India"
    }
  ]
}
```

### POST /addresses/validate
Validate address information.

**Authentication:** Required

**Request Body:**
```json
{
  "street": "456 Test Street",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address validation completed",
  "data": {
    "isValid": true,
    "errors": []
  }
}
```

### GET /addresses/stats/overview
Get address statistics.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Address statistics retrieved successfully",
  "data": {
    "overview": {
      "totalAddresses": 5,
      "defaultAddress": 1,
      "homeAddresses": 3,
      "workAddresses": 1,
      "otherAddresses": 1
    },
    "cityStats": [
      {
        "_id": "Mumbai",
        "count": 3
      },
      {
        "_id": "Delhi",
        "count": 2
      }
    ],
    "stateStats": [
      {
        "_id": "Maharashtra",
        "count": 3
      },
      {
        "_id": "Delhi",
        "count": 2
      }
    ]
  }
}
```

### POST /addresses/:addressId/duplicate
Duplicate an address.

**Authentication:** Required

**Request Body:**
```json
{
  "newLabel": "Work Address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address duplicated successfully",
  "data": {
    "_id": "...",
    "label": "Work Address",
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "isDefault": false,
    "addressType": "home"
  }
}
```

### PUT /addresses/bulk/update
Bulk update multiple addresses.

**Authentication:** Required

**Request Body:**
```json
{
  "updates": [
    {
      "addressId": "address_id_1",
      "label": "Home - Updated",
      "addressType": "home"
    },
    {
      "addressId": "address_id_2",
      "isDefault": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed",
  "data": {
    "results": [
      {
        "addressId": "address_id_1",
        "success": true,
        "data": {
          "_id": "address_id_1",
          "label": "Home - Updated",
          "addressType": "home"
        }
      },
      {
        "addressId": "address_id_2",
        "success": true,
        "data": {
          "_id": "address_id_2",
          "isDefault": true
        }
      }
    ]
  }
}
```

## Data Models

### User Profile Fields
```javascript
{
  name: String, // Required, max 50 characters
  email: String, // Required, unique, validated
  phone: String, // Optional, mobile phone format
  role: String, // Enum: guest, customer, admin
  isActive: Boolean, // Default: true
  dateOfBirth: Date, // Optional, ISO date format
  gender: String, // Enum: male, female, other, prefer_not_to_say
  bio: String, // Optional, max 500 characters
  profilePicture: String, // Optional, URL format
  preferences: {
    notifications: Boolean,
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    language: String, // Enum: en, hi, es, fr, de, zh, ja, ko
    timezone: String,
    theme: String // Enum: light, dark, auto
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Address Model
```javascript
{
  userId: ObjectId, // Reference to User
  label: String, // Required, max 50 characters, unique per user
  street: String, // Required, max 200 characters
  city: String, // Required, max 50 characters
  state: String, // Required, max 50 characters
  pincode: String, // Required, 6-digit Indian pincode
  country: String, // Default: "India", max 50 characters
  landmark: String, // Optional, max 100 characters
  isDefault: Boolean, // Default: false, only one per user
  isActive: Boolean, // Default: true
  addressType: String, // Enum: home, work, other
  coordinates: {
    latitude: Number, // Optional, -90 to 90
    longitude: Number // Optional, -180 to 180
  },
  contactNumber: String, // Optional, phone format
  instructions: String, // Optional, max 200 characters
  createdAt: Date,
  updatedAt: Date
}
```

## Business Rules

### Profile Management
- Users can only update their own profile
- Email cannot be changed through profile update
- Password change requires current password verification
- Profile picture must be a valid URL
- Preferences are stored as nested objects

### Address Management
- Users can only manage their own addresses
- Address labels must be unique per user
- Only one address can be default per user
- First address automatically becomes default
- Addresses are soft deleted (isActive: false)
- When default address is deleted, another address becomes default
- Pincode must be a valid 6-digit Indian pincode

### Validation Rules
- All required fields must be provided
- Email format validation
- Phone number format validation
- Pincode format validation (Indian format)
- Coordinate range validation
- String length limits enforced

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

### Update User Profile
```bash
curl -X PUT http://localhost:8000/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "+1234567891",
    "bio": "Updated bio information"
  }'
```

### Create New Address
```bash
curl -X POST http://localhost:8000/addresses \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Work",
    "street": "456 Business Street, Floor 10",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002",
    "landmark": "Near Business District",
    "addressType": "work",
    "contactNumber": "+1234567890"
  }'
```

### Set Default Address
```bash
curl -X PATCH http://localhost:8000/addresses/64a1b2c3d4e5f6789012345/set-default \
  -H "Authorization: Bearer <access_token>"
```

### Search Addresses by Location
```bash
curl -X GET "http://localhost:8000/addresses/search/location?city=Mumbai&state=Maharashtra" \
  -H "Authorization: Bearer <access_token>"
```

### Validate Address
```bash
curl -X POST http://localhost:8000/addresses/validate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "789 Test Street",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }'
```

## Testing

### Run Tests
```bash
# Test all profile and address endpoints
npm run test:profile

# Test specific functionality
npm run test:api
npm run test:products
npm run test:cart-order
npm run test:services-stylists
npm run test:auth
npm run test:membership
```

This API provides a complete solution for user profile and address management, enabling users to maintain their personal information and manage multiple addresses with full CRUD capabilities and advanced features like search, validation, and bulk operations.

