# Gallery Management API Documentation

## Overview
This API provides comprehensive functionality for managing salon gallery images with Cloudinary integration. Admins can upload, organize, and manage images across different categories (Hair, Skin, Nail, Bridal), while public users can view and search the gallery.

## Base URL
```
http://localhost:8000
```

## Authentication
Admin endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Environment Variables
Add these to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Public Gallery API

### GET /gallery
Get all gallery images with filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category (Hair, Skin, Nail, Bridal)
- `subcategory` (optional): Filter by subcategory
- `featured` (optional): Filter featured images (true/false)
- `search` (optional): Search term for title, description, tags
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): Sort field (createdAt, views, likes, title, sortOrder)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Gallery images retrieved successfully",
  "data": {
    "images": [
      {
        "_id": "...",
        "title": "Beautiful Hair Styling",
        "description": "Elegant hair styling for special occasions",
        "category": "Hair",
        "subcategory": "Styling",
        "tags": ["hair", "styling", "beauty"],
        "imageUrl": "https://res.cloudinary.com/...",
        "cloudinaryPublicId": "salon-gallery/hair/image_id",
        "cloudinarySecureUrl": "https://res.cloudinary.com/...",
        "originalFileName": "hair-styling.jpg",
        "fileSize": 2048576,
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "format": "jpg",
        "isActive": true,
        "isFeatured": true,
        "sortOrder": 1,
        "uploadedBy": {
          "_id": "...",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "views": 150,
        "likes": 25,
        "altText": "Beautiful Hair Styling - Hair gallery image",
        "aspectRatio": "1.78",
        "fileSizeMB": "1.95",
        "dimensionsString": "1920x1080",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalImages": 95,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /gallery/:imageId
Get a single gallery image by ID.

**Response:**
```json
{
  "success": true,
  "message": "Gallery image retrieved successfully",
  "data": {
    "_id": "...",
    "title": "Beautiful Hair Styling",
    "description": "Elegant hair styling for special occasions",
    "category": "Hair",
    "subcategory": "Styling",
    "tags": ["hair", "styling", "beauty"],
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "salon-gallery/hair/image_id",
    "cloudinarySecureUrl": "https://res.cloudinary.com/...",
    "originalFileName": "hair-styling.jpg",
    "fileSize": 2048576,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "format": "jpg",
    "isActive": true,
    "isFeatured": true,
    "sortOrder": 1,
    "uploadedBy": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "views": 151,
    "likes": 25,
    "altText": "Beautiful Hair Styling - Hair gallery image",
    "aspectRatio": "1.78",
    "fileSizeMB": "1.95",
    "dimensionsString": "1920x1080",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### GET /gallery/category/:category
Get images by specific category.

**Path Parameters:**
- `category`: Category name (Hair, Skin, Nail, Bridal)

**Query Parameters:**
- `subcategory` (optional): Filter by subcategory
- `featured` (optional): Filter featured images (true/false)
- `limit` (optional): Items per page (default: 50, max: 100)

### GET /gallery/featured/images
Get featured images.

**Query Parameters:**
- `limit` (optional): Items per page (default: 10, max: 50)

### GET /gallery/search/images
Search gallery images.

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

### GET /gallery/stats/overview
Get gallery statistics.

**Response:**
```json
{
  "success": true,
  "message": "Gallery statistics retrieved successfully",
  "data": {
    "overview": {
      "totalImages": 150,
      "totalViews": 5000,
      "totalLikes": 750,
      "totalFileSize": 104857600,
      "averageFileSize": 699050.67
    },
    "categoryBreakdown": [
      {
        "_id": "Hair",
        "count": 60,
        "totalViews": 2000,
        "totalLikes": 300,
        "featuredCount": 15
      },
      {
        "_id": "Skin",
        "count": 40,
        "totalViews": 1500,
        "totalLikes": 200,
        "featuredCount": 10
      }
    ]
  }
}
```

## Admin Gallery API

### POST /gallery/upload/single
Upload a single image to the gallery.

**Authentication:** Required (Admin)

**Content-Type:** multipart/form-data

**Form Data:**
- `image` (required): Image file (JPEG, PNG, GIF, WebP, max 10MB)
- `title` (required): Image title (1-100 characters)
- `description` (optional): Image description (max 500 characters)
- `category` (required): Category (Hair, Skin, Nail, Bridal)
- `subcategory` (optional): Subcategory (max 50 characters)
- `tags` (optional): Comma-separated tags (max 10 tags, 30 chars each)
- `altText` (optional): Alt text for accessibility (max 200 characters)
- `isFeatured` (optional): Featured status (boolean, default: false)
- `sortOrder` (optional): Sort order (integer, default: 0)
- `metadata` (optional): JSON string with additional metadata

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "_id": "...",
    "title": "Beautiful Hair Styling",
    "description": "Elegant hair styling for special occasions",
    "category": "Hair",
    "subcategory": "Styling",
    "tags": ["hair", "styling", "beauty"],
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "salon-gallery/hair/image_id",
    "cloudinarySecureUrl": "https://res.cloudinary.com/...",
    "originalFileName": "hair-styling.jpg",
    "fileSize": 2048576,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "format": "jpg",
    "isActive": true,
    "isFeatured": false,
    "sortOrder": 0,
    "uploadedBy": "...",
    "views": 0,
    "likes": 0,
    "altText": "Beautiful Hair Styling - Hair gallery image",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### POST /gallery/upload/multiple
Upload multiple images to the gallery.

**Authentication:** Required (Admin)

**Content-Type:** multipart/form-data

**Form Data:**
- `images` (required): Array of image files (max 10 files)
- `category` (required): Category for all images
- `subcategory` (optional): Subcategory for all images
- `tags` (optional): Comma-separated tags for all images
- `isFeatured` (optional): Featured status for all images
- `metadata` (optional): JSON string with metadata for all images
- `title_0`, `title_1`, etc. (optional): Individual titles for each image
- `description_0`, `description_1`, etc. (optional): Individual descriptions
- `altText_0`, `altText_1`, etc. (optional): Individual alt texts

**Response:**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "images": [
      {
        "_id": "...",
        "title": "Image 1",
        "category": "Hair",
        "imageUrl": "https://res.cloudinary.com/...",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "uploadCount": 3
  }
}
```

### PUT /gallery/:imageId
Update image details.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Updated Hair Styling",
  "description": "Updated description",
  "subcategory": "Bridal Styling",
  "tags": ["hair", "bridal", "styling", "wedding"],
  "altText": "Updated alt text",
  "isFeatured": true,
  "sortOrder": 5,
  "metadata": {
    "photographer": "John Doe",
    "stylist": "Jane Smith",
    "location": "Salon Studio"
  }
}
```

### DELETE /gallery/:imageId
Delete an image (soft delete).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {}
}
```

### PATCH /gallery/:imageId/toggle-featured
Toggle featured status of an image.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Image featured successfully",
  "data": {
    "_id": "...",
    "title": "Beautiful Hair Styling",
    "isFeatured": true,
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### PATCH /gallery/:imageId/sort-order
Update sort order of an image.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "sortOrder": 10
}
```

### PUT /gallery/bulk/update
Bulk update multiple images.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "imageIds": ["image_id_1", "image_id_2", "image_id_3"],
  "updateData": {
    "isFeatured": true,
    "sortOrder": 1,
    "tags": ["updated", "bulk"]
  }
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
        "imageId": "image_id_1",
        "success": true,
        "data": {
          "_id": "image_id_1",
          "isFeatured": true,
          "sortOrder": 1
        }
      }
    ]
  }
}
```

### GET /gallery/admin/all
Get all images (including inactive) for admin.

**Authentication:** Required (Admin)

**Query Parameters:**
- `category` (optional): Filter by category
- `subcategory` (optional): Filter by subcategory
- `featured` (optional): Filter featured images
- `isActive` (optional): Filter by active status
- `search` (optional): Search term
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort direction

### GET /gallery/admin/:imageId/analytics
Get analytics for a specific image.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Image analytics retrieved successfully",
  "data": {
    "image": {
      "id": "...",
      "title": "Beautiful Hair Styling",
      "category": "Hair",
      "subcategory": "Styling",
      "imageUrl": "https://res.cloudinary.com/...",
      "dimensions": "1920x1080",
      "fileSize": "1.95",
      "views": 150,
      "likes": 25,
      "isFeatured": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    "views": 150,
    "likes": 25,
    "engagement": "16.67",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### GET /gallery/admin/dashboard/stats
Get comprehensive dashboard statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Gallery dashboard stats retrieved successfully",
  "data": {
    "overview": {
      "totalImages": 150,
      "totalViews": 5000,
      "totalLikes": 750,
      "totalFileSize": 104857600,
      "averageFileSize": 699050.67
    },
    "categoryBreakdown": [
      {
        "_id": "Hair",
        "count": 60,
        "totalViews": 2000,
        "totalLikes": 300,
        "featuredCount": 15
      }
    ],
    "recentUploads": [
      {
        "_id": "...",
        "title": "Recent Hair Styling",
        "category": "Hair",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "uploadedBy": {
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ],
    "topImages": [
      {
        "_id": "...",
        "title": "Popular Hair Styling",
        "views": 500,
        "likes": 75,
        "category": "Hair"
      }
    ]
  }
}
```

## Data Models

### Gallery Image Schema
```javascript
{
  title: String, // Required, 1-100 characters
  description: String, // Optional, max 500 characters
  category: String, // Required, enum: Hair, Skin, Nail, Bridal
  subcategory: String, // Optional, max 50 characters
  tags: [String], // Optional, max 10 tags, 30 chars each
  imageUrl: String, // Required, Cloudinary URL
  cloudinaryPublicId: String, // Required, Cloudinary public ID
  cloudinarySecureUrl: String, // Required, Cloudinary secure URL
  originalFileName: String, // Required, original file name
  fileSize: Number, // Required, file size in bytes
  dimensions: {
    width: Number, // Required, image width
    height: Number // Required, image height
  },
  format: String, // Required, enum: jpg, jpeg, png, gif, webp
  isActive: Boolean, // Default: true
  isFeatured: Boolean, // Default: false
  sortOrder: Number, // Default: 0
  uploadedBy: ObjectId, // Reference to User
  views: Number, // Default: 0
  likes: Number, // Default: 0
  altText: String, // Optional, max 200 characters
  galleryPosition: Number, // Default: 0
  transformations: [{
    name: String,
    width: Number,
    height: Number,
    crop: String,
    quality: String
  }],
  metadata: {
    camera: String,
    lens: String,
    settings: String,
    location: String,
    photographer: String,
    model: String,
    stylist: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Cloudinary Integration

### Image Upload Process
1. **File Validation**: Validates file type, size, and format
2. **Cloudinary Upload**: Uploads to Cloudinary with optimized settings
3. **Database Storage**: Stores metadata in MongoDB
4. **Response**: Returns complete image information

### Image Transformations
- **Automatic Optimization**: Quality and format optimization
- **Responsive Images**: Multiple sizes for different devices
- **Lazy Loading**: Optimized loading for better performance
- **CDN Delivery**: Fast global content delivery

### File Requirements
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum Size**: 10MB per file
- **Maximum Files**: 10 files per bulk upload
- **Image Dimensions**: Minimum 1x1 pixel

## Business Rules

### Image Management
- Only admins can upload, update, or delete images
- Images are soft deleted (isActive: false)
- Featured images are highlighted in public gallery
- Sort order determines display sequence
- View count increments on each image view

### Category Management
- Four main categories: Hair, Skin, Nail, Bridal
- Subcategories provide additional organization
- Tags enable flexible search and filtering
- Category-based folder structure in Cloudinary

### Search and Filtering
- Full-text search across title, description, and tags
- Category and subcategory filtering
- Featured image filtering
- Pagination for large result sets
- Sorting by various fields

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
- `413`: Payload Too Large (file too big)
- `500`: Internal Server Error

## Usage Examples

### Upload Single Image
```bash
curl -X POST http://localhost:8000/gallery/upload/single \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Beautiful Hair Styling" \
  -F "description=Elegant hair styling for special occasions" \
  -F "category=Hair" \
  -F "subcategory=Styling" \
  -F "tags=hair,styling,beauty" \
  -F "isFeatured=true"
```

### Search Images
```bash
curl -X GET "http://localhost:8000/gallery/search/images?q=hair&category=Hair&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### Update Image
```bash
curl -X PUT http://localhost:8000/gallery/image_id \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Hair Styling",
    "isFeatured": true,
    "sortOrder": 5
  }'
```

### Get Gallery Statistics
```bash
curl -X GET http://localhost:8000/gallery/stats/overview
```

## Testing

### Run Tests
```bash
# Test all gallery endpoints
npm run test:gallery

# Test specific functionality
npm run test:api
npm run test:products
npm run test:cart-order
npm run test:services-stylists
npm run test:auth
npm run test:membership
npm run test:profile
```

### Test Coverage
- Public gallery viewing and searching
- Admin image upload and management
- Image categorization and filtering
- Featured image functionality
- Bulk operations
- Analytics and statistics
- Error handling and validation

This API provides a complete solution for salon gallery management, enabling admins to showcase their work through organized, searchable, and beautifully presented image galleries while providing public users with an engaging browsing experience.

