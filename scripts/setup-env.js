#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envTemplate = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/salon-db

# Server Configuration
PORT=8000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
# Get these from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Alternative: Use CLOUDINARY_URL instead of individual variables
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Razorpay Configuration (if using payment)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# WhatsApp Configuration (if using WhatsApp integration)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
`;

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Setting up environment configuration...\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   If you want to recreate it, please delete the existing file first.');
    console.log('   Current .env file location:', envPath);
} else {
    try {
        fs.writeFileSync(envPath, envTemplate);
        console.log('✅ .env file created successfully!');
        console.log('   Location:', envPath);
        console.log('\n📝 Next steps:');
        console.log('   1. Open the .env file and update the Cloudinary credentials');
        console.log('   2. Get your Cloudinary credentials from: https://cloudinary.com/console');
        console.log('   3. Update other configuration values as needed');
        console.log('   4. Restart your server');
    } catch (error) {
        console.error('❌ Failed to create .env file:', error.message);
        process.exit(1);
    }
}

console.log('\n🔗 Useful links:');
console.log('   - Cloudinary Console: https://cloudinary.com/console');
console.log('   - Cloudinary Documentation: https://cloudinary.com/documentation');
console.log('   - Environment Variables Guide: https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs');
