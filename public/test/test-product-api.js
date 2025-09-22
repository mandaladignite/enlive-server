import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testAdmin = {
    name: 'Admin User',
    email: 'admin@salon.com',
    password: 'admin123',
    role: 'admin'
};

const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+1234567890'
};

const testProduct = {
    name: 'Professional Hair Shampoo',
    category: 'hair_care',
    price: 25.99,
    stock: 50,
    description: 'Gentle cleansing shampoo for all hair types. Made with natural ingredients and free from harsh chemicals.',
    imageUrls: ['https://example.com/shampoo1.jpg', 'https://example.com/shampoo2.jpg'],
    brand: 'SalonPro',
    sku: 'SP-HS-001',
    weight: {
        value: 500,
        unit: 'ml'
    },
    dimensions: {
        length: 20,
        width: 8,
        height: 25,
        unit: 'cm'
    },
    tags: ['shampoo', 'hair care', 'professional', 'natural'],
    isFeatured: true,
    discount: 10,
    discountStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    discountEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    specifications: {
        volume: '500ml',
        pH: '5.5',
        'sulfate-free': 'Yes',
        'paraben-free': 'Yes'
    },
    ingredients: ['Water', 'Sodium Lauryl Sulfate', 'Coconut Oil', 'Aloe Vera'],
    usageInstructions: 'Apply to wet hair, massage gently, and rinse thoroughly. Repeat if necessary.',
    careInstructions: 'Store in a cool, dry place away from direct sunlight.',
    warranty: {
        period: 12,
        unit: 'months',
        description: 'Manufacturer warranty against defects'
    },
    supplier: {
        name: 'Beauty Supply Co',
        contact: 'supplier@beauty.com'
    },
    reorderLevel: 10
};

let adminToken = '';
let userToken = '';
let productId = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`${method} ${endpoint} - Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('---');
        
        return { response, data };
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        return { response: null, data: null, error };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('=== Testing Health Check ===');
    const { data } = await apiCall('/health');
    
    if (data && data.success) {
        console.log('✅ Server is running');
    } else {
        console.log('❌ Server health check failed');
    }
}

async function testAdminRegistration() {
    console.log('=== Testing Admin Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testAdmin);
    
    if (data && data.success) {
        adminToken = data.data.accessToken;
        console.log('✅ Admin registered successfully');
    } else {
        console.log('❌ Admin registration failed');
    }
}

async function testUserRegistration() {
    console.log('=== Testing User Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testUser);
    
    if (data && data.success) {
        userToken = data.data.accessToken;
        console.log('✅ User registered successfully');
    } else {
        console.log('❌ User registration failed');
    }
}

async function testCreateProduct() {
    console.log('=== Testing Product Creation ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available - cannot create product');
        return;
    }

    const { data } = await apiCall('/products', 'POST', testProduct, adminToken);
    
    if (data && data.success) {
        productId = data.data._id;
        console.log('✅ Product created successfully');
        console.log(`Product ID: ${productId}`);
    } else {
        console.log('❌ Product creation failed');
    }
}

async function testGetAllProducts() {
    console.log('=== Testing Get All Products ===');
    const { data } = await apiCall('/products');
    
    if (data && data.success) {
        console.log('✅ Products retrieved successfully');
        console.log(`Found ${data.data.products.length} products`);
    } else {
        console.log('❌ Failed to retrieve products');
    }
}

async function testGetProduct() {
    console.log('=== Testing Get Single Product ===');
    
    if (!productId) {
        console.log('❌ No product ID available');
        return;
    }

    const { data } = await apiCall(`/products/${productId}`);
    
    if (data && data.success) {
        console.log('✅ Product retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve product');
    }
}

async function testSearchProducts() {
    console.log('=== Testing Product Search ===');
    const { data } = await apiCall('/products/search?q=shampoo&category=hair_care');
    
    if (data && data.success) {
        console.log('✅ Product search successful');
        console.log(`Found ${data.data.products.length} products for "shampoo"`);
    } else {
        console.log('❌ Product search failed');
    }
}

async function testGetFeaturedProducts() {
    console.log('=== Testing Get Featured Products ===');
    const { data } = await apiCall('/products/featured');
    
    if (data && data.success) {
        console.log('✅ Featured products retrieved successfully');
        console.log(`Found ${data.data.length} featured products`);
    } else {
        console.log('❌ Failed to retrieve featured products');
    }
}

async function testGetCategories() {
    console.log('=== Testing Get Product Categories ===');
    const { data } = await apiCall('/products/categories');
    
    if (data && data.success) {
        console.log('✅ Product categories retrieved successfully');
        console.log(`Found ${data.data.length} categories`);
    } else {
        console.log('❌ Failed to retrieve categories');
    }
}

async function testUpdateProduct() {
    console.log('=== Testing Update Product ===');
    
    if (!productId || !adminToken) {
        console.log('❌ No product ID or admin token available');
        return;
    }

    const updateData = {
        price: 29.99,
        stock: 75,
        description: 'Updated description for professional hair shampoo'
    };

    const { data } = await apiCall(`/products/${productId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Product updated successfully');
    } else {
        console.log('❌ Product update failed');
    }
}

