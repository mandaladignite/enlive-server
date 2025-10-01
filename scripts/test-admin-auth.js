#!/usr/bin/env node

/**
 * Test script for admin authentication flow
 * Usage: node scripts/test-admin-auth.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

const testAdminAuth = async () => {
    console.log('🧪 Testing Admin Authentication Flow');
    console.log('=====================================\n');

    try {
        // Test 1: Try to create admin through regular registration (should fail)
        console.log('1. Testing admin registration restriction...');
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test Admin',
                email: 'testadmin@example.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('❌ FAILED: Admin registration should be blocked');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ PASSED: Admin registration correctly blocked');
            } else {
                console.log('❌ FAILED: Unexpected error:', error.response?.data?.message);
            }
        }

        // Test 2: Create admin through developer endpoint
        console.log('\n2. Testing admin creation via developer endpoint...');
        try {
            const adminResponse = await axios.post(`${BASE_URL}/auth/create-admin`, {
                name: 'Test Admin',
                email: 'testadmin@example.com',
                password: 'password123',
                phone: '+1234567890'
            });
            console.log('✅ PASSED: Admin user created successfully');
            console.log('   Admin ID:', adminResponse.data.data._id);
            console.log('   Admin Role:', adminResponse.data.data.role);
        } catch (error) {
            console.log('❌ FAILED: Admin creation failed:', error.response?.data?.message);
            return;
        }

        // Test 3: Login as admin
        console.log('\n3. Testing admin login...');
        let accessToken;
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'testadmin@example.com',
                password: 'password123'
            });
            accessToken = loginResponse.data.data.accessToken;
            console.log('✅ PASSED: Admin login successful');
            console.log('   User Role:', loginResponse.data.data.user.role);
        } catch (error) {
            console.log('❌ FAILED: Admin login failed:', error.response?.data?.message);
            return;
        }

        // Test 4: Access admin-only endpoint
        console.log('\n4. Testing admin-only endpoint access...');
        try {
            const usersResponse = await axios.get(`${BASE_URL}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ PASSED: Admin-only endpoint accessible');
            console.log('   Users count:', usersResponse.data.data.docs?.length || 0);
        } catch (error) {
            console.log('❌ FAILED: Admin-only endpoint access failed:', error.response?.data?.message);
        }

        // Test 5: Test customer login (should not access admin endpoints)
        console.log('\n5. Testing customer access to admin endpoints...');
        try {
            // First create a customer
            await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test Customer',
                email: 'testcustomer@example.com',
                password: 'password123',
                role: 'customer'
            });

            // Login as customer
            const customerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'testcustomer@example.com',
                password: 'password123'
            });

            const customerToken = customerLoginResponse.data.data.accessToken;

            // Try to access admin endpoint
            try {
                await axios.get(`${BASE_URL}/auth/users`, {
                    headers: {
                        'Authorization': `Bearer ${customerToken}`
                    }
                });
                console.log('❌ FAILED: Customer should not access admin endpoints');
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log('✅ PASSED: Customer correctly blocked from admin endpoints');
                } else {
                    console.log('❌ FAILED: Unexpected error:', error.response?.data?.message);
                }
            }
        } catch (error) {
            console.log('❌ FAILED: Customer test failed:', error.response?.data?.message);
        }

        console.log('\n🎉 Admin authentication flow test completed!');
        console.log('\n📝 Next Steps:');
        console.log('1. Start your frontend: cd client && npm run dev');
        console.log('2. Navigate to: http://localhost:3000/auth/admin/login');
        console.log('3. Login with: testadmin@example.com / password123');
        console.log('4. You should be redirected to the admin dashboard');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

// Run the test
testAdminAuth();
