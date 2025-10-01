#!/usr/bin/env node

/**
 * Test script for admin dashboard API endpoints
 * Usage: node scripts/test-admin-dashboard.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const testAdminDashboard = async () => {
    console.log('🧪 Testing Admin Dashboard API');
    console.log('================================\n');

    let accessToken;

    try {
        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'testadmin@example.com',
                password: 'password123'
            });
            accessToken = loginResponse.data.data.accessToken;
            console.log('✅ Admin login successful');
        } catch (error) {
            console.log('❌ Admin login failed:', error.response?.data?.message);
            console.log('💡 Make sure to create an admin user first: npm run create-admin');
            return;
        }

        // Step 2: Test dashboard overview endpoint
        console.log('\n2. Testing dashboard overview...');
        try {
            const overviewResponse = await axios.get(`${BASE_URL}/admin/dashboard/overview`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Dashboard overview retrieved successfully');
            console.log('   Stats:', Object.keys(overviewResponse.data.data.stats));
            console.log('   Recent bookings:', overviewResponse.data.data.recentBookings.length);
            console.log('   Upcoming appointments:', overviewResponse.data.data.upcomingAppointments.length);
        } catch (error) {
            console.log('❌ Dashboard overview failed:', error.response?.data?.message);
        }

        // Step 3: Test individual stats endpoint
        console.log('\n3. Testing dashboard stats...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Dashboard stats retrieved successfully');
            console.log('   Total bookings:', statsResponse.data.data.totalBookings.value);
            console.log('   Active customers:', statsResponse.data.data.activeCustomers.value);
            console.log('   Products sold:', statsResponse.data.data.productsSold.value);
            console.log('   Revenue:', statsResponse.data.data.revenue.value);
        } catch (error) {
            console.log('❌ Dashboard stats failed:', error.response?.data?.message);
        }

        // Step 4: Test recent bookings endpoint
        console.log('\n4. Testing recent bookings...');
        try {
            const bookingsResponse = await axios.get(`${BASE_URL}/admin/dashboard/recent-bookings?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Recent bookings retrieved successfully');
            console.log('   Bookings count:', bookingsResponse.data.data.length);
        } catch (error) {
            console.log('❌ Recent bookings failed:', error.response?.data?.message);
        }

        // Step 5: Test upcoming appointments endpoint
        console.log('\n5. Testing upcoming appointments...');
        try {
            const appointmentsResponse = await axios.get(`${BASE_URL}/admin/dashboard/upcoming-appointments?limit=3`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Upcoming appointments retrieved successfully');
            console.log('   Appointments count:', appointmentsResponse.data.data.length);
        } catch (error) {
            console.log('❌ Upcoming appointments failed:', error.response?.data?.message);
        }

        // Step 6: Test revenue analytics endpoint
        console.log('\n6. Testing revenue analytics...');
        try {
            const revenueResponse = await axios.get(`${BASE_URL}/admin/dashboard/revenue-analytics?period=month`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Revenue analytics retrieved successfully');
            console.log('   Order revenue data points:', revenueResponse.data.data.orderRevenue.length);
            console.log('   Appointment revenue data points:', revenueResponse.data.data.appointmentRevenue.length);
        } catch (error) {
            console.log('❌ Revenue analytics failed:', error.response?.data?.message);
        }

        // Step 7: Test unauthorized access (should fail)
        console.log('\n7. Testing unauthorized access...');
        try {
            await axios.get(`${BASE_URL}/admin/dashboard/overview`);
            console.log('❌ FAILED: Unauthorized access should be blocked');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ PASSED: Unauthorized access correctly blocked');
            } else {
                console.log('❌ FAILED: Unexpected error:', error.response?.data?.message);
            }
        }

        console.log('\n🎉 Admin dashboard API test completed!');
        console.log('\n📝 Next Steps:');
        console.log('1. Start your frontend: cd client && npm run dev');
        console.log('2. Navigate to: http://localhost:3000/admin');
        console.log('3. You should see real dashboard data from the API');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

// Run the test
testAdminDashboard();
