import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'password123'
};

const testAdmin = {
    email: 'admin@example.com',
    password: 'admin123'
};

let userToken = '';
let adminToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = null) => {
    const config = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
        throw error;
    }
};

// Test functions
const testUserLogin = async () => {
    console.log('\n🔐 Testing user login...');
    try {
        const response = await makeRequest('POST', '/auth/login', testUser);
        userToken = response.data.accessToken;
        console.log('✅ User login successful');
        return true;
    } catch (error) {
        console.log('❌ User login failed:', error.response?.data?.message);
        return false;
    }
};

const testAdminLogin = async () => {
    console.log('\n🔐 Testing admin login...');
    try {
        const response = await makeRequest('POST', '/auth/login', testAdmin);
        adminToken = response.data.accessToken;
        console.log('✅ Admin login successful');
        return true;
    } catch (error) {
        console.log('❌ Admin login failed:', error.response?.data?.message);
        return false;
    }
};

const testSubmitReview = async () => {
    console.log('\n📝 Testing review submission...');
    const reviewData = {
        targetType: 'product',
        targetId: '507f1f77bcf86cd799439011', // Replace with actual product ID
        rating: 5,
        comment: 'This is an excellent product! Highly recommended.'
    };

    try {
        const response = await makeRequest('POST', '/reviews/submit', reviewData, userToken);
        console.log('✅ Review submitted successfully');
        console.log('Review ID:', response.data._id);
        return response.data._id;
    } catch (error) {
        console.log('❌ Review submission failed:', error.response?.data?.message);
        return null;
    }
};

const testGetTargetReviews = async () => {
    console.log('\n📋 Testing get target reviews...');
    try {
        const response = await makeRequest('GET', '/reviews/target/product/507f1f77bcf86cd799439011');
        console.log('✅ Target reviews fetched successfully');
        console.log('Total reviews:', response.data.totalDocs);
        console.log('Average rating:', response.data.averageRating);
        return response.data;
    } catch (error) {
        console.log('❌ Get target reviews failed:', error.response?.data?.message);
        return null;
    }
};

const testGetUserReviews = async () => {
    console.log('\n👤 Testing get user reviews...');
    try {
        const response = await makeRequest('GET', '/reviews/my-reviews', null, userToken);
        console.log('✅ User reviews fetched successfully');
        console.log('User reviews count:', response.data.totalDocs);
        return response.data;
    } catch (error) {
        console.log('❌ Get user reviews failed:', error.response?.data?.message);
        return null;
    }
};

const testGetAllReviews = async () => {
    console.log('\n📊 Testing get all reviews (admin)...');
    try {
        const response = await makeRequest('GET', '/reviews/admin/all', null, adminToken);
        console.log('✅ All reviews fetched successfully');
        console.log('Total reviews:', response.data.totalDocs);
        return response.data;
    } catch (error) {
        console.log('❌ Get all reviews failed:', error.response?.data?.message);
        return null;
    }
};

const testApproveReview = async (reviewId) => {
    console.log('\n✅ Testing review approval...');
    try {
        const response = await makeRequest('PATCH', `/reviews/admin/${reviewId}/approve`, null, adminToken);
        console.log('✅ Review approved successfully');
        return response.data;
    } catch (error) {
        console.log('❌ Review approval failed:', error.response?.data?.message);
        return null;
    }
};

const testGetReviewStats = async () => {
    console.log('\n📈 Testing review statistics...');
    try {
        const response = await makeRequest('GET', '/reviews/admin/stats', null, adminToken);
        console.log('✅ Review statistics fetched successfully');
        console.log('Stats:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.log('❌ Get review stats failed:', error.response?.data?.message);
        return null;
    }
};

const testUpdateReview = async (reviewId) => {
    console.log('\n✏️ Testing review update...');
    const updateData = {
        rating: 4,
        comment: 'Updated review: Still good but not perfect.'
    };

    try {
        const response = await makeRequest('PUT', `/reviews/${reviewId}`, updateData, userToken);
        console.log('✅ Review updated successfully');
        return response.data;
    } catch (error) {
        console.log('❌ Review update failed:', error.response?.data?.message);
        return null;
    }
};

const testDeleteReview = async (reviewId) => {
    console.log('\n🗑️ Testing review deletion (admin)...');
    try {
        const response = await makeRequest('DELETE', `/reviews/admin/${reviewId}`, null, adminToken);
        console.log('✅ Review deleted successfully');
        return response.data;
    } catch (error) {
        console.log('❌ Review deletion failed:', error.response?.data?.message);
        return null;
    }
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting Review API Tests...\n');
    
    try {
        // Test authentication
        const userLoginSuccess = await testUserLogin();
        const adminLoginSuccess = await testAdminLogin();
        
        if (!userLoginSuccess || !adminLoginSuccess) {
            console.log('\n❌ Authentication failed. Please ensure users exist in the database.');
            return;
        }

        // Test review submission
        const reviewId = await testSubmitReview();
        if (!reviewId) {
            console.log('\n❌ Review submission failed. Cannot continue with other tests.');
            return;
        }

        // Test getting reviews
        await testGetTargetReviews();
        await testGetUserReviews();
        await testGetAllReviews();

        // Test review update
        await testUpdateReview(reviewId);

        // Test review approval
        await testApproveReview(reviewId);

        // Test review statistics
        await testGetReviewStats();

        // Test review deletion
        await testDeleteReview(reviewId);

        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
    }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { runTests };
