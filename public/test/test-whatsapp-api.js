import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testAdmin = {
    name: 'WhatsApp Admin',
    email: 'whatsapp@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+1234567890'
};

const testCustomer = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567891'
};

let adminToken = '';
let customerToken = '';
let appointmentId = '';
let orderId = '';

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

async function testCreateAdmin() {
    console.log('=== Testing Admin Creation ===');
    const { data } = await apiCall('/auth/create-admin', 'POST', testAdmin);
    
    if (data && data.success) {
        console.log('✅ Admin created successfully');
    } else {
        console.log('❌ Admin creation failed');
    }
}

async function testCreateCustomer() {
    console.log('=== Testing Customer Creation ===');
    const { data } = await apiCall('/auth/register', 'POST', testCustomer);
    
    if (data && data.success) {
        console.log('✅ Customer created successfully');
    } else {
        console.log('❌ Customer creation failed');
    }
}

async function testAdminLogin() {
    console.log('=== Testing Admin Login ===');
    const { data } = await apiCall('/auth/login', 'POST', {
        email: testAdmin.email,
        password: testAdmin.password
    });
    
    if (data && data.success) {
        adminToken = data.data.accessToken;
        console.log('✅ Admin login successful');
    } else {
        console.log('❌ Admin login failed');
    }
}

async function testCustomerLogin() {
    console.log('=== Testing Customer Login ===');
    const { data } = await apiCall('/auth/login', 'POST', {
        email: testCustomer.email,
        password: testCustomer.password
    });
    
    if (data && data.success) {
        customerToken = data.data.accessToken;
        console.log('✅ Customer login successful');
    } else {
        console.log('❌ Customer login failed');
    }
}

// WhatsApp Service Tests
async function testGetWhatsAppStatus() {
    console.log('=== Testing Get WhatsApp Service Status ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/whatsapp/status', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ WhatsApp service status retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve WhatsApp service status');
    }
}

async function testSendCustomMessage() {
    console.log('=== Testing Send Custom Message ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const messageData = {
        to: '+1234567890',
        message: 'Hello! This is a test message from the salon API.',
        messageType: 'text'
    };

    const { data } = await apiCall('/whatsapp/send/custom', 'POST', messageData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Custom message sent successfully');
    } else {
        console.log('❌ Custom message sending failed');
    }
}

async function testSendBulkMessages() {
    console.log('=== Testing Send Bulk Messages ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const bulkData = {
        messages: [
            {
                to: '+1234567890',
                message: 'Bulk message 1: Welcome to our salon!'
            },
            {
                to: '+1234567891',
                message: 'Bulk message 2: Thank you for choosing us!'
            }
        ]
    };

    const { data } = await apiCall('/whatsapp/send/bulk', 'POST', bulkData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Bulk messages sent successfully');
    } else {
        console.log('❌ Bulk messages sending failed');
    }
}

async function testSendPromotionalMessage() {
    console.log('=== Testing Send Promotional Message ===');
    
    if (!adminToken || !customerToken) {
        console.log('❌ No admin or customer token available');
        return;
    }

    // First, get customer ID
    const customerProfile = await apiCall('/profile', 'GET', null, customerToken);
    if (!customerProfile.data || !customerProfile.data.user) {
        console.log('❌ Could not get customer profile');
        return;
    }

    const customerId = customerProfile.data.user._id;
    const promotionalData = {
        title: 'Special Offer!',
        description: 'Get 20% off on all hair services this week',
        discountPercentage: 20,
        validUntil: '2024-12-31T23:59:59.000Z',
        promoCode: 'HAIR20'
    };

    const { data } = await apiCall(`/whatsapp/promotional/${customerId}`, 'POST', promotionalData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Promotional message sent successfully');
    } else {
        console.log('❌ Promotional message sending failed');
    }
}

async function testSendBulkPromotionalMessage() {
    console.log('=== Testing Send Bulk Promotional Message ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const promotionalData = {
        title: 'New Year Special!',
        description: 'Ring in the new year with 30% off all services',
        discountPercentage: 30,
        validUntil: '2024-12-31T23:59:59.000Z',
        promoCode: 'NEWYEAR30',
        customerFilter: {
            role: 'customer'
        }
    };

    const { data } = await apiCall('/whatsapp/promotional/bulk', 'POST', promotionalData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Bulk promotional message sent successfully');
    } else {
        console.log('❌ Bulk promotional message sending failed');
    }
}

