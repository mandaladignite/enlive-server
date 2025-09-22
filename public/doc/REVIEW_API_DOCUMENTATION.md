# Review API Documentation

## Overview
The Review API allows users to submit, manage, and view reviews for products and services. Reviews require admin approval before being displayed publicly.

## Base URL
```
http://localhost:8000/reviews
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Submit Review
**POST** `/submit`

Submit a new review for a product or service.

**Authentication:** Required (User)

**Request Body:**
```json
{
  "targetType": "product", // or "service"
  "targetId": "507f1f77bcf86cd799439011",
  "rating": 5, // 1-5
  "comment": "This is an excellent product!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending approval",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "targetType": "product",
    "targetId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "This is an excellent product!",
    "approved": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Target Reviews
**GET** `/target/:targetType/:targetId`

Get all approved reviews for a specific product or service.

**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `approved` (optional): Filter by approval status (default: true)

**Response:**
```json
{
  "success": true,
  "message": "Target reviews fetched successfully",
  "data": {
    "reviews": {
      "docs": [...],
      "totalDocs": 15,
      "limit": 10,
      "page": 1,
      "totalPages": 2
    },
    "averageRating": 4.2,
    "totalReviews": 15
  }
}
```

### 3. Get User Reviews
**GET** `/my-reviews`

Get all reviews submitted by the authenticated user.

**Authentication:** Required (User)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "User reviews fetched successfully",
  "data": {
    "docs": [...],
    "totalDocs": 5,
    "limit": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### 4. Update Review
**PUT** `/:reviewId`

Update a review (only if not approved).

**Authentication:** Required (User - own reviews only)

**Request Body:**
```json
{
  "rating": 4, // optional
  "comment": "Updated review comment" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "rating": 4,
    "comment": "Updated review comment",
    "approved": false,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Get All Reviews (Admin)
**GET** `/admin/all`

Get all reviews with admin controls.

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `approved` (optional): Filter by approval status
- `targetType` (optional): Filter by target type
- `targetId` (optional): Filter by target ID

**Response:**
```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "docs": [...],
    "totalDocs": 50,
    "limit": 10,
    "page": 1,
    "totalPages": 5
  }
}
```

### 6. Approve Review (Admin)
**PATCH** `/admin/:reviewId/approve`

Approve a pending review.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "approved": true,
    "approvedBy": "507f1f77bcf86cd799439013",
    "approvedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 7. Delete Review (Admin)
**DELETE** `/admin/:reviewId`

Delete a review (soft delete).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

### 8. Get Review Statistics (Admin)
**GET** `/admin/stats`

Get comprehensive review statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Review statistics fetched successfully",
  "data": {
    "totalReviews": 150,
    "approvedReviews": 120,
    "pendingReviews": 30,
    "averageRating": 4.1,
    "ratingDistribution": {
      "1": 5,
      "2": 10,
      "3": 25,
      "4": 45,
      "5": 65
    }
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be an integer between 1 and 5",
      "value": 6
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized request"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Review not found"
}
```

## Data Models

### Review Schema
```javascript
{
  userId: ObjectId, // Reference to User
  targetType: String, // "product" or "service"
  targetId: ObjectId, // Reference to Product or Service
  rating: Number, // 1-5
  comment: String, // Max 500 characters
  approved: Boolean, // Default: false
  approvedBy: ObjectId, // Reference to User (admin)
  approvedAt: Date,
  isActive: Boolean, // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

## Business Rules

1. **One Review Per User Per Target**: Users can only submit one review per product/service
2. **Admin Approval Required**: All reviews require admin approval before being displayed
3. **Update Restrictions**: Users can only update their own reviews if not approved
4. **Soft Delete**: Reviews are soft deleted (isActive: false) rather than permanently removed
5. **Rating Validation**: Ratings must be integers between 1 and 5
6. **Comment Length**: Comments are limited to 500 characters

## Usage Examples

### Submit a Product Review
```bash
curl -X POST http://localhost:8000/reviews/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "targetType": "product",
    "targetId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Amazing product! Highly recommended."
  }'
```

### Get Product Reviews
```bash
curl -X GET "http://localhost:8000/reviews/target/product/507f1f77bcf86cd799439011?page=1&limit=10"
```

### Approve Review (Admin)
```bash
curl -X PATCH http://localhost:8000/reviews/admin/507f1f77bcf86cd799439012/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Testing

Run the test suite:
```bash
npm run test:reviews
```

Or run the test file directly:
```bash
node test-review-api.js
```

## Notes

- Reviews are paginated for better performance
- The API includes comprehensive validation and error handling
- All timestamps are in ISO 8601 format
- The system supports both product and service reviews
- Admin users have full control over review approval and management
