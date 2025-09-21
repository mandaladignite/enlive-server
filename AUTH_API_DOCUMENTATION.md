# Authentication API Documentation

## Overview
This API provides comprehensive authentication and user management functionality with role-based access control. The system supports three user roles: Guest, Customer, and Admin.

## User Roles
1. **Guest** - Limited access as per standards
2. **Customer** - Standard user with full customer privileges
3. **Admin** - Salon Owner/Staff with administrative privileges

## Base URL
```
http://localhost:8000/auth
```

## Authentication
All protected routes require a valid JWT token. The token can be provided in two ways:
- **Cookie**: `accessToken` (recommended for web applications)
- **Header**: `Authorization: Bearer <token>`

## API Endpoints

### 1. User Registration
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer", // optional: "guest" | "customer" | "admin"
  "phone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login
**POST** `/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": "+1234567890",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 3. Get User Profile
**GET** `/profile`

Get the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Profile
**PUT** `/profile`

Update the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith", // optional
  "phone": "+9876543210" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+9876543210",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. User Logout
**POST** `/logout`

Logout the authenticated user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully",
  "data": {}
}
```

### 6. Refresh Access Token
**POST** `/refresh-token`

Refresh the access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### 7. Change Password
**PUT** `/change-password`

Change the authenticated user's password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password"
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

## Admin-Only Endpoints

### 8. Get All Users
**GET** `/users`

Get a paginated list of all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role ("guest", "customer", "admin")
- `search` (optional): Search by name or email

**Example:**
```
GET /auth/users?page=1&limit=10&role=customer&search=john
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "phone": "+1234567890",
        "isActive": true,
        "lastLogin": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalDocs": 1,
    "limit": 10,
    "page": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 9. Get User by ID
**GET** `/users/:userId`

Get a specific user by ID (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 10. Update User by ID
**PUT** `/users/:userId`

Update a specific user by ID (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "name": "John Smith", // optional
  "email": "johnsmith@example.com", // optional
  "role": "admin", // optional
  "phone": "+9876543210", // optional
  "isActive": false // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "admin",
    "phone": "+9876543210",
    "isActive": false,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 11. Delete User by ID
**DELETE** `/users/:userId`

Deactivate a user account (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {}
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=enlive_db

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Token Expiry
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
```

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse of authentication endpoints.

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs
2. **JWT Tokens**: Secure token-based authentication
3. **Role-based Access Control**: Different access levels for different user roles
4. **Input Validation**: All inputs are validated using express-validator
5. **Cookie Security**: Secure HTTP-only cookies for token storage
6. **Soft Delete**: Users are deactivated instead of hard deleted

## Testing

Use tools like Postman or curl to test the API endpoints. Make sure to:

1. Register a new user
2. Login to get tokens
3. Use the access token in subsequent requests
4. Test role-based access control
5. Test token refresh functionality