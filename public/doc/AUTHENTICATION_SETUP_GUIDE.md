# Authentication System Setup Guide

## Overview
This guide will help you set up the updated authentication system with role-based access control. The system now restricts admin registration to developers only, while allowing customers and guests to register through the regular signup process.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Environment variables configured

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/enlive-salon

# JWT Secrets (Generate strong, unique secrets)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here

# JWT Expiry (Optional - defaults provided)
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. Create Initial Admin User

**Important**: The first admin user must be created using the developer endpoint since regular registration blocks admin creation.

```bash
curl -X POST http://localhost:8000/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Administrator",
    "email": "admin@salon.com",
    "password": "admin123",
    "phone": "+1234567890"
  }'
```

### 4. Verify Setup

Test the authentication system:

```bash
# Test all authentication endpoints
npm run test:auth
```

## User Registration Flow

### Customer Registration
```javascript
// Frontend registration form
const registerCustomer = async (userData) => {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'customer', // Optional, defaults to 'customer'
      phone: userData.phone // Optional
    })
  });
  
  return response.json();
};
```

### Guest Registration
```javascript
// Frontend registration form
const registerGuest = async (userData) => {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'guest',
      phone: userData.phone // Optional
    })
  });
  
  return response.json();
};
```

### Admin Registration (Blocked)
```javascript
// This will fail with 403 error
const registerAdmin = async (userData) => {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'admin' // This will be rejected
    })
  });
  
  // Will return: "Admin accounts cannot be created through regular registration"
  return response.json();
};
```

## Login Flow

### User Login
```javascript
const loginUser = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens securely
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};
```

## Protected Route Access

### Using Access Token
```javascript
const accessProtectedRoute = async (endpoint) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Example usage
const userProfile = await accessProtectedRoute('/auth/profile');
```

### Token Refresh
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  
  return data;
};
```

## Role-Based Access Control

### Check User Role
```javascript
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.role : null;
};

const isAdmin = () => getUserRole() === 'admin';
const isCustomer = () => getUserRole() === 'customer';
const isGuest = () => getUserRole() === 'guest';
```

### Conditional UI Rendering
```javascript
// React example
const Dashboard = () => {
  const userRole = getUserRole();
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Customer and Guest can see */}
      <div>
        <h2>My Appointments</h2>
        <p>View your appointments</p>
      </div>
      
      {/* Only Admin can see */}
      {isAdmin() && (
        <div>
          <h2>Admin Panel</h2>
          <p>Manage services, stylists, and users</p>
        </div>
      )}
      
      {/* Only Customer can see */}
      {isCustomer() && (
        <div>
          <h2>My Orders</h2>
          <p>View your order history</p>
        </div>
      )}
    </div>
  );
};
```

## API Integration Examples

### Frontend Authentication Service
```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
  }
  
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    return response.json();
  }
  
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    return response.json();
  }
  
  async logout() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response.json();
  }
  
  async getProfile() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
  
  getToken() {
    return localStorage.getItem('accessToken');
  }
  
  isAuthenticated() {
    return !!this.getToken();
  }
  
  getUserRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.role : null;
  }
}

export default new AuthService();
```

## Error Handling

### Registration Error Handling
```javascript
const handleRegistration = async (userData) => {
  try {
    const result = await authService.register(userData);
    
    if (result.success) {
      // Registration successful
      console.log('User registered successfully');
      // Redirect to login or dashboard
    } else {
      // Handle specific errors
      if (result.message.includes('Admin accounts cannot be created')) {
        alert('Admin accounts cannot be created through registration. Contact system administrator.');
      } else if (result.message.includes('Invalid role')) {
        alert('Invalid role selected. Please choose Customer or Guest.');
      } else if (result.message.includes('already exists')) {
        alert('An account with this email already exists.');
      } else {
        alert('Registration failed: ' + result.message);
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
};
```

### Login Error Handling
```javascript
const handleLogin = async (email, password) => {
  try {
    const result = await authService.login(email, password);
    
    if (result.success) {
      // Login successful
      console.log('Login successful');
      // Redirect based on role
      const userRole = result.data.user.role;
      if (userRole === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      // Handle login errors
      if (result.message.includes('User does not exist')) {
        alert('No account found with this email address.');
      } else if (result.message.includes('Invalid credentials')) {
        alert('Invalid email or password.');
      } else if (result.message.includes('deactivated')) {
        alert('Your account has been deactivated. Contact support.');
      } else {
        alert('Login failed: ' + result.message);
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};
```

## Security Best Practices

### 1. Token Storage
- Store tokens in HTTP-only cookies (preferred) or secure localStorage
- Implement automatic token refresh
- Clear tokens on logout

### 2. Password Security
- Enforce strong password requirements
- Never store passwords in plain text
- Implement password change functionality

### 3. Role Validation
- Always validate user roles on the frontend
- Never trust client-side role information for security decisions
- Implement proper access control on all protected routes

### 4. Error Messages
- Don't expose sensitive information in error messages
- Use generic messages for security-related errors
- Log detailed errors server-side only

## Testing

### Run Authentication Tests
```bash
# Test all authentication endpoints
npm run test:auth

# Test specific functionality
npm run test:api
npm run test:products
npm run test:cart-order
npm run test:services-stylists
```

### Manual Testing Checklist
- [ ] Customer registration works
- [ ] Guest registration works
- [ ] Admin registration is blocked
- [ ] Invalid role registration is blocked
- [ ] Login works for all user types
- [ ] Profile access works with valid token
- [ ] Profile access fails without token
- [ ] Admin endpoints work with admin token
- [ ] Admin endpoints fail with customer token
- [ ] Logout clears tokens properly

## Troubleshooting

### Common Issues

#### 1. Admin Registration Blocked
**Problem**: Trying to register as admin through regular signup
**Solution**: Use the `/auth/create-admin` endpoint for initial admin setup

#### 2. Token Expired
**Problem**: Getting 401 errors after some time
**Solution**: Implement automatic token refresh or re-login

#### 3. Role Access Denied
**Problem**: Getting 403 errors on admin endpoints
**Solution**: Ensure user has admin role and valid token

#### 4. CORS Issues
**Problem**: Frontend can't make requests
**Solution**: Check CORS_ORIGIN environment variable

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=auth:*
```

## Production Deployment

### 1. Environment Variables
- Use strong, unique JWT secrets
- Set NODE_ENV=production
- Configure proper CORS_ORIGIN
- Use secure MongoDB connection string

### 2. Security Headers
- Enable HTTPS
- Set secure cookie options
- Implement rate limiting
- Add request validation

### 3. Monitoring
- Log authentication events
- Monitor failed login attempts
- Track token usage
- Set up alerts for suspicious activity

This authentication system provides a secure, role-based access control mechanism that prevents unauthorized admin account creation while maintaining a smooth user experience for customers and guests.

