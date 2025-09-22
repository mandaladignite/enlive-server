import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testAdmin = {
    name: 'Admin User',
    email: 'admin@salon.com',
    password: 'admin123',
    role: 'admin'
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
    email: 'john@salon.com',
    phone: '+1234567890',
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

let adminToken = '';
let serviceId = '';
let stylistId = '';

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

// Service Tests
async function testGetAllServices() {
    console.log('=== Testing Get All Services (Public) ===');
    const { data } = await apiCall('/services');
    
    if (data && data.success) {
        console.log('✅ Services retrieved successfully');
        console.log(`Found ${data.data.services.length} services`);
    } else {
        console.log('❌ Failed to retrieve services');
    }
}

async function testCreateService() {
    console.log('=== Testing Create Service (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/services', 'POST', testService, adminToken);
    
    if (data && data.success) {
        serviceId = data.data._id;
        console.log('✅ Service created successfully');
        console.log(`Service ID: ${serviceId}`);
    } else {
        console.log('❌ Service creation failed');
    }
}

async function testGetService() {
    console.log('=== Testing Get Single Service (Public) ===');
    
    if (!serviceId) {
        console.log('❌ No service ID available');
        return;
    }

    const { data } = await apiCall(`/services/${serviceId}`);
    
    if (data && data.success) {
        console.log('✅ Service retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve service');
    }
}

async function testUpdateService() {
    console.log('=== Testing Update Service (Admin) ===');
    
    if (!serviceId || !adminToken) {
        console.log('❌ No service ID or admin token available');
        return;
    }

    const updateData = {
        name: 'Premium Hair Cut',
        price: 600,
        duration: 75
    };

    const { data } = await apiCall(`/services/${serviceId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Service updated successfully');
    } else {
        console.log('❌ Service update failed');
    }
}

async function testDeactivateService() {
    console.log('=== Testing Deactivate Service (Admin) ===');
    
    if (!serviceId || !adminToken) {
        console.log('❌ No service ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/services/${serviceId}/deactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Service deactivated successfully');
    } else {
        console.log('❌ Service deactivation failed');
    }
}

async function testReactivateService() {
    console.log('=== Testing Reactivate Service (Admin) ===');
    
    if (!serviceId || !adminToken) {
        console.log('❌ No service ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/services/${serviceId}/reactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Service reactivated successfully');
    } else {
        console.log('❌ Service reactivation failed');
    }
}

async function testGetServiceStats() {
    console.log('=== Testing Get Service Statistics (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/services/admin/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Service statistics retrieved successfully');
        console.log(`Total services: ${data.data.overview.totalServices}`);
        console.log(`Active services: ${data.data.overview.activeServices}`);
    } else {
        console.log('❌ Failed to retrieve service statistics');
    }
}

async function testDeleteService() {
    console.log('=== Testing Delete Service (Admin) ===');
    
    if (!serviceId || !adminToken) {
        console.log('❌ No service ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/services/${serviceId}`, 'DELETE', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Service deleted successfully');
    } else {
        console.log('❌ Service deletion failed');
    }
}

// Stylist Tests
async function testGetAllStylists() {
    console.log('=== Testing Get All Stylists (Public) ===');
    const { data } = await apiCall('/stylists');
    
    if (data && data.success) {
        console.log('✅ Stylists retrieved successfully');
        console.log(`Found ${data.data.stylists.length} stylists`);
    } else {
        console.log('❌ Failed to retrieve stylists');
    }
}

async function testCreateStylist() {
    console.log('=== Testing Create Stylist (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/stylists', 'POST', testStylist, adminToken);
    
    if (data && data.success) {
        stylistId = data.data._id;
        console.log('✅ Stylist created successfully');
        console.log(`Stylist ID: ${stylistId}`);
    } else {
        console.log('❌ Stylist creation failed');
    }
}

async function testGetStylist() {
    console.log('=== Testing Get Single Stylist (Public) ===');
    
    if (!stylistId) {
        console.log('❌ No stylist ID available');
        return;
    }

    const { data } = await apiCall(`/stylists/${stylistId}`);
    
    if (data && data.success) {
        console.log('✅ Stylist retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve stylist');
    }
}

async function testUpdateStylist() {
    console.log('=== Testing Update Stylist (Admin) ===');
    
    if (!stylistId || !adminToken) {
        console.log('❌ No stylist ID or admin token available');
        return;
    }

    const updateData = {
        name: 'John Doe-Smith',
        experience: 6,
        rating: 4.7,
        bio: 'Senior stylist with 6 years of experience'
    };

    const { data } = await apiCall(`/stylists/${stylistId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist updated successfully');
    } else {
        console.log('❌ Stylist update failed');
    }
}

async function testUpdateStylistRating() {
    console.log('=== Testing Update Stylist Rating (Admin) ===');
    
    if (!stylistId || !adminToken) {
        console.log('❌ No stylist ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/stylists/${stylistId}/rating`, 'PATCH', { rating: 4.8 }, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist rating updated successfully');
    } else {
        console.log('❌ Stylist rating update failed');
    }
}

async function testDeactivateStylist() {
    console.log('=== Testing Deactivate Stylist (Admin) ===');
    
    if (!stylistId || !adminToken) {
        console.log('❌ No stylist ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/stylists/${stylistId}/deactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist deactivated successfully');
    } else {
        console.log('❌ Stylist deactivation failed');
    }
}

async function testReactivateStylist() {
    console.log('=== Testing Reactivate Stylist (Admin) ===');
    
    if (!stylistId || !adminToken) {
        console.log('❌ No stylist ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/stylists/${stylistId}/reactivate`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist reactivated successfully');
    } else {
        console.log('❌ Stylist reactivation failed');
    }
}

async function testGetStylistStats() {
    console.log('=== Testing Get Stylist Statistics (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/stylists/admin/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist statistics retrieved successfully');
        console.log(`Total stylists: ${data.data.overview.totalStylists}`);
        console.log(`Active stylists: ${data.data.overview.activeStylists}`);
    } else {
        console.log('❌ Failed to retrieve stylist statistics');
    }
}

async function testDeleteStylist() {
    console.log('=== Testing Delete Stylist (Admin) ===');
    
    if (!stylistId || !adminToken) {
        console.log('❌ No stylist ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/stylists/${stylistId}`, 'DELETE', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Stylist deleted successfully');
    } else {
        console.log('❌ Stylist deletion failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Services & Stylists Admin API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testAdminRegistration();
        
        if (!adminToken) {
            console.log('❌ Admin authentication failed - cannot proceed with admin tests');
            return;
        }
        
        // Service tests
        console.log('\n--- SERVICE TESTS ---');
        await testGetAllServices();
        await testCreateService();
        await testGetService();
        await testUpdateService();
        await testDeactivateService();
        await testReactivateService();
        await testGetServiceStats();
        await testDeleteService();
        
        // Stylist tests
        console.log('\n--- STYLIST TESTS ---');
        await testGetAllStylists();
        await testCreateStylist();
        await testGetStylist();
        await testUpdateStylist();
        await testUpdateStylistRating();
        await testDeactivateStylist();
        await testReactivateStylist();
        await testGetStylistStats();
        await testDeleteStylist();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();
