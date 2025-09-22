import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';

// Test data
const testCustomer = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567890'
};

const testGuest = {
    name: 'Guest User',
    email: 'guest@example.com',
    password: 'password123',
    role: 'guest'
};

const testAdmin = {
    name: 'Admin User',
    email: 'admin@salon.com',
    password: 'admin123',
    phone: '+1234567890'
};

let customerToken = '';
let adminToken = '';

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

async function testCustomerRegistration() {
    console.log('=== Testing Customer Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testCustomer);
    
    if (data && data.success) {
        console.log('✅ Customer registered successfully');
    } else {
        console.log('❌ Customer registration failed');
    }
}

async function testGuestRegistration() {
    console.log('=== Testing Guest Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testGuest);
    
    if (data && data.success) {
        console.log('✅ Guest registered successfully');
    } else {
        console.log('❌ Guest registration failed');
    }
}

async function testAdminRegistrationAttempt() {
    console.log('=== Testing Admin Registration Attempt (Should Fail) ===');
    const adminRegistrationData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
    };
    
    const { data } = await apiCall('/auth/register', 'POST', adminRegistrationData);
    
    if (data && data.success) {
        console.log('❌ Admin registration should have failed but succeeded');
    } else if (data && data.message.includes('Admin accounts cannot be created')) {
        console.log('✅ Admin registration correctly blocked');
    } else {
        console.log('❌ Unexpected error in admin registration test');
    }
}

async function testCreateAdmin() {
    console.log('=== Testing Admin Creation (Developer Endpoint) ===');
    const { data } = await apiCall('/auth/create-admin', 'POST', testAdmin);
    
    if (data && data.success) {
        adminToken = data.data.accessToken || 'admin_token_placeholder';
        console.log('✅ Admin created successfully');
    } else {
        console.log('❌ Admin creation failed');
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

async function testGetProfile() {
    console.log('=== Testing Get Profile (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/auth/profile', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Profile retrieved successfully');
        console.log(`User role: ${data.data.role}`);
    } else {
        console.log('❌ Profile retrieval failed');
    }
}

async function testUpdateProfile() {
    console.log('=== Testing Update Profile (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const updateData = {
        name: 'John Smith',
        phone: '+1234567891'
    };

    const { data } = await apiCall('/auth/profile', 'PUT', updateData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Profile updated successfully');
    } else {
        console.log('❌ Profile update failed');
    }
}

async function testChangePassword() {
    console.log('=== Testing Change Password (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const passwordData = {
        oldPassword: testCustomer.password,
        newPassword: 'newpassword123'
    };

    const { data } = await apiCall('/auth/change-password', 'PUT', passwordData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Password changed successfully');
    } else {
        console.log('❌ Password change failed');
    }
}

async function testGetAllUsers() {
    console.log('=== Testing Get All Users (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/auth/users', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Users retrieved successfully');
        console.log(`Found ${data.data.docs.length} users`);
    } else {
        console.log('❌ Users retrieval failed');
    }
}

async function testGetUserById() {
    console.log('=== Testing Get User by ID (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    // First get all users to get a user ID
    const { data: usersData } = await apiCall('/auth/users', 'GET', null, adminToken);
    
    if (usersData && usersData.success && usersData.data.docs.length > 0) {
        const userId = usersData.data.docs[0]._id;
        const { data } = await apiCall(`/auth/users/${userId}`, 'GET', null, adminToken);
        
        if (data && data.success) {
            console.log('✅ User retrieved by ID successfully');
        } else {
            console.log('❌ User retrieval by ID failed');
        }
    } else {
        console.log('❌ No users available for testing');
    }
}

async function testUpdateUserById() {
    console.log('=== Testing Update User by ID (Admin) ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    // First get all users to get a user ID
    const { data: usersData } = await apiCall('/auth/users', 'GET', null, adminToken);
    
    if (usersData && usersData.success && usersData.data.docs.length > 0) {
        const userId = usersData.data.docs[0]._id;
        const updateData = {
            name: 'Updated User Name',
            phone: '+9876543210'
        };
        
        const { data } = await apiCall(`/auth/users/${userId}`, 'PUT', updateData, adminToken);
        
        if (data && data.success) {
            console.log('✅ User updated by ID successfully');
        } else {
            console.log('❌ User update by ID failed');
        }
    } else {
        console.log('❌ No users available for testing');
    }
}

async function testRefreshToken() {
    console.log('=== Testing Refresh Token ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/auth/refresh-token', 'POST', {
        refreshToken: 'refresh_token_placeholder'
    });
    
    if (data && data.success) {
        console.log('✅ Token refreshed successfully');
    } else {
        console.log('❌ Token refresh failed (expected if no valid refresh token)');
    }
}

async function testLogout() {
    console.log('=== Testing Logout (Customer) ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/auth/logout', 'POST', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Logout successful');
    } else {
        console.log('❌ Logout failed');
    }
}

async function testInvalidRoleRegistration() {
    console.log('=== Testing Invalid Role Registration (Should Fail) ===');
    const invalidRoleData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid_role'
    };
    
    const { data } = await apiCall('/auth/register', 'POST', invalidRoleData);
    
    if (data && data.success) {
        console.log('❌ Invalid role registration should have failed but succeeded');
    } else if (data && data.message.includes('Invalid role')) {
        console.log('✅ Invalid role registration correctly blocked');
    } else {
        console.log('❌ Unexpected error in invalid role registration test');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Authentication System Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Registration tests
        console.log('\n--- REGISTRATION TESTS ---');
        await testCustomerRegistration();
        await testGuestRegistration();
        await testAdminRegistrationAttempt();
        await testInvalidRoleRegistration();
        await testCreateAdmin();
        
        // Login tests
        console.log('\n--- LOGIN TESTS ---');
        await testCustomerLogin();
        await testAdminLogin();
        
        // Profile tests
        console.log('\n--- PROFILE TESTS ---');
        await testGetProfile();
        await testUpdateProfile();
        await testChangePassword();
        
        // Admin tests
        console.log('\n--- ADMIN TESTS ---');
        await testGetAllUsers();
        await testGetUserById();
        await testUpdateUserById();
        
        // Token tests
        console.log('\n--- TOKEN TESTS ---');
        await testRefreshToken();
        
        // Logout test
        console.log('\n--- LOGOUT TESTS ---');
        await testLogout();
        
        console.log('\n✅ All authentication tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();

