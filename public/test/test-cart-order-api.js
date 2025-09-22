import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
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
    description: 'Gentle cleansing shampoo for all hair types',
    imageUrls: ['https://example.com/shampoo1.jpg'],
    brand: 'SalonPro',
    sku: 'SP-HS-001',
    isFeatured: true
};

const testProduct2 = {
    name: 'Hair Conditioner',
    category: 'hair_care',
    price: 19.99,
    stock: 30,
    description: 'Moisturizing conditioner for smooth hair',
    imageUrls: ['https://example.com/conditioner1.jpg'],
    brand: 'SalonPro',
    sku: 'SP-HC-001'
};

let authToken = '';
let productId1 = '';
let productId2 = '';
let cart = null;
let order = null;

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

async function testUserRegistration() {
    console.log('=== Testing User Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testUser);
    
    if (data && data.success) {
        authToken = data.data.accessToken;
        console.log('✅ User registered successfully');
    } else {
        console.log('❌ User registration failed');
    }
}

async function testCreateProducts() {
    console.log('=== Testing Product Creation ===');
    
    if (!authToken) {
        console.log('❌ No auth token available - cannot create products');
        return;
    }

    // Create first product
    const { data: product1 } = await apiCall('/products', 'POST', testProduct, authToken);
    if (product1 && product1.success) {
        productId1 = product1.data._id;
        console.log('✅ Product 1 created successfully');
    } else {
        console.log('❌ Product 1 creation failed');
    }

    // Create second product
    const { data: product2 } = await apiCall('/products', 'POST', testProduct2, authToken);
    if (product2 && product2.success) {
        productId2 = product2.data._id;
        console.log('✅ Product 2 created successfully');
    } else {
        console.log('❌ Product 2 creation failed');
    }
}

async function testGetCart() {
    console.log('=== Testing Get Cart ===');
    const { data } = await apiCall('/cart', 'GET', null, authToken);
    
    if (data && data.success) {
        cart = data.data;
        console.log('✅ Cart retrieved successfully');
        console.log(`Cart has ${cart.items.length} items`);
    } else {
        console.log('❌ Failed to retrieve cart');
    }
}

async function testAddToCart() {
    console.log('=== Testing Add to Cart ===');
    
    if (!productId1) {
        console.log('❌ No product ID available');
        return;
    }

    const { data } = await apiCall('/cart/items', 'POST', {
        productId: productId1,
        quantity: 2
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Item added to cart successfully');
    } else {
        console.log('❌ Failed to add item to cart');
    }
}

async function testAddSecondItem() {
    console.log('=== Testing Add Second Item to Cart ===');
    
    if (!productId2) {
        console.log('❌ No second product ID available');
        return;
    }

    const { data } = await apiCall('/cart/items', 'POST', {
        productId: productId2,
        quantity: 1
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Second item added to cart successfully');
    } else {
        console.log('❌ Failed to add second item to cart');
    }
}

async function testUpdateCartItem() {
    console.log('=== Testing Update Cart Item ===');
    
    if (!productId1) {
        console.log('❌ No product ID available');
        return;
    }

    const { data } = await apiCall(`/cart/items/${productId1}`, 'PUT', {
        quantity: 3
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Cart item updated successfully');
    } else {
        console.log('❌ Failed to update cart item');
    }
}

async function testApplyDiscount() {
    console.log('=== Testing Apply Discount ===');
    
    const { data } = await apiCall('/cart/discount', 'POST', {
        discountCode: 'WELCOME10'
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Discount applied successfully');
    } else {
        console.log('❌ Failed to apply discount');
    }
}

async function testUpdateShippingAddress() {
    console.log('=== Testing Update Shipping Address ===');
    
    const { data } = await apiCall('/cart/shipping-address', 'PUT', {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        phone: '+1234567890',
        country: 'India'
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Shipping address updated successfully');
    } else {
        console.log('❌ Failed to update shipping address');
    }
}

async function testGetCartSummary() {
    console.log('=== Testing Get Cart Summary ===');
    const { data } = await apiCall('/cart/summary', 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Cart summary retrieved successfully');
        console.log(`Total items: ${data.data.totalItems}`);
        console.log(`Subtotal: $${data.data.subtotal}`);
        console.log(`Final amount: $${data.data.finalAmount}`);
    } else {
        console.log('❌ Failed to retrieve cart summary');
    }
}

async function testCreateOrder() {
    console.log('=== Testing Create Order ===');
    
    const { data } = await apiCall('/orders', 'POST', {
        paymentMethod: 'razorpay',
        notes: 'Please handle with care'
    }, authToken);
    
    if (data && data.success) {
        order = data.data.order;
        console.log('✅ Order created successfully');
        console.log(`Order Number: ${order.orderNumber}`);
        console.log(`Total Amount: $${order.totalAmount}`);
    } else {
        console.log('❌ Order creation failed');
    }
}

async function testVerifyPayment() {
    console.log('=== Testing Verify Payment (Mock) ===');
    
    if (!order) {
        console.log('❌ No order available');
        return;
    }

    // Mock payment verification - in real scenario, this would come from Razorpay
    const mockPaymentData = {
        orderId: order.paymentDetails.razorpayOrderId,
        paymentId: 'pay_mock_1234567890',
        signature: 'mock_signature_1234567890'
    };

    const { data } = await apiCall('/orders/verify-payment', 'POST', mockPaymentData, authToken);
    
    if (data && data.success) {
        console.log('✅ Payment verified successfully (mock)');
    } else {
        console.log('❌ Payment verification failed');
    }
}

async function testGetUserOrders() {
    console.log('=== Testing Get User Orders ===');
    const { data } = await apiCall('/orders/my-orders', 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ User orders retrieved successfully');
        console.log(`Found ${data.data.orders.length} orders`);
    } else {
        console.log('❌ Failed to retrieve user orders');
    }
}

async function testGetOrder() {
    console.log('=== Testing Get Single Order ===');
    
    if (!order) {
        console.log('❌ No order available');
        return;
    }

    const { data } = await apiCall(`/orders/${order._id}`, 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Order retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve order');
    }
}

async function testGetOrderTracking() {
    console.log('=== Testing Get Order Tracking ===');
    
    if (!order) {
        console.log('❌ No order available');
        return;
    }

    const { data } = await apiCall(`/orders/${order._id}/tracking`, 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Order tracking retrieved successfully');
        console.log(`Order Status: ${data.data.status}`);
    } else {
        console.log('❌ Failed to retrieve order tracking');
    }
}

async function testCancelOrder() {
    console.log('=== Testing Cancel Order ===');
    
    if (!order) {
        console.log('❌ No order available');
        return;
    }

    const { data } = await apiCall(`/orders/${order._id}/cancel`, 'PATCH', {
        reason: 'Change of mind'
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Order cancelled successfully');
    } else {
        console.log('❌ Order cancellation failed');
    }
}

async function testRequestReturn() {
    console.log('=== Testing Request Return ===');
    
    if (!order) {
        console.log('❌ No order available');
        return;
    }

    const { data } = await apiCall(`/orders/${order._id}/return`, 'POST', {
        reason: 'Product damaged'
    }, authToken);
    
    if (data && data.success) {
        console.log('✅ Return request submitted successfully');
    } else {
        console.log('❌ Return request failed');
    }
}

async function testRemoveFromCart() {
    console.log('=== Testing Remove from Cart ===');
    
    if (!productId2) {
        console.log('❌ No second product ID available');
        return;
    }

    const { data } = await apiCall(`/cart/items/${productId2}`, 'DELETE', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Item removed from cart successfully');
    } else {
        console.log('❌ Failed to remove item from cart');
    }
}

async function testClearCart() {
    console.log('=== Testing Clear Cart ===');
    
    const { data } = await apiCall('/cart', 'DELETE', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Cart cleared successfully');
    } else {
        console.log('❌ Failed to clear cart');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Cart & Order Management API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testUserRegistration();
        
        if (!authToken) {
            console.log('❌ Authentication failed - cannot proceed with tests');
            return;
        }
        
        // Product setup
        await testCreateProducts();
        
        if (!productId1 || !productId2) {
            console.log('❌ Product creation failed - cannot proceed with cart tests');
            return;
        }
        
        // Cart tests
        await testGetCart();
        await testAddToCart();
        await testAddSecondItem();
        await testUpdateCartItem();
        await testApplyDiscount();
        await testUpdateShippingAddress();
        await testGetCartSummary();
        
        // Order tests
        await testCreateOrder();
        await testVerifyPayment();
        await testGetUserOrders();
        await testGetOrder();
        await testGetOrderTracking();
        await testCancelOrder();
        await testRequestReturn();
        
        // Cart cleanup tests
        await testRemoveFromCart();
        await testClearCart();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();
