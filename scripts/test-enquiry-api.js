import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000';

// Test data
const testEnquiry = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  subject: 'Test Enquiry',
  message: 'This is a test enquiry to verify the system is working correctly.',
  enquiryType: 'general',
  priority: 'medium',
  source: 'website',
  tags: ['test', 'api']
};

async function testEnquiryAPI() {
  console.log('🧪 Testing Enquiry API...\n');

  try {
    // Test 1: Create Enquiry (Public endpoint)
    console.log('1. Testing enquiry creation...');
    const createResponse = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEnquiry)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Enquiry created successfully');
      console.log(`   Enquiry Number: ${createData.data.enquiryNumber}`);
      console.log(`   ID: ${createData.data._id}\n`);
      
      const enquiryId = createData.data._id;

      // Test 2: Get All Enquiries (Admin endpoint - will fail without auth)
      console.log('2. Testing get all enquiries (should fail without auth)...');
      const getAllResponse = await fetch(`${API_BASE_URL}/enquiries`);
      
      if (getAllResponse.status === 401) {
        console.log('✅ Authentication required (expected)\n');
      } else {
        console.log('❌ Unexpected response:', getAllResponse.status);
      }

      // Test 3: Get Single Enquiry (will fail without auth)
      console.log('3. Testing get single enquiry (should fail without auth)...');
      const getSingleResponse = await fetch(`${API_BASE_URL}/enquiries/${enquiryId}`);
      
      if (getSingleResponse.status === 401) {
        console.log('✅ Authentication required (expected)\n');
      } else {
        console.log('❌ Unexpected response:', getSingleResponse.status);
      }

      // Test 4: Search Enquiries (will fail without auth)
      console.log('4. Testing search enquiries (should fail without auth)...');
      const searchResponse = await fetch(`${API_BASE_URL}/enquiries/search?q=test`);
      
      if (searchResponse.status === 401) {
        console.log('✅ Authentication required (expected)\n');
      } else {
        console.log('❌ Unexpected response:', searchResponse.status);
      }

      // Test 5: Get Stats (will fail without auth)
      console.log('5. Testing get stats (should fail without auth)...');
      const statsResponse = await fetch(`${API_BASE_URL}/enquiries/stats`);
      
      if (statsResponse.status === 401) {
        console.log('✅ Authentication required (expected)\n');
      } else {
        console.log('❌ Unexpected response:', statsResponse.status);
      }

    } else {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create enquiry:', errorData.message);
    }

  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }

  console.log('🏁 Enquiry API test completed!');
}

// Run the test
testEnquiryAPI();
