# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your salon management system.

## Quick Setup

1. **Run the setup script:**
   ```bash
   npm run setup-env
   ```

2. **Get your Cloudinary credentials:**
   - Go to [Cloudinary Console](https://cloudinary.com/console)
   - Sign up or log in to your account
   - Copy your Cloud Name, API Key, and API Secret

3. **Update your .env file:**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

4. **Restart your server:**
   ```bash
   npm run dev
   ```

## Alternative: Using CLOUDINARY_URL

Instead of individual variables, you can use a single URL:

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Troubleshooting

### Common Issues

1. **"Cloudinary configuration is missing"**
   - Make sure your .env file exists in the server directory
   - Check that all required environment variables are set
   - Restart your server after updating .env

2. **"Cloudinary authentication failed"**
   - Verify your API credentials are correct
   - Check that your Cloudinary account is active
   - Ensure you're using the correct cloud name

3. **"Invalid upload request"**
   - Check file format (JPEG, PNG, GIF, WebP are supported)
   - Verify file size is under 10MB
   - Ensure the file is not corrupted

### Debug Information

The server will log detailed information about Cloudinary configuration on startup. Look for:

```
=== CLOUDINARY CONFIG DEBUG ===
Cloud name: Set/Missing
API key: Set/Missing
API secret: Set/Missing
Cloudinary URL: Set/Missing
```

### Testing Upload

You can test the upload functionality using the gallery API:

```bash
# Test single image upload
curl -X POST http://localhost:8000/api/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@path/to/your/image.jpg" \
  -F "title=Test Image" \
  -F "category=Hair"

# Test multiple image upload
curl -X POST http://localhost:8000/api/gallery/upload/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@path/to/image1.jpg" \
  -F "images=@path/to/image2.jpg" \
  -F "title_0=Image 1" \
  -F "title_1=Image 2" \
  -F "category=Hair"
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes* |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Yes* |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Yes* |
| `CLOUDINARY_URL` | Complete Cloudinary URL | Yes* |

*Either individual variables OR CLOUDINARY_URL is required.

## Features

- ✅ Automatic image optimization
- ✅ Multiple format support (JPEG, PNG, GIF, WebP)
- ✅ File size validation (max 10MB)
- ✅ Secure uploads with authentication
- ✅ Error handling and detailed logging
- ✅ Support for single and multiple image uploads
- ✅ Automatic folder organization by category

## Support

If you encounter any issues:

1. Check the server logs for detailed error messages
2. Verify your Cloudinary account status
3. Ensure all environment variables are correctly set
4. Test with a simple image file first

For more information, visit the [Cloudinary Documentation](https://cloudinary.com/documentation).