// Appointment Integration Tests
async function testCreateAppointment() {
    console.log('=== Testing Create Appointment (with WhatsApp) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    // First, get available services
    const services = await apiCall('/services');
    if (!services.data || !services.data.data || services.data.data.length === 0) {
        console.log('❌ No services available');
        return;
    }

    const serviceId = services.data.data[0]._id;
    const appointmentData = {
        serviceId: serviceId,
        date: '2024-12-25',
        timeSlot: '10:00',
        location: 'salon',
        notes: 'Test appointment with WhatsApp notification'
    };

    const { data } = await apiCall('/appointments', 'POST', appointmentData, customerToken);
    
    if (data && data.success) {
        appointmentId = data.data._id;
        console.log('✅ Appointment created successfully with WhatsApp notification');
        console.log(`Appointment ID: ${appointmentId}`);
    } else {
        console.log('❌ Appointment creation failed');
    }
}

async function testSendAppointmentConfirmation() {
    console.log('=== Testing Send Appointment Confirmation ===');
    
    if (!appointmentId || !adminToken) {
        console.log('❌ No appointment ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/whatsapp/appointment/${appointmentId}/confirm`, 'POST', {}, adminToken);
    
    if (data && data.success) {
        console.log('✅ Appointment confirmation sent successfully');
    } else {
        console.log('❌ Appointment confirmation sending failed');
    }
}

async function testSendAppointmentCancellation() {
    console.log('=== Testing Send Appointment Cancellation ===');
    
    if (!appointmentId || !adminToken) {
        console.log('❌ No appointment ID or admin token available');
        return;
    }

    const cancellationData = {
        reason: 'Customer requested cancellation'
    };

    const { data } = await apiCall(`/whatsapp/appointment/${appointmentId}/cancel`, 'POST', cancellationData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Appointment cancellation sent successfully');
    } else {
        console.log('❌ Appointment cancellation sending failed');
    }
}

async function testSendBulkAppointmentReminders() {
    console.log('=== Testing Send Bulk Appointment Reminders ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const reminderData = {
        hoursBefore: 24
    };

    const { data } = await apiCall('/whatsapp/appointment/reminders/bulk', 'POST', reminderData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Bulk appointment reminders sent successfully');
    } else {
        console.log('❌ Bulk appointment reminders sending failed');
    }
}

// Order Integration Tests
async function testCreateOrder() {
    console.log('=== Testing Create Order (with WhatsApp) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    // First, get available products
    const products = await apiCall('/products');
    if (!products.data || !products.data.data || products.data.data.length === 0) {
        console.log('❌ No products available');
        return;
    }

    const productId = products.data.data[0]._id;

    // Add product to cart
    const cartData = {
        productId: productId,
        quantity: 2
    };

    await apiCall('/cart/add', 'POST', cartData, customerToken);

    // Set shipping address
    const addressData = {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
    };

    await apiCall('/cart/shipping-address', 'POST', addressData, customerToken);

    // Create order
    const orderData = {
        paymentMethod: 'razorpay',
        notes: 'Test order with WhatsApp notification'
    };

    const { data } = await apiCall('/orders', 'POST', orderData, customerToken);
    
    if (data && data.success) {
        orderId = data.data.order._id;
        console.log('✅ Order created successfully with WhatsApp notification');
        console.log(`Order ID: ${orderId}`);
    } else {
        console.log('❌ Order creation failed');
    }
}

async function testSendOrderConfirmation() {
    console.log('=== Testing Send Order Confirmation ===');
    
    if (!orderId || !adminToken) {
        console.log('❌ No order ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/whatsapp/order/${orderId}/confirm`, 'POST', {}, adminToken);
    
    if (data && data.success) {
        console.log('✅ Order confirmation sent successfully');
    } else {
        console.log('❌ Order confirmation sending failed');
    }
}

async function testSendOrderStatusUpdate() {
    console.log('=== Testing Send Order Status Update ===');
    
    if (!orderId || !adminToken) {
        console.log('❌ No order ID or admin token available');
        return;
    }

    const statusData = {
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2024-12-30T18:00:00.000Z'
    };

    const { data } = await apiCall(`/whatsapp/order/${orderId}/status`, 'POST', statusData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Order status update sent successfully');
    } else {
        console.log('❌ Order status update sending failed');
    }
}

// Webhook Tests
async function testWebhookVerification() {
    console.log('=== Testing Webhook Verification ===');
    
    const { data } = await apiCall('/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_token&hub.challenge=test_challenge');
    
    if (data === 'test_challenge') {
        console.log('✅ Webhook verification successful');
    } else {
        console.log('❌ Webhook verification failed');
    }
}

async function testWebhookProcessing() {
    console.log('=== Testing Webhook Processing ===');
    
    const webhookData = {
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        id: 'test_message_id',
                        from: '+1234567890',
                        timestamp: '1234567890',
                        type: 'text',
                        text: {
                            body: 'Hello from WhatsApp!'
                        }
                    }],
                    contacts: [{
                        profile: {
                            name: 'Test User'
                        },
                        wa_id: '+1234567890'
                    }]
                }
            }]
        }]
    };

    const { data } = await apiCall('/whatsapp/webhook', 'POST', webhookData);
    
    if (data && data.success) {
        console.log('✅ Webhook processing successful');
    } else {
        console.log('❌ Webhook processing failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting WhatsApp API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testCreateAdmin();
        await testCreateCustomer();
        await testAdminLogin();
        await testCustomerLogin();
        
        if (!adminToken) {
            console.log('❌ Authentication failed - cannot proceed with admin tests');
            return;
        }
        
        // WhatsApp Service Tests
        console.log('\n--- WHATSAPP SERVICE TESTS ---');
        await testGetWhatsAppStatus();
        await testSendCustomMessage();
        await testSendBulkMessages();
        await testSendPromotionalMessage();
        await testSendBulkPromotionalMessage();
        
        // Appointment Integration Tests
        console.log('\n--- APPOINTMENT INTEGRATION TESTS ---');
        await testCreateAppointment();
        await testSendAppointmentConfirmation();
        await testSendAppointmentCancellation();
        await testSendBulkAppointmentReminders();
        
        // Order Integration Tests
        console.log('\n--- ORDER INTEGRATION TESTS ---');
        await testCreateOrder();
        await testSendOrderConfirmation();
        await testSendOrderStatusUpdate();
        
        // Webhook Tests
        console.log('\n--- WEBHOOK TESTS ---');
        await testWebhookVerification();
        await testWebhookProcessing();
        
        console.log('\n✅ All WhatsApp tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();

