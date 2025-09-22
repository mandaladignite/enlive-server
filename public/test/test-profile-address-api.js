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

const testAddress = {
    label: 'Home',
    street: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
    landmark: 'Near Central Mall',
    addressType: 'home',
    contactNumber: '+1234567890',
    instructions: 'Ring the doorbell twice'
};

let customerToken = '';
let addressId = '';

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

async function testCreateCustomer() {
    console.log('=== Testing Customer Registration ===');
    const { data } = await apiCall('/auth/register', 'POST', testCustomer);
    
    if (data && data.success) {
        console.log('✅ Customer registered successfully');
    } else {
        console.log('❌ Customer registration failed');
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

// Profile Tests
async function testGetUserProfile() {
    console.log('=== Testing Get User Profile ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/profile', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User profile retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user profile');
    }
}

async function testUpdateUserProfile() {
    console.log('=== Testing Update User Profile ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const updateData = {
        name: 'John Smith',
        phone: '+1234567891',
        bio: 'Software developer and salon enthusiast'
    };

    const { data } = await apiCall('/profile', 'PUT', updateData, customerToken);
    
    if (data && data.success) {
        console.log('✅ User profile updated successfully');
    } else {
        console.log('❌ User profile update failed');
    }
}

async function testChangePassword() {
    console.log('=== Testing Change Password ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const passwordData = {
        currentPassword: testCustomer.password,
        newPassword: 'newpassword123'
    };

    const { data } = await apiCall('/profile/change-password', 'PUT', passwordData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Password changed successfully');
    } else {
        console.log('❌ Password change failed');
    }
}

async function testUpdateUserPreferences() {
    console.log('=== Testing Update User Preferences ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const preferencesData = {
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: 'Asia/Kolkata',
        theme: 'light'
    };

    const { data } = await apiCall('/profile/preferences', 'PUT', preferencesData, customerToken);
    
    if (data && data.success) {
        console.log('✅ User preferences updated successfully');
    } else {
        console.log('❌ User preferences update failed');
    }
}

async function testGetUserStats() {
    console.log('=== Testing Get User Stats ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/profile/stats', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User stats retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user stats');
    }
}

async function testUploadProfilePicture() {
    console.log('=== Testing Upload Profile Picture ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const pictureData = {
        profilePictureUrl: 'https://example.com/profile-picture.jpg'
    };

    const { data } = await apiCall('/profile/profile-picture', 'PUT', pictureData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Profile picture updated successfully');
    } else {
        console.log('❌ Profile picture update failed');
    }
}

async function testGetUserActivityLog() {
    console.log('=== Testing Get User Activity Log ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/profile/activity', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User activity log retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user activity log');
    }
}

async function testExportUserData() {
    console.log('=== Testing Export User Data ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/profile/export', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User data exported successfully');
    } else {
        console.log('❌ Failed to export user data');
    }
}

// Address Tests
async function testGetUserAddresses() {
    console.log('=== Testing Get User Addresses ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/addresses', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ User addresses retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve user addresses');
    }
}

async function testCreateAddress() {
    console.log('=== Testing Create Address ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/addresses', 'POST', testAddress, customerToken);
    
    if (data && data.success) {
        addressId = data.data._id;
        console.log('✅ Address created successfully');
        console.log(`Address ID: ${addressId}`);
    } else {
        console.log('❌ Address creation failed');
    }
}

async function testGetAddress() {
    console.log('=== Testing Get Single Address ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const { data } = await apiCall(`/addresses/${addressId}`, 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve address');
    }
}

async function testUpdateAddress() {
    console.log('=== Testing Update Address ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const updateData = {
        label: 'Home - Updated',
        street: '123 Main Street, Apartment 4B, Floor 2',
        landmark: 'Near Central Mall and Metro Station'
    };

    const { data } = await apiCall(`/addresses/${addressId}`, 'PUT', updateData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address updated successfully');
    } else {
        console.log('❌ Address update failed');
    }
}

async function testSetDefaultAddress() {
    console.log('=== Testing Set Default Address ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const { data } = await apiCall(`/addresses/${addressId}/set-default`, 'PATCH', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Default address set successfully');
    } else {
        console.log('❌ Failed to set default address');
    }
}

async function testGetDefaultAddress() {
    console.log('=== Testing Get Default Address ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/addresses/default/current', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Default address retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve default address');
    }
}

async function testSearchAddressesByLocation() {
    console.log('=== Testing Search Addresses by Location ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/addresses/search/location?city=Mumbai&state=Maharashtra', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address search successful');
    } else {
        console.log('❌ Address search failed');
    }
}

async function testValidateAddress() {
    console.log('=== Testing Validate Address ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const validationData = {
        street: '456 Test Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
    };

    const { data } = await apiCall('/addresses/validate', 'POST', validationData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address validation successful');
    } else {
        console.log('❌ Address validation failed');
    }
}

async function testGetAddressStats() {
    console.log('=== Testing Get Address Stats ===');
    
    if (!customerToken) {
        console.log('❌ No customer token available');
        return;
    }

    const { data } = await apiCall('/addresses/stats/overview', 'GET', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address stats retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve address stats');
    }
}

async function testDuplicateAddress() {
    console.log('=== Testing Duplicate Address ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const duplicateData = {
        newLabel: 'Work Address'
    };

    const { data } = await apiCall(`/addresses/${addressId}/duplicate`, 'POST', duplicateData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address duplicated successfully');
    } else {
        console.log('❌ Address duplication failed');
    }
}

async function testBulkUpdateAddresses() {
    console.log('=== Testing Bulk Update Addresses ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const bulkUpdateData = {
        updates: [
            {
                addressId: addressId,
                label: 'Home - Bulk Updated',
                addressType: 'home'
            }
        ]
    };

    const { data } = await apiCall('/addresses/bulk/update', 'PUT', bulkUpdateData, customerToken);
    
    if (data && data.success) {
        console.log('✅ Bulk address update successful');
    } else {
        console.log('❌ Bulk address update failed');
    }
}

async function testDeleteAddress() {
    console.log('=== Testing Delete Address ===');
    
    if (!addressId || !customerToken) {
        console.log('❌ No address ID or customer token available');
        return;
    }

    const { data } = await apiCall(`/addresses/${addressId}`, 'DELETE', null, customerToken);
    
    if (data && data.success) {
        console.log('✅ Address deleted successfully');
    } else {
        console.log('❌ Address deletion failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Profile & Address API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testCreateCustomer();
        await testCustomerLogin();
        
        if (!customerToken) {
            console.log('❌ Authentication failed - cannot proceed with tests');
            return;
        }
        
        // Profile tests
        console.log('\n--- PROFILE TESTS ---');
        await testGetUserProfile();
        await testUpdateUserProfile();
        await testChangePassword();
        await testUpdateUserPreferences();
        await testGetUserStats();
        await testUploadProfilePicture();
        await testGetUserActivityLog();
        await testExportUserData();
        
        // Address tests
        console.log('\n--- ADDRESS TESTS ---');
        await testGetUserAddresses();
        await testCreateAddress();
        await testGetAddress();
        await testUpdateAddress();
        await testSetDefaultAddress();
        await testGetDefaultAddress();
        await testSearchAddressesByLocation();
        await testValidateAddress();
        await testGetAddressStats();
        await testDuplicateAddress();
        await testBulkUpdateAddresses();
        await testDeleteAddress();
        
        console.log('\n✅ All profile and address tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();

