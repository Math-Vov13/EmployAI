import { Resend } from 'resend';
import { getOTPEmailTemplate, getOTPEmailText } from './otp-template';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email to user
 */
export async function sendOTPEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return { success: false, error: 'Email service not configured' };
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL is not set');
      return { success: false, error: 'Email service not configured' };
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Your EmployAI Verification Code',
      html: getOTPEmailTemplate(code),
      text: getOTPEmailText(code),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    console.log('OTP email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send welcome email to new user (optional)
 */
export async function sendWelcomeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to EmployAI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to EmployAI!</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for joining EmployAI. You now have access to our document management and AI-powered summarization platform.</p>
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Upload and manage documents</li>
                <li>Chat with AI to summarize documents</li>
                <li>Download and share documents</li>
                <li>Organize documents with tags</li>
              </ul>
              <p>Get started by logging in to your account.</p>
              <p>Best regards,<br>The EmployAI Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to EmployAI!\n\nThank you for joining EmployAI. You now have access to our document management and AI-powered summarization platform.\n\nGet started by logging in to your account.\n\nBest regards,\nThe EmployAI Team`,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    console.log('Welcome email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
