# Salon Product Management API Documentation

## Overview
This API provides comprehensive functionality for managing salon products with full CRUD operations, inventory management, reviews, and advanced search capabilities. The API supports both public access for browsing products and admin-only operations for product management.

## Base URL
```
http://localhost:8000
```

## Authentication
- **Public Endpoints**: No authentication required (product browsing, viewing, searching)
- **Protected Endpoints**: JWT authentication required (reviews, admin operations)
- **Admin Endpoints**: Admin role required (product management, statistics)

## Product Model

### Core Fields
- `_id`: ObjectId (auto-generated)
- `name`: String (required, max 100 chars)
- `category`: String (required, enum: "hair_care", "skin_care", "nail_care", "makeup", "tools", "accessories", "other")
- `price`: Number (required, 0-999999)
- `stock`: Number (required, min 0, default: 0)
- `description`: String (required, max 1000 chars)
- `imageUrls`: Array of Strings (required, at least 1 URL)

### Additional Fields
- `brand`: String (optional, max 50 chars)
- `sku`: String (optional, unique, max 50 chars)
- `weight`: Object with value and unit
- `dimensions`: Object with length, width, height, and unit
- `tags`: Array of Strings (max 30 chars each)
- `isActive`: Boolean (default: true)
- `isFeatured`: Boolean (default: false)
- `discount`: Number (0-100%, default: 0)
- `discountStartDate`: Date
- `discountEndDate`: Date
- `rating`: Object with average and count
- `reviews`: Array of review objects
- `specifications`: Map of key-value pairs
- `ingredients`: Array of Strings
- `usageInstructions`: String (max 1000 chars)
- `careInstructions`: String (max 500 chars)
- `warranty`: Object with period, unit, and description
- `supplier`: Object with name and contact
- `reorderLevel`: Number (default: 10)
- `isLowStock`: Boolean (auto-calculated)

## API Endpoints

### Public Endpoints (No Authentication Required)

#### GET /products
Get all products with filtering, sorting, and pagination.

**Query Parameters:**
- `category` (optional): Filter by product category
- `brand` (optional): Filter by brand name (case-insensitive)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `inStock` (optional): Filter products in stock (true/false)
- `isFeatured` (optional): Filter featured products (true/false)
- `search` (optional): Search in name, description, brand, tags
- `tags` (optional): Comma-separated tags to filter by
- `sortBy` (optional): Sort field ("name", "price", "createdAt", "rating.average")
- `sortOrder` (optional): Sort order ("asc", "desc")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Professional Hair Shampoo",
        "category": "hair_care",
        "price": 25.99,
        "stock": 50,
        "description": "Gentle cleansing shampoo for all hair types",
        "imageUrls": ["https://example.com/image1.jpg"],
        "brand": "SalonPro",
        "sku": "SP-HS-001",
        "isFeatured": true,
        "discount": 10,
        "discountedPrice": 23.39,
        "rating": {
          "average": 4.5,
          "count": 25
        },
        "stockStatus": "in_stock",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /products/search
Search products with advanced filtering.

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "products": [...],
    "pagination": {...},
    "searchQuery": "shampoo"
  }
}
```

#### GET /products/featured
Get featured products.

**Query Parameters:**
- `limit` (optional): Number of products (default: 8)

**Response:**
```json
{
  "success": true,
  "message": "Featured products retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Professional Hair Shampoo",
      "category": "hair_care",
      "price": 25.99,
      "isFeatured": true,
      "discountedPrice": 23.39,
      "rating": {
        "average": 4.5,
        "count": 25
      }
    }
  ]
}
```

#### GET /products/categories
Get product categories with statistics.

**Response:**
```json
{
  "success": true,
  "message": "Product categories retrieved successfully",
  "data": [
    {
      "_id": "hair_care",
      "count": 25,
      "averagePrice": 32.50
    },
    {
      "_id": "skin_care",
      "count": 18,
      "averagePrice": 28.75
    }
  ]
}
```

#### GET /products/:productId
Get a specific product by ID.

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "...",
    "name": "Professional Hair Shampoo",
    "category": "hair_care",
    "price": 25.99,
    "stock": 50,
    "description": "Gentle cleansing shampoo for all hair types",
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "brand": "SalonPro",
    "sku": "SP-HS-001",
    "weight": {
      "value": 500,
      "unit": "ml"
    },
    "dimensions": {
      "length": 20,
      "width": 8,
      "height": 25,
      "unit": "cm"
    },
    "tags": ["shampoo", "hair care", "professional"],
    "isActive": true,
    "isFeatured": true,
    "discount": 10,
    "discountStartDate": "2024-01-01T00:00:00.000Z",
    "discountEndDate": "2024-01-31T23:59:59.000Z",
    "discountedPrice": 23.39,
    "rating": {
      "average": 4.5,
      "count": 25
    },
    "reviews": [...],
    "specifications": {
      "volume": "500ml",
      "pH": "5.5",
      "sulfate-free": "Yes"
    },
    "ingredients": ["Water", "Sodium Lauryl Sulfate", "Coconut Oil"],
    "usageInstructions": "Apply to wet hair, massage, and rinse thoroughly",
    "careInstructions": "Store in a cool, dry place",
    "warranty": {
      "period": 12,
      "unit": "months",
      "description": "Manufacturer warranty"
    },
    "supplier": {
      "name": "Beauty Supply Co",
      "contact": "supplier@beauty.com"
    },
    "reorderLevel": 10,
    "isLowStock": false,
    "stockStatus": "in_stock",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### GET /products/:productId/reviews
Get product reviews with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field ("createdAt", "rating")
- `sortOrder` (optional): Sort order ("asc", "desc")

**Response:**
```json
{
  "success": true,
  "message": "Product reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "userId": {
          "_id": "...",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "rating": 5,
        "comment": "Great product! Highly recommended.",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "rating": {
      "average": 4.5,
      "count": 25
    }
  }
}
```

### Protected Endpoints (Authentication Required)

#### POST /products/:productId/reviews
Add a product review.

**Authentication:** Required (Customer/Admin)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product! Works great for my hair type."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    // Updated product with new review
  }
}
```

