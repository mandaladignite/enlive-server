import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000';

// Test data
const testAdmin = {
    name: 'Gallery Admin',
    email: 'gallery@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+1234567890'
};

let adminToken = '';
let imageId = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null, isFormData = false) {
    const options = {
        method,
        headers: {}
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && !isFormData) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    } else if (body && isFormData) {
        options.body = body;
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

// Public Gallery Tests
async function testGetAllGalleryImages() {
    console.log('=== Testing Get All Gallery Images ===');
    const { data } = await apiCall('/gallery');
    
    if (data && data.success) {
        console.log('✅ Gallery images retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve gallery images');
    }
}

async function testGetImagesByCategory() {
    console.log('=== Testing Get Images by Category ===');
    const { data } = await apiCall('/gallery/category/Hair');
    
    if (data && data.success) {
        console.log('✅ Hair category images retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve category images');
    }
}

async function testGetFeaturedImages() {
    console.log('=== Testing Get Featured Images ===');
    const { data } = await apiCall('/gallery/featured/images');
    
    if (data && data.success) {
        console.log('✅ Featured images retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve featured images');
    }
}

async function testSearchGalleryImages() {
    console.log('=== Testing Search Gallery Images ===');
    const { data } = await apiCall('/gallery/search/images?q=hair');
    
    if (data && data.success) {
        console.log('✅ Gallery search successful');
    } else {
        console.log('❌ Gallery search failed');
    }
}

async function testGetGalleryStats() {
    console.log('=== Testing Get Gallery Stats ===');
    const { data } = await apiCall('/gallery/stats/overview');
    
    if (data && data.success) {
        console.log('✅ Gallery stats retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve gallery stats');
    }
}

// Admin Gallery Tests
async function testUploadImage() {
    console.log('=== Testing Upload Single Image ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    // Create a dummy image file for testing
    const dummyImagePath = path.join(process.cwd(), 'test-image.jpg');
    const dummyImageBuffer = Buffer.from('fake-image-data');
    fs.writeFileSync(dummyImagePath, dummyImageBuffer);

    const formData = new FormData();
    formData.append('image', fs.createReadStream(dummyImagePath));
    formData.append('title', 'Test Hair Styling');
    formData.append('description', 'Beautiful hair styling example');
    formData.append('category', 'Hair');
    formData.append('subcategory', 'Styling');
    formData.append('tags', 'hair,styling,beauty');
    formData.append('altText', 'Test hair styling image');
    formData.append('isFeatured', 'true');

    const { data } = await apiCall('/gallery/upload/single', 'POST', formData, adminToken, true);
    
    if (data && data.success) {
        imageId = data.data._id;
        console.log('✅ Image uploaded successfully');
        console.log(`Image ID: ${imageId}`);
    } else {
        console.log('❌ Image upload failed');
    }

    // Clean up dummy file
    if (fs.existsSync(dummyImagePath)) {
        fs.unlinkSync(dummyImagePath);
    }
}

async function testGetSingleImage() {
    console.log('=== Testing Get Single Image ===');
    
    if (!imageId) {
        console.log('❌ No image ID available');
        return;
    }

    const { data } = await apiCall(`/gallery/${imageId}`);
    
    if (data && data.success) {
        console.log('✅ Single image retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve single image');
    }
}

async function testUpdateImage() {
    console.log('=== Testing Update Image ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const updateData = {
        title: 'Updated Hair Styling',
        description: 'Updated description for hair styling',
        tags: ['hair', 'styling', 'updated', 'beauty'],
        isFeatured: false
    };

    const { data } = await apiCall(`/gallery/${imageId}`, 'PUT', updateData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Image updated successfully');
    } else {
        console.log('❌ Image update failed');
    }
}

async function testToggleFeatured() {
    console.log('=== Testing Toggle Featured ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/gallery/${imageId}/toggle-featured`, 'PATCH', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Featured status toggled successfully');
    } else {
        console.log('❌ Featured toggle failed');
    }
}

async function testUpdateSortOrder() {
    console.log('=== Testing Update Sort Order ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const sortData = {
        sortOrder: 5
    };

    const { data } = await apiCall(`/gallery/${imageId}/sort-order`, 'PATCH', sortData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Sort order updated successfully');
    } else {
        console.log('❌ Sort order update failed');
    }
}

async function testBulkUpdateImages() {
    console.log('=== Testing Bulk Update Images ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const bulkData = {
        imageIds: [imageId],
        updateData: {
            isFeatured: true,
            sortOrder: 1
        }
    };

    const { data } = await apiCall('/gallery/bulk/update', 'PUT', bulkData, adminToken);
    
    if (data && data.success) {
        console.log('✅ Bulk update successful');
    } else {
        console.log('❌ Bulk update failed');
    }
}

async function testGetAllImagesAdmin() {
    console.log('=== Testing Get All Images Admin ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/gallery/admin/all', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ All images retrieved successfully (admin)');
    } else {
        console.log('❌ Failed to retrieve all images (admin)');
    }
}

async function testGetImageAnalytics() {
    console.log('=== Testing Get Image Analytics ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/gallery/admin/${imageId}/analytics`, 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Image analytics retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve image analytics');
    }
}

async function testGetGalleryDashboardStats() {
    console.log('=== Testing Get Gallery Dashboard Stats ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const { data } = await apiCall('/gallery/admin/dashboard/stats', 'GET', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Gallery dashboard stats retrieved successfully');
    } else {
        console.log('❌ Failed to retrieve gallery dashboard stats');
    }
}

async function testDeleteImage() {
    console.log('=== Testing Delete Image ===');
    
    if (!imageId || !adminToken) {
        console.log('❌ No image ID or admin token available');
        return;
    }

    const { data } = await apiCall(`/gallery/${imageId}`, 'DELETE', null, adminToken);
    
    if (data && data.success) {
        console.log('✅ Image deleted successfully');
    } else {
        console.log('❌ Image deletion failed');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Gallery API Tests\n');
    
    try {
        // Basic health check
        await testHealthCheck();
        
        // Authentication
        await testCreateAdmin();
        await testAdminLogin();
        
        if (!adminToken) {
            console.log('❌ Authentication failed - cannot proceed with admin tests');
            return;
        }
        
        // Public gallery tests
        console.log('\n--- PUBLIC GALLERY TESTS ---');
        await testGetAllGalleryImages();
        await testGetImagesByCategory();
        await testGetFeaturedImages();
        await testSearchGalleryImages();
        await testGetGalleryStats();
        
        // Admin gallery tests
        console.log('\n--- ADMIN GALLERY TESTS ---');
        await testUploadImage();
        await testGetSingleImage();
        await testUpdateImage();
        await testToggleFeatured();
        await testUpdateSortOrder();
        await testBulkUpdateImages();
        await testGetAllImagesAdmin();
        await testGetImageAnalytics();
        await testGetGalleryDashboardStats();
        await testDeleteImage();
        
        console.log('\n✅ All gallery tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runTests();

