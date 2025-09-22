# Authentication System Documentation

## Overview
The authentication system has been updated to implement role-based access control with proper security measures. Only customers and guests can register through the regular signup process, while admin users can only be created by developers through a special endpoint.

## User Roles

### 1. **Customer** (Default)
- Can register through regular signup
- Full access to customer features
- Can book appointments, purchase products, manage cart and orders
- Cannot access admin features

### 2. **Guest**
- Can register through regular signup
- Limited access to browsing features
- May have restricted access to certain features
- Cannot access admin features

### 3. **Admin**
- **Cannot be registered through regular signup**
- Can only be created by developers using special endpoint
- Full access to all admin features
- Can manage services, stylists, products, orders, and users

## API Endpoints

### Public Endpoints (No Authentication Required)

#### POST /auth/register
Register a new customer or guest user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer", // Optional: "customer" or "guest" (default: "customer")
  "phone": "+1234567890" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `403`: Admin accounts cannot be created through regular registration
- `400`: Invalid role (only customer/guest allowed)
- `409`: User with email already exists

#### POST /auth/login
Login with email and password.

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
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### POST /auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Developer Only Endpoints

#### POST /auth/create-admin
Create an admin user (Developer only - for initial setup).

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@salon.com",
  "password": "admin123",
  "phone": "+1234567890" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@salon.com",
    "role": "admin",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Protected Endpoints (Authentication Required)

#### POST /auth/logout
Logout user and clear tokens.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully",
  "data": {}
}
```

#### GET /auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-01T10:00:00.000Z",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### PUT /auth/profile
Update current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "John Smith", // Optional
  "phone": "+1234567891" // Optional
}
```

#### PUT /auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Admin Only Endpoints

#### GET /auth/users
Get all users with pagination and filtering (Admin only).

**Headers:** `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "isActive": true,
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "totalDocs": 50,
    "limit": 10,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /auth/users/:userId
Get user by ID (Admin only).

**Headers:** `Authorization: Bearer <admin_access_token>`

#### PUT /auth/users/:userId
Update user by ID (Admin only).

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request Body:**
```json
{
  "name": "Updated Name", // Optional
  "email": "updated@example.com", // Optional
  "role": "customer", // Optional
  "phone": "+1234567890", // Optional
  "isActive": true // Optional
}
```

#### DELETE /auth/users/:userId
Deactivate user by ID (Admin only - soft delete).

**Headers:** `Authorization: Bearer <admin_access_token>`

## Security Features

### 1. **Role-Based Access Control**
- Regular users can only register as customers or guests
- Admin accounts cannot be created through public registration
- Admin users have access to all system features
- Role validation on all endpoints

### 2. **Password Security**
- Minimum 6 characters required
- Passwords are hashed using bcrypt with salt rounds of 12
- Password comparison using secure bcrypt methods

### 3. **JWT Token Security**
- Access tokens expire (configurable, default: 1 day)
- Refresh tokens expire (configurable, default: 7 days)
- Tokens stored in HTTP-only cookies for security
- Secure cookie settings in production

### 4. **Input Validation**
- Email format validation
- Password strength requirements
- Phone number format validation
- Role validation (restricted to allowed values)
- Input sanitization and normalization

### 5. **Account Security**
- Soft delete for user accounts (deactivation)
- Account status checking on login
- Last login tracking
- Secure token refresh mechanism

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid role. Only 'customer' or 'guest' roles are allowed for registration.",
  "errors": []
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid user credentials",
  "errors": []
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin accounts cannot be created through regular registration. Contact system administrator.",
  "errors": []
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found",
  "errors": []
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "User with email already exists",
  "errors": []
}
```

## Usage Examples

### Register a Customer
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer",
    "phone": "+1234567890"
  }'
```

### Register a Guest
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guest User",
    "email": "guest@example.com",
    "password": "password123",
    "role": "guest"
  }'
```

### Attempt Admin Registration (Will Fail)
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Create Admin (Developer Only)
```bash
curl -X POST http://localhost:8000/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@salon.com",
    "password": "admin123",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:8000/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

## Environment Variables

Make sure to set these environment variables:

```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=production
```

## Best Practices

### 1. **For Frontend Applications**
- Store tokens securely (HTTP-only cookies preferred)
- Implement automatic token refresh
- Handle authentication errors gracefully
- Show appropriate UI based on user role

### 2. **For Admin Panel**
- Use the admin creation endpoint only during initial setup
- Implement proper admin authentication
- Use role-based UI components
- Implement proper error handling

### 3. **For API Integration**
- Always include proper authorization headers
- Handle token expiration gracefully
- Implement retry logic for token refresh
- Validate user roles before sensitive operations

## Migration Guide

If you're updating from a previous version:

1. **Update Registration Logic**: The registration endpoint now restricts admin creation
2. **Add Admin Creation Endpoint**: Use `/auth/create-admin` for initial admin setup
3. **Update Frontend**: Remove admin role from registration forms
4. **Update Validation**: Ensure role validation only allows customer/guest
5. **Test Authentication**: Verify all authentication flows work correctly

This authentication system provides a secure, role-based access control mechanism that prevents unauthorized admin account creation while maintaining a smooth user experience for customers and guests.

