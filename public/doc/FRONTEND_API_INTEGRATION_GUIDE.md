# Frontend API Integration Guide

## 🚀 Server Status: ✅ OPERATIONAL

The backend server has been debugged and is fully operational. All endpoints are working correctly.

## 📋 Base Configuration

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **CORS**: Enabled for `http://localhost:3000` (configurable)

## 🔐 Authentication System

### Login
```javascript
// POST /auth/login
const loginUser = async (email, password) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};
```

### Register
```javascript
// POST /auth/register
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  return await response.json();
};
```

### Logout
```javascript
// POST /auth/logout
const logoutUser = async () => {
  const response = await fetch('http://localhost:8000/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    }
  });
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return await response.json();
};
```

## 🛍️ Product Management

### Get All Products
```javascript
// GET /products
const getProducts = async (page = 1, limit = 10, category = null, search = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(search && { search })
  });
  
  const response = await fetch(`http://localhost:8000/products?${params}`);
  return await response.json();
};
```

### Get Single Product
```javascript
// GET /products/:id
const getProduct = async (productId) => {
  const response = await fetch(`http://localhost:8000/products/${productId}`);
  return await response.json();
};
```

### Create Product (Admin)
```javascript
// POST /products
const createProduct = async (productData) => {
  const response = await fetch('http://localhost:8000/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData)
  });
  
  return await response.json();
};
```

## 🛠️ Service Management

### Get All Services
```javascript
// GET /services
const getServices = async (page = 1, limit = 10, category = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category })
  });
  
  const response = await fetch(`http://localhost:8000/services?${params}`);
  return await response.json();
};
```

### Get Single Service
```javascript
// GET /services/:id
const getService = async (serviceId) => {
  const response = await fetch(`http://localhost:8000/services/${serviceId}`);
  return await response.json();
};
```

## 🛒 Cart & Order Management

### Get Cart
```javascript
// GET /cart
const getCart = async () => {
  const response = await fetch('http://localhost:8000/cart', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

### Add to Cart
```javascript
// POST /cart/add
const addToCart = async (productId, quantity) => {
  const response = await fetch('http://localhost:8000/cart/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity })
  });
  
  return await response.json();
};
```

### Update Cart Item
```javascript
// PUT /cart/update/:productId
const updateCartItem = async (productId, quantity) => {
  const response = await fetch(`http://localhost:8000/cart/update/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity })
  });
  
  return await response.json();
};
```

### Remove from Cart
```javascript
// DELETE /cart/remove/:productId
const removeFromCart = async (productId) => {
  const response = await fetch(`http://localhost:8000/cart/remove/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

### Create Order
```javascript
// POST /orders
const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:8000/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};
```

### Get User Orders
```javascript
// GET /orders
const getUserOrders = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/orders?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

## 📅 Appointment Management

### Book Appointment
```javascript
// POST /appointments
const bookAppointment = async (appointmentData) => {
  const response = await fetch('http://localhost:8000/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData)
  });
  
  return await response.json();
};
```

### Get User Appointments
```javascript
// GET /appointments
const getUserAppointments = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/appointments?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

### Update Appointment
```javascript
// PUT /appointments/:id
const updateAppointment = async (appointmentId, updateData) => {
  const response = await fetch(`http://localhost:8000/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  
  return await response.json();
};
```

## ⭐ Review System

### Submit Review
```javascript
// POST /reviews/submit
const submitReview = async (targetType, targetId, rating, comment) => {
  const response = await fetch('http://localhost:8000/reviews/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetType, // 'product' or 'service'
      targetId,
      rating, // 1-5
      comment
    })
  });
  
  return await response.json();
};
```

### Get Product/Service Reviews
```javascript
// GET /reviews/target/:targetType/:targetId
const getTargetReviews = async (targetType, targetId, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/reviews/target/${targetType}/${targetId}?${params}`);
  return await response.json();
};
```

### Get User Reviews
```javascript
// GET /reviews/my-reviews
const getUserReviews = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/reviews/my-reviews?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

## 👤 Profile Management

### Get User Profile
```javascript
// GET /profile
const getUserProfile = async () => {
  const response = await fetch('http://localhost:8000/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

### Update User Profile
```javascript
// PUT /profile
const updateUserProfile = async (profileData) => {
  const response = await fetch('http://localhost:8000/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
};
```

### Get User Addresses
```javascript
// GET /addresses
const getUserAddresses = async () => {
  const response = await fetch('http://localhost:8000/addresses', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

### Add Address
```javascript
// POST /addresses
const addAddress = async (addressData) => {
  const response = await fetch('http://localhost:8000/addresses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(addressData)
  });
  
  return await response.json();
};
```

## 🎨 Gallery Management

### Get Gallery Images
```javascript
// GET /gallery
const getGalleryImages = async (page = 1, limit = 20, category = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category })
  });
  
  const response = await fetch(`http://localhost:8000/gallery?${params}`);
  return await response.json();
};
```

## 📦 Membership & Packages

### Get Membership Packages
```javascript
// GET /packages
const getPackages = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/packages?${params}`);
  return await response.json();
};
```

### Get User Memberships
```javascript
// GET /memberships
const getUserMemberships = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`http://localhost:8000/memberships?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  });
  
  return await response.json();
};
```

## 🔧 Utility Functions

### API Request Helper
```javascript
class ApiClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Usage
const api = new ApiClient();

// Example usage
const products = await api.get('/products', { page: 1, limit: 10 });
const newProduct = await api.post('/products', productData);
```

### Error Handling
```javascript
const handleApiError = (error) => {
  if (error.message.includes('Unauthorized')) {
    // Redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } else if (error.message.includes('Forbidden')) {
    // Show access denied message
    alert('You do not have permission to perform this action');
  } else {
    // Show generic error message
    alert(error.message || 'Something went wrong');
  }
};
```

### Loading States
```javascript
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err);
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};
```

## 📱 React Hooks Examples

### Products Hook
```javascript
import { useState, useEffect } from 'react';

const useProducts = (page = 1, limit = 10, filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/products', {
        page,
        limit,
        ...filters
      });
      
      setProducts(response.data.docs);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalDocs: response.data.totalDocs
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, filters]);

  return { products, loading, error, pagination, refetch: fetchProducts };
};
```

### Cart Hook
```javascript
const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      await api.post('/cart/add', { productId, quantity });
      await fetchCart(); // Refresh cart
    } catch (error) {
      handleApiError(error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart(); // Refresh cart
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, loading, addToCart, removeFromCart, refetch: fetchCart };
};
```

## 🚨 Important Notes

1. **Authentication**: Always include the JWT token in the Authorization header for protected routes
2. **Error Handling**: Implement proper error handling for all API calls
3. **Loading States**: Show loading indicators during API calls
4. **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters
5. **CORS**: The server is configured to accept requests from `http://localhost:3000`
6. **File Uploads**: Use FormData for file uploads, not JSON
7. **Rate Limiting**: Be mindful of API rate limits in production

## 🔧 Environment Variables

Make sure these environment variables are set in your `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CORS_ORIGIN=http://localhost:3000
```

## 📊 API Response Format

All API responses follow this format:

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "errors": [] // Only present if there are validation errors
}
```

Error responses:

```javascript
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

## 🎯 Next Steps

1. Set up your frontend project with the base URL: `http://localhost:8000`
2. Implement the authentication system first
3. Add the API client utility to your project
4. Start implementing features one by one
5. Test all endpoints thoroughly
6. Add proper error handling and loading states

The backend is fully operational and ready for frontend integration! 🚀
