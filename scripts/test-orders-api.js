import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testOrderData = {
  items: [
    {
      productId: '507f1f77bcf86cd799439011',
      productName: 'Test Product',
      productImage: 'https://example.com/image.jpg',
      quantity: 2,
      price: 100,
      totalPrice: 200
    }
  ],
  totalItems: 2,
  subtotal: 200,
  discount: 0,
  shippingCharges: 50,
  tax: 25,
  totalAmount: 275,
  status: 'pending',
  shippingAddress: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'India',
    phone: '1234567890'
  },
  paymentDetails: {
    method: 'razorpay',
    status: 'pending',
    amount: 275,
    currency: 'INR'
  }
};

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API Integration...\n');

  try {
    // Test 1: Login to get admin token
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Assuming admin exists
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const adminToken = loginResponse.data.data.accessToken;
      const adminHeaders = { Authorization: `Bearer ${adminToken}` };
      
      // Test 2: Get all orders (admin)
      console.log('\n2. Testing get all orders (admin)...');
      const allOrdersResponse = await axios.get(`${API_BASE_URL}/orders/admin/all`, {
        headers: adminHeaders
      });
      
      if (allOrdersResponse.data.success) {
        console.log('✅ Get all orders successful');
        console.log(`   Found ${allOrdersResponse.data.data.orders.length} orders`);
      } else {
        console.log('❌ Get all orders failed:', allOrdersResponse.data.message);
      }

      // Test 3: Get order stats (admin)
      console.log('\n3. Testing get order stats (admin)...');
      const statsResponse = await axios.get(`${API_BASE_URL}/orders/admin/stats`, {
        headers: adminHeaders
      });
      
      if (statsResponse.data.success) {
        console.log('✅ Get order stats successful');
        console.log('   Stats:', JSON.stringify(statsResponse.data.data, null, 2));
      } else {
        console.log('❌ Get order stats failed:', statsResponse.data.message);
      }

      // Test 4: Test order status update (if orders exist)
      if (allOrdersResponse.data.data.orders.length > 0) {
        const firstOrder = allOrdersResponse.data.data.orders[0];
        console.log('\n4. Testing order status update...');
        
        const updateResponse = await axios.patch(
          `${API_BASE_URL}/orders/admin/${firstOrder._id}/status`,
          {
            status: 'confirmed',
            trackingNumber: 'TRK123456789',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          { headers: adminHeaders }
        );
        
        if (updateResponse.data.success) {
          console.log('✅ Order status update successful');
        } else {
          console.log('❌ Order status update failed:', updateResponse.data.message);
        }
      }

    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }

    // Test 5: Test customer login and orders
    console.log('\n5. Testing customer login...');
    const customerLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (customerLoginResponse.data.success) {
      console.log('✅ Customer login successful');
      const customerToken = customerLoginResponse.data.data.accessToken;
      const customerHeaders = { Authorization: `Bearer ${customerToken}` };
      
      // Test 6: Get customer orders
      console.log('\n6. Testing get customer orders...');
      const customerOrdersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: customerHeaders
      });
      
      if (customerOrdersResponse.data.success) {
        console.log('✅ Get customer orders successful');
        console.log(`   Found ${customerOrdersResponse.data.data.orders.length} orders`);
      } else {
        console.log('❌ Get customer orders failed:', customerOrdersResponse.data.message);
      }

    } else {
      console.log('❌ Customer login failed:', customerLoginResponse.data.message);
    }

    console.log('\n🎉 Orders API integration test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

// Run the test
testOrdersAPI();
