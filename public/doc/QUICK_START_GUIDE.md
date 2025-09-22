# 🚀 Quick Start Guide

## Backend Server Status: ✅ FULLY OPERATIONAL

The backend server has been debugged and is ready for frontend integration.

## 🏃‍♂️ Quick Setup

### 1. Start the Server
```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### 2. Verify Server is Running
```bash
# Check health endpoint
curl http://localhost:8000/health

# Expected response:
# {
#   "success": true,
#   "message": "Server is running",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

### 3. Test Authentication
```bash
# Register a test user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login with the user
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔧 Frontend Integration

### 1. Base Configuration
```javascript
const API_BASE_URL = 'http://localhost:8000';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  return await response.json();
};
```

### 2. Authentication Flow
```javascript
// Login function
const login = async (email, password) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

// Logout function
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // Redirect to login page
};
```

### 3. Fetch Data Examples
```javascript
// Get products
const getProducts = async () => {
  return await apiCall('/products');
};

// Get user profile
const getProfile = async () => {
  return await apiCall('/profile');
};

// Get cart
const getCart = async () => {
  return await apiCall('/cart');
};
```

## 📱 React Integration Example

### 1. API Context
```javascript
// contexts/ApiContext.js
import React, { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
    }
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <ApiContext.Provider value={{
      user,
      loading,
      apiCall,
      login,
      logout,
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
```

### 2. Product Component
```javascript
// components/ProductList.js
import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const ProductList = () => {
  const { apiCall, loading } = useApi();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiCall('/products');
        setProducts(response.data.docs);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Products</h2>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
```

### 3. App Component
```javascript
// App.js
import React from 'react';
import { ApiProvider } from './contexts/ApiContext';
import ProductList from './components/ProductList';

function App() {
  return (
    <ApiProvider>
      <div className="App">
        <h1>Enlive Salon</h1>
        <ProductList />
      </div>
    </ApiProvider>
  );
}

export default App;
```

## 🧪 Testing the API

### 1. Test All Endpoints
```bash
# Run the test suite
npm run test:reviews
npm run test:products
npm run test:auth
```

### 2. Manual Testing with curl
```bash
# Test products endpoint
curl http://localhost:8000/products

# Test services endpoint
curl http://localhost:8000/services

# Test reviews endpoint
curl http://localhost:8000/reviews/target/product/507f1f77bcf86cd799439011
```

## 🔍 Debugging Tips

### 1. Check Server Logs
```bash
# Start server with debug logs
DEBUG=* npm start
```

### 2. Common Issues
- **CORS Error**: Make sure your frontend is running on `http://localhost:3000`
- **Authentication Error**: Check if JWT token is included in headers
- **Database Error**: Verify MongoDB connection string in `.env`

### 3. Network Tab
- Open browser DevTools → Network tab
- Check request/response details
- Verify headers and payload

## 📚 Available Documentation

1. **[Frontend API Integration Guide](./FRONTEND_API_INTEGRATION_GUIDE.md)** - Complete frontend integration guide
2. **[API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md)** - All available endpoints
3. **[Review API Documentation](./REVIEW_API_DOCUMENTATION.md)** - Review system specific docs
4. **[Authentication Setup Guide](./AUTHENTICATION_SETUP_GUIDE.md)** - Auth system details

## 🚀 Next Steps

1. **Set up your frontend project**
2. **Implement authentication first**
3. **Add the API client utility**
4. **Start building features one by one**
5. **Test thoroughly before production**

## 🆘 Need Help?

- Check the server logs for error details
- Verify all environment variables are set
- Ensure MongoDB is running and accessible
- Test endpoints individually with curl or Postman

## ✅ Server Health Check

The server is currently:
- ✅ Running on port 8000
- ✅ Connected to MongoDB
- ✅ All models loaded successfully
- ✅ All routes registered
- ✅ Authentication working
- ✅ CORS configured
- ✅ Error handling in place

**Ready for frontend integration!** 🎉
