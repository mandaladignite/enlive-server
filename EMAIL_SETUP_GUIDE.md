# Email Service Setup Guide

## Overview

The enquiry system includes an email service for sending notifications and responses. This guide will help you configure email functionality.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@enlive.com
ADMIN_EMAIL_PASSWORD=your-admin-email-password
```

## Gmail Setup (Recommended)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification
- Scroll down to "App passwords"
- Generate a new app password for "Mail"
- Use this password in `SMTP_PASS`

### 3. Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
ADMIN_EMAIL=your-gmail@gmail.com
ADMIN_EMAIL_PASSWORD=your-16-character-app-password
```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing Email Configuration

You can test your email configuration by running:

```javascript
// In your server console or a test script
import { testEmailConfig } from './src/utils/emailService.js';

testEmailConfig().then(result => {
  console.log(result);
});
```

## Email Templates

The system includes the following email templates:

1. **Enquiry Notification** - Sent to admin when new enquiry is received
2. **Enquiry Response** - Sent to customer when admin responds
3. **Appointment Confirmation** - Sent when appointment is booked
4. **Order Confirmation** - Sent when order is placed

## Features

- **HTML Email Templates** - Beautiful, responsive email designs
- **Automatic Fallback** - Falls back to text if HTML fails
- **Error Handling** - Graceful error handling with logging
- **Bulk Email Support** - Send multiple emails with rate limiting
- **Email Validation** - Built-in email address validation

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your email and password
   - For Gmail, ensure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled

2. **Connection Timeout**
   - Check your SMTP host and port
   - Verify firewall settings
   - Try different ports (465 for SSL, 587 for TLS)

3. **Emails Not Sending**
   - Check server logs for error messages
   - Verify environment variables are set correctly
   - Test with a simple email first

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=email:*
```

## Security Notes

- Never commit email passwords to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service (SendGrid, Mailgun) for production
- Regularly rotate your email passwords

## Production Recommendations

For production environments, consider using:

1. **SendGrid** - Reliable email delivery service
2. **Mailgun** - Developer-friendly email API
3. **Amazon SES** - Cost-effective email service
4. **Postmark** - Transactional email service

### SendGrid Integration Example

```javascript
// Alternative implementation using SendGrid
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, template, data }) => {
  const msg = {
    to: to,
    from: process.env.FROM_EMAIL,
    subject: subject,
    html: templates[template](data)
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
};
```

## Support

If you encounter issues with email configuration:

1. Check the server logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a simple email client first
4. Contact support with specific error messages

## Email Service Status

The email service will:
- Log when emails are sent successfully
- Log errors when emails fail
- Continue operation even if email service is unavailable
- Not crash the application if email sending fails