### Admin Endpoints (Admin Role Required)

#### POST /products
Create a new product.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Professional Hair Shampoo",
  "category": "hair_care",
  "price": 25.99,
  "stock": 50,
  "description": "Gentle cleansing shampoo for all hair types",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "brand": "SalonPro",
  "sku": "SP-HS-001",
  "weight": {
    "value": 500,
    "unit": "ml"
  },
  "dimensions": {
    "length": 20,
    "width": 8,
    "height": 25,
    "unit": "cm"
  },
  "tags": ["shampoo", "hair care", "professional"],
  "isFeatured": true,
  "discount": 10,
  "discountStartDate": "2024-01-01T00:00:00.000Z",
  "discountEndDate": "2024-01-31T23:59:59.000Z",
  "specifications": {
    "volume": "500ml",
    "pH": "5.5",
    "sulfate-free": "Yes"
  },
  "ingredients": ["Water", "Sodium Lauryl Sulfate", "Coconut Oil"],
  "usageInstructions": "Apply to wet hair, massage, and rinse thoroughly",
  "careInstructions": "Store in a cool, dry place",
  "warranty": {
    "period": 12,
    "unit": "months",
    "description": "Manufacturer warranty"
  },
  "supplier": {
    "name": "Beauty Supply Co",
    "contact": "supplier@beauty.com"
  },
  "reorderLevel": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    // Created product object
  }
}
```

#### PUT /products/:productId
Update a product.

**Authentication:** Required (Admin)

**Request Body:** Same as create, but all fields are optional.

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    // Updated product object
  }
}
```

#### DELETE /products/:productId
Delete a product permanently.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

#### PATCH /products/:productId/deactivate
Deactivate a product (soft delete).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Product deactivated successfully",
  "data": {
    // Updated product with isActive: false
  }
}
```

#### PATCH /products/:productId/reactivate
Reactivate a deactivated product.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Product reactivated successfully",
  "data": {
    // Updated product with isActive: true
  }
}
```

#### PATCH /products/:productId/stock
Update product stock.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "quantity": 25,
  "operation": "add"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    // Updated product with new stock
  }
}
```

#### GET /products/admin/low-stock
Get low stock products.

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Low stock products retrieved successfully",
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

#### GET /products/admin/stats
Get product statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Product statistics retrieved successfully",
  "data": {
    "overview": {
      "totalProducts": 150,
      "activeProducts": 145,
      "totalStock": 5000,
      "totalValue": 125000,
      "averagePrice": 25.50,
      "lowStockProducts": 12
    },
    "categoryStats": [
      {
        "_id": "hair_care",
        "count": 45,
        "totalStock": 1500,
        "averagePrice": 28.75
      }
    ],
    "featuredProducts": 8
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

1. **Product Management:**
   - Products can be created, updated, and deleted by admins only
   - Soft delete is preferred (deactivation) over hard delete
   - SKU must be unique across all products
   - At least one image URL is required

2. **Stock Management:**
   - Stock cannot be negative
   - Low stock status is automatically calculated
   - Stock updates support both add and subtract operations

3. **Pricing:**
   - Price cannot be negative
   - Discount percentage cannot exceed 100%
   - Discount dates must be valid (start < end)

4. **Reviews:**
   - Users can only review products once
   - Rating must be between 1 and 5
   - Reviews are automatically included in average rating calculation

5. **Search and Filtering:**
   - Search works across name, description, brand, and tags
   - All filters can be combined
   - Results are paginated for performance

6. **Categories:**
   - Predefined categories ensure consistency
   - Category statistics are calculated in real-time

## Performance Features

1. **Database Indexes:**
   - Text search index on name, description, brand
   - Category and active status index
   - Price and stock indexes
   - Featured products index
   - Rating index for sorting

2. **Pagination:**
   - All list endpoints support pagination
   - Configurable page size limits
   - Efficient skip/limit queries

3. **Caching Considerations:**
   - Product lists can be cached
   - Featured products are good candidates for caching
   - Category statistics can be cached with TTL

## Security Features

1. **Input Validation:**
   - Comprehensive validation using express-validator
   - SQL injection prevention through Mongoose
   - XSS prevention through input sanitization

2. **Access Control:**
   - Role-based access control
   - Public vs protected vs admin endpoints
   - JWT token validation

3. **Data Protection:**
   - Sensitive fields excluded from public responses
   - Admin-only operations properly protected
   - Input sanitization and validation

## Usage Examples

### Creating a Product (Admin)
```bash
curl -X POST http://localhost:8000/products \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Hair Shampoo",
    "category": "hair_care",
    "price": 25.99,
    "stock": 50,
    "description": "Gentle cleansing shampoo",
    "imageUrls": ["https://example.com/image1.jpg"],
    "brand": "SalonPro"
  }'
```

### Searching Products (Public)
```bash
curl "http://localhost:8000/products/search?q=shampoo&category=hair_care&minPrice=20&maxPrice=50"
```

### Adding a Review (Authenticated)
```bash
curl -X POST http://localhost:8000/products/64a1b2c3d4e5f6789012345/reviews \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Great product!"
  }'
```

### Updating Stock (Admin)
```bash
curl -X PATCH http://localhost:8000/products/64a1b2c3d4e5f6789012345/stock \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "operation": "add"
  }'
```