async function testUpdateStock() {
    console.log('=== Testing Update Stock ===');
    
    if (!productId || !adminToken) {
        console.log('❌ No product ID or admin token available');
        return;
    }

    const stockData = {
        quantity: 25,
        operation: 'add'
    };

    const { data } = await apiCall(`/products/${productId}/stock`, 'PATCH', stockData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stock updated successfully');
    } else {
        console.log('❌ Stock update failed');
    }
}

async function testAddReview() {
    console.log('=== Testing Add Review ===');
    
    if (!productId || !userToken) {
        console.log('❌ No product ID or user token available');
        return;
    }

    const reviewData = {
        rating: 5,
        comment: 'Excellent product! Works great for my hair type. Highly recommended!'
    };

    const { data } = await apiCall(`/products/${productId}/reviews`, 'POST', reviewData, userToken);
    
    if (data && data.success) {
        console.log('✅ Review added successfully');
    } else {
        console.log('❌ Review addition failed');
    }
}

async function testGetReviews() {
    console.log('=== Testing Get Product Reviews ===');
    
    if (!productId) {
        console.log('❌ No product ID available');
        return;
    }

    const { data } = await apiCall(`/products/${productId}/reviews`);
    
    if (data && data.success) {
        console.log('✅ Product reviews retrieved successfully');
        console.log(`Found ${data.data.reviews.length} reviews`);
    } else {
        console.log('❌ Failed to retrieve reviews');
    }
}

async function testGetLowStockProducts() {
    console.log('=== Testing Get Low Stock Products ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/products/admin/low-stock', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Low stock products retrieved successfully');
        console.log(`Found ${data.data.products.length} low stock products`);
    } else {
        console.log('❌ Failed to retrieve low stock products');
    }
}

async function testGetProductStats() {
    console.log('=== Testing Get Product Statistics ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/products/admin/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Product statistics retrieved successfully');
        console.log(`Total products: ${data.data.overview.totalProducts}`);
        console.log(`Active products: ${data.data.overview.activeProducts}`);
        console.log(`Total stock value: $${data.data.overview.totalValue}`);
    } else {
        console.log('❌ Failed to retrieve product statistics');
    }
}

async function testDeactivateProduct() {
    console.log('=== Testing Deactivate Product ===');
    
    if (!productId || !adminToken) {
        console.log('❌ No product ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/products/${productId}/deactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Product deactivated successfully');
    } else {
        console.log('❌ Product deactivation failed');
    }
}

async function testReactivateProduct() {
    console.log('=== Testing Reactivate Product ===');
    
    if (!productId || !adminToken) {
        console.log('❌ No product ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/products/${productId}/reactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Product reactivated successfully');
    } else {
        console.log('❌ Product reactivation failed');
    }
}

async function testDeleteProduct() {
    console.log('=== Testing Delete Product ===');
    
    if (!productId || !adminToken) {
        console.log('❌ No product ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/products/${productId}`, 'DELETE', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Product deleted successfully');
    } else {
        console.log('❌ Product deletion failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Salon Product Management API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication tests
        await testAdminRegistration();
        await testUserRegistration();
        
        if (!adminToken) {
            console.log('❌ Admin authentication failed - cannot proceed with admin tests');
            return;
        }
        
        if (!userToken) {
            console.log('❌ User authentication failed - cannot proceed with user tests');
            return;
        }
        
        // Product management tests
        await testCreateProduct();
        await testGetAllProducts();
        await testGetProduct();
        await testSearchProducts();
        await testGetFeaturedProducts();
        await testGetCategories();
        await testUpdateProduct();
        await testUpdateStock();
        
        // Review tests
        await testAddReview();
        await testGetReviews();
        
        // Admin tests
        await testGetLowStockProducts();
        await testGetProductStats();
        
        // Product lifecycle tests
        await testDeactivateProduct();
        await testReactivateProduct();
        await testDeleteProduct();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();
