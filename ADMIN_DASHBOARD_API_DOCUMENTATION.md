# Admin Dashboard API Documentation

This document provides comprehensive information about the admin dashboard API endpoints for the salon management system.

## 🚀 Overview

The admin dashboard API provides real-time statistics, analytics, and data for salon administrators. All endpoints require admin authentication and are protected by role-based access control.

## 🔐 Authentication

All admin dashboard endpoints require:
- Valid JWT access token
- Admin role (`role: "admin"`)
- Token must be sent in Authorization header: `Bearer <token>`

## 📊 API Endpoints

### 1. Dashboard Overview
**GET** `/admin/dashboard/overview`

Returns comprehensive dashboard data including stats, recent bookings, and upcoming appointments.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "stats": {
      "totalBookings": {
        "value": 128,
        "change": "+12%",
        "trend": "up"
      },
      "activeCustomers": {
        "value": 94,
        "change": "+5%",
        "trend": "up"
      },
      "productsSold": {
        "value": 320,
        "change": "-3%",
        "trend": "down"
      },
      "revenue": {
        "value": "₹1.2L",
        "change": "+18%",
        "trend": "up"
      }
    },
    "recentBookings": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "customerName": "Aditi Sharma",
        "serviceName": "Hair Spa",
        "date": "12 Sep 2025",
        "time": "10:30 AM",
        "status": "confirmed",
        "totalPrice": 1499
      }
    ],
    "upcomingAppointments": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "customerName": "Rahul Verma",
        "serviceName": "Beard Trim",
        "date": "13 Sep 2025",
        "time": "2:15 PM",
        "status": "pending",
        "totalPrice": 599
      }
    ]
  }
}
```

### 2. Dashboard Statistics
**GET** `/admin/dashboard/stats`

Returns detailed statistics for the dashboard.

**Query Parameters:**
- `period` (optional): `week` | `month` | `year` (default: `month`)

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalBookings": {
      "value": 128,
      "change": "+12%",
      "trend": "up"
    },
    "activeCustomers": {
      "value": 94,
      "change": "+5%",
      "trend": "up"
    },
    "productsSold": {
      "value": 320,
      "change": "-3%",
      "trend": "down"
    },
    "revenue": {
      "value": "₹1.2L",
      "change": "+18%",
      "trend": "up"
    }
  }
}
```

### 3. Recent Bookings
**GET** `/admin/dashboard/recent-bookings`

Returns recent appointments/bookings.

**Query Parameters:**
- `limit` (optional): Number of bookings to return (1-100, default: 10)
- `status` (optional): Filter by status (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`)

**Response:**
```json
{
  "success": true,
  "message": "Recent bookings retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "customerName": "Aditi Sharma",
      "customerEmail": "aditi@example.com",
      "serviceName": "Hair Spa",
      "servicePrice": 1499,
      "stylistName": "John Doe",
      "date": "12 Sep 2025",
      "time": "10:30 AM",
      "status": "confirmed",
      "totalPrice": 1499,
      "location": "salon",
      "notes": "Regular customer"
    }
  ]
}
```

### 4. Upcoming Appointments
**GET** `/admin/dashboard/upcoming-appointments`

Returns upcoming appointments.

**Query Parameters:**
- `limit` (optional): Number of appointments to return (1-50, default: 5)

**Response:**
```json
{
  "success": true,
  "message": "Upcoming appointments retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "customerName": "Rahul Verma",
      "serviceName": "Beard Trim",
      "stylistName": "Jane Smith",
      "date": "13 Sep 2025",
      "time": "2:15 PM",
      "status": "pending",
      "totalPrice": 599,
      "location": "salon"
    }
  ]
}
```

### 5. Revenue Analytics
**GET** `/admin/dashboard/revenue-analytics`

Returns revenue analytics data for charts.

**Query Parameters:**
- `period` (optional): `week` | `month` | `year` (default: `month`)

**Response:**
```json
{
  "success": true,
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "orderRevenue": [
      {
        "_id": 1,
        "totalRevenue": 15000,
        "orderCount": 5
      },
      {
        "_id": 2,
        "totalRevenue": 22000,
        "orderCount": 8
      }
    ],
    "appointmentRevenue": [
      {
        "_id": 1,
        "totalRevenue": 8000,
        "appointmentCount": 4
      },
      {
        "_id": 2,
        "totalRevenue": 12000,
        "appointmentCount": 6
      }
    ],
    "period": "month"
  }
}
```

## 🧪 Testing

### Test Admin Dashboard API
```bash
cd server
npm run test-dashboard
```

### Manual Testing with cURL

1. **Login as Admin:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "your_password"
  }'
```

2. **Get Dashboard Overview:**
```bash
curl -X GET http://localhost:8000/admin/dashboard/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **Get Statistics:**
```bash
curl -X GET http://localhost:8000/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📈 Data Sources

The dashboard API aggregates data from multiple sources:

### Statistics Calculation
- **Total Bookings**: Count of all appointments
- **Active Customers**: Users with appointments or orders
- **Products Sold**: Sum of quantities from completed orders
- **Revenue**: Sum of total amounts from completed orders and appointments

### Data Models Used
- `Appointment` - For booking/appointment data
- `Order` - For e-commerce order data
- `Product` - For product information
- `User` - For customer information

## 🔒 Security Features

### Authentication
- JWT token validation on all endpoints
- Admin role verification
- Token expiration handling

### Authorization
- Admin-only access to all dashboard endpoints
- Automatic redirect for unauthorized users
- Secure token storage and transmission

### Data Protection
- Sensitive data filtering (passwords, tokens)
- Input validation and sanitization
- SQL injection prevention through Mongoose

## 🚨 Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized request"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve dashboard statistics"
}
```

## 📊 Frontend Integration

### React Hook Usage
```typescript
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

const Dashboard = () => {
  const { dashboardData, loading, error, refetch } = useAdminDashboard();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render dashboard data */}
    </div>
  );
};
```

### API Client Usage
```typescript
import { apiRequest } from '@/lib/api';

// Get dashboard overview
const getDashboardData = async () => {
  try {
    const response = await apiRequest('/admin/dashboard/overview');
    return response.data;
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw error;
  }
};
```

## 🎯 Performance Considerations

### Database Optimization
- Indexed queries for efficient data retrieval
- Aggregation pipelines for complex statistics
- Pagination for large datasets

### Caching Strategy
- Consider implementing Redis caching for frequently accessed data
- Cache statistics for 5-10 minutes to reduce database load
- Implement cache invalidation on data updates

### Query Optimization
- Use MongoDB aggregation for complex calculations
- Limit data retrieval with appropriate filters
- Optimize population of related documents

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/enlive-salon

# JWT
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Rate Limiting
Consider implementing rate limiting for dashboard endpoints:
```javascript
const rateLimit = require('express-rate-limit');

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/admin/dashboard', dashboardLimiter);
```

## 📚 Additional Resources

- [Authentication System Documentation](./AUTHENTICATION_SYSTEM_DOCUMENTATION.md)
- [API Endpoints Reference](./public/doc/API_ENDPOINTS_REFERENCE.md)
- [Admin Setup Guide](./ADMIN_SETUP_GUIDE.md)

---

**Need Help?** Check the troubleshooting section or refer to the comprehensive documentation in the `/public/doc/` directory.
