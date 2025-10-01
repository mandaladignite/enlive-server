#!/usr/bin/env node

/**
 * Script to create an initial admin user
 * Usage: node scripts/create-admin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

const createAdminUser = async () => {
    try {
        console.log('\n🔐 Admin User Creation Script');
        console.log('============================\n');

        // Get admin details from user
        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password: ');
        const phone = await question('Enter admin phone (optional): ');

        if (!name || !email || !password) {
            console.log('❌ Name, email, and password are required');
            process.exit(1);
        }

        // Connect to database
        await connectDB();

        // Import User model
        const { User } = await import('../src/models/user.model.js');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('❌ Admin user with this email already exists');
            process.exit(1);
        }

        // Create admin user
        const adminUser = new User({
            name,
            email,
            password,
            role: 'admin',
            phone: phone || undefined,
            isActive: true
        });

        await adminUser.save();

        console.log('\n✅ Admin user created successfully!');
        console.log('📧 Email:', email);
        console.log('👤 Name:', name);
        console.log('🔑 Role: admin');
        console.log('\n🚀 You can now login to the admin panel');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        mongoose.connection.close();
    }
};

// Run the script
createAdminUser();
