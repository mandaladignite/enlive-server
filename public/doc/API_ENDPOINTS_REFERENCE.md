# API Endpoints Reference

## 🚀 Server Status: ✅ OPERATIONAL

**Base URL**: `http://localhost:8000`

## 📋 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh-token` | Refresh access token | Yes |
| GET | `/auth/me` | Get current user | Yes |

## 🛍️ Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get single product | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| GET | `/products/categories` | Get product categories | No |
| GET | `/products/search` | Search products | No |

## 🛠️ Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/services` | Get all services | No |
| GET | `/services/:id` | Get single service | No |
| POST | `/services` | Create service | Admin |
| PUT | `/services/:id` | Update service | Admin |
| DELETE | `/services/:id` | Delete service | Admin |
| GET | `/services/categories` | Get service categories | No |

## 👨‍💼 Stylist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stylists` | Get all stylists | No |
| GET | `/stylists/:id` | Get single stylist | No |
| POST | `/stylists` | Create stylist | Admin |
| PUT | `/stylists/:id` | Update stylist | Admin |
| DELETE | `/stylists/:id` | Delete stylist | Admin |
| GET | `/stylists/:id/services` | Get stylist services | No |

## 🛒 Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user cart | Yes |
| POST | `/cart/add` | Add item to cart | Yes |
| PUT | `/cart/update/:productId` | Update cart item | Yes |
| DELETE | `/cart/remove/:productId` | Remove from cart | Yes |
| DELETE | `/cart/clear` | Clear cart | Yes |
| POST | `/cart/apply-discount` | Apply discount code | Yes |

## 📦 Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get user orders | Yes |
| GET | `/orders/:id` | Get single order | Yes |
| POST | `/orders` | Create order | Yes |
| PUT | `/orders/:id` | Update order | Yes |
| POST | `/orders/:id/cancel` | Cancel order | Yes |
| GET | `/orders/admin/all` | Get all orders (admin) | Admin |
| PUT | `/orders/admin/:id/status` | Update order status | Admin |

## 📅 Appointment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/appointments` | Get user appointments | Yes |
| GET | `/appointments/:id` | Get single appointment | Yes |
| POST | `/appointments` | Book appointment | Yes |
| PUT | `/appointments/:id` | Update appointment | Yes |
| DELETE | `/appointments/:id` | Cancel appointment | Yes |
| GET | `/appointments/admin/all` | Get all appointments (admin) | Admin |
| PUT | `/appointments/admin/:id/status` | Update appointment status | Admin |
| GET | `/appointments/available-slots` | Get available time slots | No |

## ⭐ Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews/submit` | Submit review | Yes |
| GET | `/reviews/target/:targetType/:targetId` | Get target reviews | No |
| GET | `/reviews/my-reviews` | Get user reviews | Yes |
| PUT | `/reviews/:id` | Update review | Yes |
| GET | `/reviews/admin/all` | Get all reviews (admin) | Admin |
| PATCH | `/reviews/admin/:id/approve` | Approve review | Admin |
| DELETE | `/reviews/admin/:id` | Delete review | Admin |
| GET | `/reviews/admin/stats` | Get review statistics | Admin |

## 👤 Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/profile/change-password` | Change password | Yes |
| POST | `/profile/upload-avatar` | Upload profile picture | Yes |

## 🏠 Address Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/addresses` | Get user addresses | Yes |
| GET | `/addresses/:id` | Get single address | Yes |
| POST | `/addresses` | Add address | Yes |
| PUT | `/addresses/:id` | Update address | Yes |
| DELETE | `/addresses/:id` | Delete address | Yes |
| PUT | `/addresses/:id/set-default` | Set default address | Yes |

## 🎨 Gallery Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/gallery` | Get gallery images | No |
| GET | `/gallery/:id` | Get single image | No |
| POST | `/gallery` | Upload image | Admin |
| PUT | `/gallery/:id` | Update image | Admin |
| DELETE | `/gallery/:id` | Delete image | Admin |
| GET | `/gallery/categories` | Get gallery categories | No |

## 📦 Package Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/packages` | Get all packages | No |
| GET | `/packages/:id` | Get single package | No |
| POST | `/packages` | Create package | Admin |
| PUT | `/packages/:id` | Update package | Admin |
| DELETE | `/packages/:id` | Delete package | Admin |

## 🎫 Membership Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/memberships` | Get user memberships | Yes |
| GET | `/memberships/:id` | Get single membership | Yes |
| POST | `/memberships` | Purchase membership | Yes |
| PUT | `/memberships/:id` | Update membership | Yes |
| POST | `/memberships/:id/cancel` | Cancel membership | Yes |
| GET | `/memberships/admin/all` | Get all memberships (admin) | Admin |
| PUT | `/memberships/admin/:id/status` | Update membership status | Admin |

## 📱 WhatsApp Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/whatsapp/send-message` | Send WhatsApp message | Admin |
| POST | `/whatsapp/send-notification` | Send notification | Admin |
| GET | `/whatsapp/webhook` | WhatsApp webhook | No |
| POST | `/whatsapp/webhook` | WhatsApp webhook | No |

## 🔧 Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/upload/signature` | Get upload signature | Yes |
| POST | `/upload` | Upload file | Yes |

## 📊 Query Parameters

### Pagination
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

### Filtering
- `category` (string): Filter by category
- `search` (string): Search term
- `status` (string): Filter by status
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

### Sorting
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order ('asc' or 'desc')

## 🔐 Authentication Headers

```javascript
// For protected routes
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

## 📝 Request/Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error",
      "value": "invalidValue"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "docs": [...],
    "totalDocs": 100,
    "limit": 10,
    "page": 1,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔄 Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per minute per user

## 📱 Mobile App Considerations

- Use pagination for large lists
- Implement offline caching where possible
- Handle network errors gracefully
- Use appropriate image sizes for mobile

## 🌐 CORS Configuration

- **Allowed Origins**: `http://localhost:3000`, `https://yourdomain.com`
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With

## 🔧 Development vs Production

### Development
- Base URL: `http://localhost:8000`
- Debug mode enabled
- Detailed error messages
- CORS allows all origins

### Production
- Base URL: `https://api.yourdomain.com`
- Debug mode disabled
- Sanitized error messages
- Restricted CORS origins

## 📈 Performance Tips

1. Use pagination for large datasets
2. Implement client-side caching
3. Use appropriate image sizes
4. Minimize API calls with data aggregation
5. Use compression for large responses

## 🛡️ Security Best Practices

1. Always validate input on both client and server
2. Use HTTPS in production
3. Implement proper authentication
4. Sanitize user inputs
5. Use rate limiting
6. Keep dependencies updated

## 📚 Additional Resources

- [Frontend Integration Guide](./FRONTEND_API_INTEGRATION_GUIDE.md)
- [Review API Documentation](./REVIEW_API_DOCUMENTATION.md)
- [Authentication Setup Guide](./AUTHENTICATION_SETUP_GUIDE.md)
- [Complete API Setup Guide](./COMPLETE_API_SETUP_GUIDE.md)

---

**Last Updated**: January 2024  
**API Version**: 1.0.0  
**Status**: ✅ Production Ready
