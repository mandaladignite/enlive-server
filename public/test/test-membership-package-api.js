import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testAdmin = {
    name: 'Admin User',
    email: 'admin@salon.com',
    password: 'admin123',
    phone: '+1234567890'
};

const testCustomer = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567890'
};

const testPackage = {
    name: 'Premium Hair Care Package',
    description: 'Complete hair care package with premium services',
    price: 2000,
    duration: 3,
    durationUnit: 'months',
    benefits: [
        'Unlimited hair cuts',
        'Free hair wash',
        'Hair treatment included',
        'Priority booking'
    ],
    discountPercentage: 20,
    maxAppointments: 10,
    isPopular: true,
    sortOrder: 1,
    termsAndConditions: 'Valid for 3 months from purchase date'
};

let adminToken = '';
let customerToken = '';
let packageId = '';
let membershipId = '';

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
        adminToken = data.data.accessToken || 'admin_token_placeholder';
        console.log('✅ Admin created successfully');
    } else {
        console.log('❌ Admin creation failed');
    }
}

async function testCreateCustomer() {
    console.log('=== Testing Customer Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testCustomer);
    
    if (data && data.success) {
        console.log('✅ Customer registered successfully');
    } else {
        console.log('❌ Customer registration failed');
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

// Package Tests
async function testGetAllPackages() {
    console.log('=== Testing Get All Packages (Public) ===');
    const { data } = await apiCall('/packages');
    
    if (data && data.success) {
        console.log('✅ Packages retrieved successfully');
        console.log(`Found ${data.data.packages.length} packages`);
    } else {
        console.log('❌ Failed to retrieve packages');
    }
}

async function testCreatePackage() {
    console.log('=== Testing Create Package (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/packages', 'POST', testPackage, adminToken);
    
    if (data && data.success) {
        packageId = data.data._id;
        console.log('✅ Package created successfully');
        console.log(`Package ID: ${packageId}`);
    } else {
        console.log('❌ Package creation failed');
    }
}

async function testGetPackage() {
    console.log('=== Testing Get Single Package (Public) ===');
    
    if (!packageId) {
        console.log('❌ No package ID available');
        return;
    }

    const { data } = await apiCall(`/packages/${packageId}`);
    
    if (data && data.success) {
        console.log('✅ Package retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve package');
    }
}

async function testUpdatePackage() {
    console.log('=== Testing Update Package (Admin) ===');
    
    if (!packageId || !adminToken) {
        console.log('❌ No package ID or admin token available');
        return;
    }

    const updateData = {
        name: 'Premium Hair Care Package - Updated',
        price: 2500,
        discountPercentage: 25
    };

    const { data } = await apiCall(`/packages/${packageId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Package updated successfully');
    } else {
        console.log('❌ Package update failed');
    }
}

async function testGetPopularPackages() {
    console.log('=== Testing Get Popular Packages (Public) ===');
    const { data } = await apiCall('/packages/popular');
    
    if (data && data.success) {
        console.log('✅ Popular packages retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve popular packages');
    }
}

async function testSearchPackages() {
    console.log('=== Testing Search Packages (Public) ===');
    const { data } = await apiCall('/packages/search?q=hair');
    
    if (data && data.success) {
        console.log('✅ Package search successful');
    } else {
        console.log('❌ Package search failed');
    }
}

async function testGetPackageStats() {
    console.log('=== Testing Get Package Statistics (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/packages/admin/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Package statistics retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve package statistics');
    }
}

// Membership Tests
async function testPurchaseMembership() {
    console.log('=== Testing Purchase Membership (Customer) ===');
    
    if (!packageId || !customerToken) {
        console.log('❌ No package ID or customer token available');
        return;
    }

    const membershipData = {
        packageId: packageId,
        paymentMethod: 'razorpay',
        notes: 'Test membership purchase'
    };

    const { data } = await apiCall('/memberships/purchase', 'POST', membershipData, customerToken);
    
    if (data && data.success) {
        membershipId = data.data._id;
        console.log('✅ Membership purchased successfully');
        console.log(`Membership ID: ${membershipId}`);
    } else {
        console.log('❌ Membership purchase failed');
    }
}

async function testGetUserActiveMemberships() {
    console.log('=== Testing Get User Active Memberships (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/memberships/my/active', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Active memberships retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve active memberships');
    }
}

async function testGetUserAllMemberships() {
    console.log('=== Testing Get User All Memberships (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/memberships/my/all', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ All memberships retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve all memberships');
    }
}

async function testGetMembership() {
    console.log('=== Testing Get Single Membership (Customer) ===');
    
    if (!membershipId || !customerToken) {
        console.log('❌ No membership ID or customer token available');
        return;
    }

    const { data } = await apiCall(`/memberships/my/${membershipId}`, 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Membership retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve membership');
    }
}

async function testUpdatePaymentStatus() {
    console.log('=== Testing Update Payment Status (Customer) ===');
    
    if (!membershipId || !customerToken) {
        console.log('❌ No membership ID or customer token available');
        return;
    }

    const paymentData = {
        paymentStatus: 'paid',
        paymentId: 'pay_test123456'
    };

    const { data } = await apiCall(`/memberships/${membershipId}/payment-status`, 'PATCH', paymentData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Payment status updated successfully');
    } else {
        console.log('❌ Payment status update failed');
    }
}

async function testUseAppointment() {
    console.log('=== Testing Use Appointment (Customer) ===');
    
    if (!membershipId || !customerToken) {
        console.log('❌ No membership ID or customer token available');
        return;
    }

    const { data } = await apiCall(`/memberships/my/${membershipId}/use-appointment`, 'PATCH', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Appointment used successfully');
    } else {
        console.log('❌ Appointment usage failed');
    }
}

async function testGetUserMembershipStats() {
    console.log('=== Testing Get User Membership Stats (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/memberships/my/stats', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User membership stats retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user membership stats');
    }
}

// Admin Membership Tests
async function testGetAllMemberships() {
    console.log('=== Testing Get All Memberships (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/memberships/admin/all', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ All memberships retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve all memberships');
    }
}

async function testGetMembershipById() {
    console.log('=== Testing Get Membership by ID (Admin) ===');
    
    if (!membershipId || !adminToken) {
        console.log('❌ No membership ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/memberships/admin/${membershipId}`, 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Membership retrieved by ID successfully');
    } else {
        console.log('❌ Failed to retrieve membership by ID');
    }
}

async function testUpdateMembership() {
    console.log('=== Testing Update Membership (Admin) ===');
    
    if (!membershipId || !adminToken) {
        console.log('❌ No membership ID or admin token available');
        return;
    }

    const updateData = {
        notes: 'Updated by admin',
        remainingAppointments: 8
    };

    const { data } = await apiCall(`/memberships/admin/${membershipId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Membership updated successfully');
    } else {
        console.log('❌ Membership update failed');
    }
}

async function testGetMembershipStats() {
    console.log('=== Testing Get Membership Statistics (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/memberships/admin/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Membership statistics retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve membership statistics');
    }
}

async function testSearchMemberships() {
    console.log('=== Testing Search Memberships (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/memberships/admin/search?q=premium', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Membership search successful');
    } else {
        console.log('❌ Membership search failed');
    }
}

async function testCancelMembership() {
    console.log('=== Testing Cancel Membership (Customer) ===');
    
    if (!membershipId || !customerToken) {
        console.log('❌ No membership ID or customer token available');
        return;
    }

    const cancelData = {
        reason: 'No longer needed'
    };

    const { data } = await apiCall(`/memberships/my/${membershipId}/cancel`, 'PATCH', cancelData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Membership cancelled successfully');
    } else {
        console.log('❌ Membership cancellation failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Membership & Package API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testCreateAdmin();
        await testCreateCustomer();
        await testAdminLogin();
        await testCustomerLogin();
        
        if (!adminToken || !customerToken) {
            console.log('❌ Authentication failed - cannot proceed with tests');
            return;
        }
        
        // Package tests
        console.log('\n--- PACKAGE TESTS ---');
        await testGetAllPackages();
        await testCreatePackage();
        await testGetPackage();
        await testUpdatePackage();
        await testGetPopularPackages();
        await testSearchPackages();
        await testGetPackageStats();
        
        // Membership tests
        console.log('\n--- MEMBERSHIP TESTS ---');
        await testPurchaseMembership();
        await testGetUserActiveMemberships();
        await testGetUserAllMemberships();
        await testGetMembership();
        await testUpdatePaymentStatus();
        await testUseAppointment();
        await testGetUserMembershipStats();
        
        // Admin membership tests
        console.log('\n--- ADMIN MEMBERSHIP TESTS ---');
        await testGetAllMemberships();
        await testGetMembershipById();
        await testUpdateMembership();
        await testGetMembershipStats();
        await testSearchMemberships();
        await testCancelMembership();
        
        console.log('\n✅ All membership and package tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();

