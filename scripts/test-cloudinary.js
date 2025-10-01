#!/usr/bin/env node

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Cloudinary Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('  CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ Set' : '❌ Missing');

// Configure Cloudinary - prefer individual variables over URL
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
    console.log('\n🔧 Using individual environment variables for configuration');
    console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('  API Key:', process.env.CLOUDINARY_API_KEY.substring(0, 8) + '...');
} else if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        secure: true
    });
    console.log('\n🔧 Using CLOUDINARY_URL for configuration');
    console.log('  URL:', process.env.CLOUDINARY_URL);
} else {
    console.log('\n❌ Cloudinary configuration failed: Missing required environment variables');
    process.exit(1);
}

// Test Cloudinary connection
console.log('\n🔍 Testing Cloudinary connection...');

try {
    // Test with a simple API call
    console.log('  Testing API ping...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('  Status:', result.status);
    
    // Test upload capabilities with a simple test
    console.log('\n📤 Testing upload capabilities...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImage, {
        folder: 'test-uploads',
        public_id: 'test-connection-' + Date.now(),
        resource_type: 'image',
        transformation: [
            { quality: 'auto' }
        ]
    });
    
    console.log('✅ Test upload successful!');
    console.log('  Public ID:', uploadResult.public_id);
    console.log('  URL:', uploadResult.secure_url);
    
    // Clean up test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🧹 Test image cleaned up');
    
    console.log('\n🎉 All tests passed! Cloudinary is properly configured.');
    
} catch (error) {
    console.error('❌ Cloudinary test failed:');
    console.error('  Error:', error.message);
    console.error('  HTTP Code:', error.http_code);
    console.error('  Status:', error.status);
    
    if (error.http_code === 401) {
        console.error('\n💡 Suggestion: Check your API credentials');
    } else if (error.http_code === 403) {
        console.error('\n💡 Suggestion: Check your account permissions');
    } else if (error.http_code === 404) {
        console.error('\n💡 Suggestion: Check your cloud name');
    }
    
    process.exit(1);
}
