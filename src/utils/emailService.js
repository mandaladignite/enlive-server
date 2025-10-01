import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.ADMIN_EMAIL,
      pass: process.env.SMTP_PASS || process.env.ADMIN_EMAIL_PASSWORD
    }
  });
};

// Email templates
const templates = {
  enquiryNotification: (data) => ({
    subject: `New Enquiry: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Enquiry Received
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Enquiry Details</h3>
          <p><strong>Enquiry Number:</strong> ${data.enquiryNumber}</p>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Type:</strong> ${data.enquiryType}</p>
          <p><strong>Priority:</strong> ${data.priority}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #495057; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 5px;">
          <p style="margin: 0; color: #0066cc;">
            <strong>Action Required:</strong> Please respond to this enquiry within 24 hours.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>This email was sent from the Enlive Salon Management System</p>
        </div>
      </div>
    `
  }),

  enquiryResponse: (data) => ({
    subject: `Re: ${data.originalSubject || 'Your Enquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          Response to Your Enquiry
        </h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>Thank you for contacting Enlive Salon. We have received your enquiry and here is our response:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Our Response</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${data.responseMessage}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Your Original Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6; color: #6c757d;">${data.originalMessage}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 5px;">
          <p style="margin: 0; color: #155724;">
            <strong>Need further assistance?</strong> Please don't hesitate to contact us again.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>Best regards,<br>The Enlive Salon Team</p>
          <p>This email was sent from the Enlive Salon Management System</p>
        </div>
      </div>
    `
  }),

  appointmentConfirmation: (data) => ({
    subject: `Appointment Confirmation - ${data.appointmentDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Appointment Confirmed
        </h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>Your appointment has been successfully confirmed. Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Appointment Details</h3>
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Stylist:</strong> ${data.stylistName}</p>
          <p><strong>Duration:</strong> ${data.duration} minutes</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
          <p style="margin: 0; color: #856404;">
            <strong>Reminder:</strong> Please arrive 10 minutes before your appointment time.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>Best regards,<br>The Enlive Salon Team</p>
        </div>
      </div>
    `
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          Order Confirmed
        </h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>Thank you for your order! Your payment has been processed successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Items Ordered</h3>
          ${data.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>${item.name} x ${item.quantity}</span>
              <span>$${item.price}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>Best regards,<br>The Enlive Salon Team</p>
        </div>
      </div>
    `
  })
};

// Main email sending function
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    // Check if email service is configured
    if (!process.env.SMTP_USER && !process.env.ADMIN_EMAIL) {
      console.log('Email service not configured. Skipping email send.');
      return { success: true, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    let emailContent = {};
    
    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else {
      emailContent = {
        subject: subject || 'Notification from Enlive Salon',
        html: html || text || 'No content provided'
      };
    }

    const mailOptions = {
      from: `"Enlive Salon" <${process.env.SMTP_USER || process.env.ADMIN_EMAIL}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text || emailContent.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
export const sendBulkEmails = async (emailList) => {
  const results = [];
  
  for (const emailData of emailList) {
    const result = await sendEmail(emailData);
    results.push({
      to: emailData.to,
      success: result.success,
      message: result.message
    });
    
    // Add delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get email statistics (placeholder for future implementation)
export const getEmailStats = async () => {
  // This would typically connect to an email service API
  // For now, return mock data
  return {
    totalSent: 0,
    totalDelivered: 0,
    totalBounced: 0,
    totalOpened: 0,
    totalClicked: 0
  };
};
