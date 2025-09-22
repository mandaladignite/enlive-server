import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+1234567890'
};

const testService = {
    name: 'Hair Cut',
    description: 'Professional hair cutting service',
    duration: 60,
    price: 500,
    category: 'hair',
    availableAtHome: false,
    availableAtSalon: true
};

const testStylist = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567891',
    specialties: ['hair'],
    experience: 5,
    rating: 4.5,
    bio: 'Professional stylist with 5 years experience',
    workingHours: {
        start: '09:00',
        end: '18:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    availableForHome: false,
    availableForSalon: true
};

let authToken = '';
let serviceId = '';
let stylistId = '';
let appointmentId = '';

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

async function testUserLogin() {
    console.log('=== Testing User Login ===');
    const { data } = await apiCall('/auth/login', 'POST', {
        email: testUser.email,
        password: testUser.password
    });
    
    if (data && data.success) {
        authToken = data.data.accessToken;
        console.log('✅ User logged in successfully');
    } else {
        console.log('❌ User login failed');
    }
}

async function testCreateService() {
    console.log('=== Testing Service Creation (Admin) ===');
    // Note: This would require admin privileges in a real scenario
    // For testing purposes, we'll assume the service exists
    console.log('ℹ️  Service creation requires admin privileges - skipping for demo');
}

async function testGetServices() {
    console.log('=== Testing Get Services ===');
    const { data } = await apiCall('/services');
    
    if (data && data.success && data.data.services.length > 0) {
        serviceId = data.data.services[0]._id;
        console.log('✅ Services retrieved successfully');
        console.log(`Using service ID: ${serviceId}`);
    } else {
        console.log('❌ No services found - please create services first');
    }
}

async function testCreateStylist() {
    console.log('=== Testing Stylist Creation (Admin) ===');
    // Note: This would require admin privileges in a real scenario
    console.log('ℹ️  Stylist creation requires admin privileges - skipping for demo');
}

async function testGetStylists() {
    console.log('=== Testing Get Stylists ===');
    const { data } = await apiCall('/stylists');
    
    if (data && data.success && data.data.stylists.length > 0) {
        stylistId = data.data.stylists[0]._id;
        console.log('✅ Stylists retrieved successfully');
        console.log(`Using stylist ID: ${stylistId}`);
    } else {
        console.log('❌ No stylists found - please create stylists first');
    }
}

async function testCreateAppointment() {
    console.log('=== Testing Appointment Creation ===');
    
    if (!serviceId) {
        console.log('❌ No service ID available - cannot create appointment');
        return;
    }

    const appointmentData = {
        serviceId,
        stylistId: stylistId || undefined,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        timeSlot: '14:30',
        location: 'salon',
        notes: 'Please be gentle with my hair'
    };

    const { data } = await apiCall('/appointments', 'POST', appointmentData, authToken);
    
    if (data && data.success) {
        appointmentId = data.data._id;
        console.log('✅ Appointment created successfully');
        console.log(`Appointment ID: ${appointmentId}`);
    } else {
        console.log('❌ Appointment creation failed');
    }
}

async function testGetUserAppointments() {
    console.log('=== Testing Get User Appointments ===');
    const { data } = await apiCall('/appointments/my-appointments', 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ User appointments retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user appointments');
    }
}

async function testGetAppointment() {
    console.log('=== Testing Get Single Appointment ===');
    
    if (!appointmentId) {
        console.log('❌ No appointment ID available');
        return;
    }

    const { data } = await apiCall(`/appointments/${appointmentId}`, 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Appointment retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve appointment');
    }
}

async function testUpdateAppointment() {
    console.log('=== Testing Update Appointment ===');
    
    if (!appointmentId) {
        console.log('❌ No appointment ID available');
        return;
    }

    const updateData = {
        timeSlot: '15:00',
        notes: 'Updated appointment notes'
    };

    const { data } = await apiCall(`/appointments/${appointmentId}`, 'PUT', updateData, authToken);
    
    if (data && data.success) {
        console.log('✅ Appointment updated successfully');
    } else {
        console.log('❌ Appointment update failed');
    }
}

async function testGetAvailableTimeSlots() {
    console.log('=== Testing Get Available Time Slots ===');
    
    if (!stylistId) {
        console.log('❌ No stylist ID available');
        return;
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data } = await apiCall(`/appointments/time-slots/available?stylistId=${stylistId}&date=${tomorrow}`, 'GET', null, authToken);
    
    if (data && data.success) {
        console.log('✅ Available time slots retrieved successfully');
        console.log(`Available slots: ${data.data.availableSlots.length}`);
    } else {
        console.log('❌ Failed to retrieve available time slots');
    }
}

async function testCancelAppointment() {
    console.log('=== Testing Cancel Appointment ===');
    
    if (!appointmentId) {
        console.log('❌ No appointment ID available');
        return;
    }

    const cancelData = {
        cancellationReason: 'Change of plans'
    };

    const { data } = await apiCall(`/appointments/${appointmentId}/cancel`, 'PATCH', cancelData, authToken);
    
    if (data && data.success) {
        console.log('✅ Appointment cancelled successfully');
    } else {
        console.log('❌ Appointment cancellation failed');
    }
}

async function testHealthCheck() {
    console.log('=== Testing Health Check ===');
    const { data } = await apiCall('/health');
    
    if (data && data.success) {
        console.log('✅ Server is running');
    } else {
        console.log('❌ Server health check failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Salon Appointment API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication tests
        await testUserRegistration();
        if (!authToken) {
            await testUserLogin();
        }
        
        if (!authToken) {
            console.log('❌ Authentication failed - cannot proceed with protected tests');
            return;
        }
        
        // Service tests
        await testGetServices();
        
        // Stylist tests
        await testGetStylists();
        
        // Appointment tests
        await testCreateAppointment();
        await testGetUserAppointments();
        await testGetAppointment();
        await testUpdateAppointment();
        await testGetAvailableTimeSlots();
        await testCancelAppointment();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();
