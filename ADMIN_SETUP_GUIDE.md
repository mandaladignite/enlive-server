# Admin Integration Setup Guide

This guide will help you set up the admin authentication system and protect admin routes in your salon management application.

## 🚀 Quick Start

### 1. Create Initial Admin User

Run the admin creation script to set up your first admin user:

```bash
cd server
npm run create-admin
```

Follow the prompts to enter:
- Admin name
- Admin email
- Admin password
- Phone number (optional)

### 2. Start the Backend Server

```bash
cd server
npm run dev
```

### 3. Start the Frontend

```bash
cd client
npm run dev
```

### 4. Access Admin Panel

1. Navigate to `http://localhost:3000/auth/admin/login`
2. Login with your admin credentials
3. You'll be redirected to the admin dashboard at `http://localhost:3000/admin`

## 🔐 Authentication System

### Admin User Creation

Admin users can only be created through:
1. **Developer Script**: `npm run create-admin` (recommended for initial setup)
2. **API Endpoint**: `POST /auth/create-admin` (for additional admins)

**Important**: Regular user registration (`/auth/register`) blocks admin role creation for security.

### Role-Based Access Control

The system implements three user roles:

- **Guest**: Limited access to browsing features
- **Customer**: Full access to customer features (bookings, orders, etc.)
- **Admin**: Full access to admin panel and management features

### Protected Routes

#### Frontend Protection
- All `/admin/*` routes are protected by `AdminRouteGuard`
- Non-admin users are automatically redirected to `/auth/admin/login`
- Admin authentication state is managed by `AdminAuthContext`

#### Backend Protection
- Admin-only endpoints use `adminOnly` middleware
- Customer and admin endpoints use `customerAndAdmin` middleware
- All protected endpoints require valid JWT tokens

## 🛠️ Technical Implementation

### Frontend Components

#### AdminAuthContext (`/contexts/AdminAuthContext.tsx`)
- Manages admin authentication state
- Provides login/logout functionality
- Validates admin role on login

#### AdminRouteGuard (`/components/admin/AdminRouteGuard.tsx`)
- Protects admin routes from unauthorized access
- Shows loading state during authentication check
- Redirects non-admin users to login page

#### Admin Layout (`/app/admin/layout.tsx`)
- Wraps all admin pages with authentication providers
- Provides consistent admin UI structure

### Backend Implementation

#### Authentication Middleware (`/middleware/auth.middleware.js`)
- `verifyJWT`: Validates JWT tokens
- `adminOnly`: Restricts access to admin users only
- `customerAndAdmin`: Allows both customer and admin access

#### Admin Routes (`/routes/auth.route.js`)
- `POST /auth/create-admin`: Create admin users (developer only)
- `GET /auth/users`: List all users (admin only)
- `PUT /auth/users/:userId`: Update user (admin only)
- `DELETE /auth/users/:userId`: Deactivate user (admin only)

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/enlive-salon

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here

# JWT Expiry
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### API Endpoints

#### Authentication Endpoints
- `POST /auth/register` - Register customer/guest (public)
- `POST /auth/login` - Login (public)
- `POST /auth/create-admin` - Create admin (developer only)
- `POST /auth/logout` - Logout (authenticated)
- `GET /auth/profile` - Get user profile (authenticated)

#### Admin Management Endpoints
- `GET /auth/users` - List all users (admin only)
- `GET /auth/users/:userId` - Get user by ID (admin only)
- `PUT /auth/users/:userId` - Update user (admin only)
- `DELETE /auth/users/:userId` - Deactivate user (admin only)

## 🧪 Testing

### Test Admin Authentication

1. **Create Admin User**:
```bash
cd server
npm run create-admin
```

2. **Test Login**:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "your_password"
  }'
```

3. **Test Protected Route**:
```bash
curl -X GET http://localhost:8000/auth/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Frontend Testing

1. Navigate to `http://localhost:3000/admin`
2. Should redirect to login page if not authenticated
3. Login with admin credentials
4. Should redirect to admin dashboard
5. Test logout functionality

## 🚨 Security Considerations

### Admin User Security
- Admin users can only be created by developers
- Regular registration blocks admin role creation
- Admin routes are protected by multiple layers of authentication

### Token Security
- JWT tokens are stored in httpOnly cookies
- Access tokens expire in 1 day (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens are validated on every protected request

### Route Protection
- Frontend: `AdminRouteGuard` component
- Backend: `adminOnly` middleware
- API: Role-based access control

## 🔍 Troubleshooting

### Common Issues

1. **"Access denied. Admin privileges required."**
   - Ensure the user has `role: "admin"` in the database
   - Check if the user is active (`isActive: true`)

2. **"Invalid access token"**
   - Check if the JWT secret is correctly set
   - Verify token hasn't expired
   - Ensure token is being sent in Authorization header

3. **Redirect loop on admin routes**
   - Check if `AdminAuthProvider` is wrapping the admin layout
   - Verify `AdminRouteGuard` is properly implemented

4. **Admin user creation fails**
   - Ensure MongoDB is running
   - Check database connection string
   - Verify email is unique

### Debug Steps

1. Check browser console for authentication errors
2. Verify JWT token in browser dev tools
3. Test API endpoints directly with curl/Postman
4. Check server logs for authentication errors

## 📚 Additional Resources

- [Authentication System Documentation](./public/doc/AUTHENTICATION_SYSTEM_DOCUMENTATION.md)
- [API Endpoints Reference](./public/doc/API_ENDPOINTS_REFERENCE.md)
- [Complete Setup Guide](./public/doc/COMPLETE_API_SETUP_GUIDE.md)

## 🎯 Next Steps

After setting up admin authentication:

1. **Integrate Admin Features**: Connect admin dashboard to backend APIs
2. **User Management**: Implement user listing, editing, and management
3. **Analytics**: Add dashboard analytics and reporting
4. **Notifications**: Implement admin notifications system
5. **Audit Logs**: Add admin action logging and audit trails

---

**Need Help?** Check the troubleshooting section or refer to the comprehensive documentation in the `/public/doc/` directory.
