/**
 * OTP Email Template
 * Professional HTML email with EmployAI branding
 */

export function getOTPEmailTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 24px;
    }
    .content h2 {
      margin: 0 0 16px 0;
      color: #111827;
      font-size: 20px;
      font-weight: 600;
    }
    .content p {
      margin: 0 0 24px 0;
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
    }
    .code-container {
      background-color: #f3f4f6;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .expiry-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .expiry-notice p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
    .footer {
      padding: 24px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
    }
    .security-tip {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>EmployAI</h1>
      </div>

      <div class="content">
        <h2>Your verification code</h2>
        <p>Hello! You requested to sign in to EmployAI. Use the code below to complete your authentication:</p>

        <div class="code-container">
          <div class="code">${code}</div>
        </div>

        <div class="expiry-notice">
          <p><strong>⏱️ Important:</strong> This code expires in 10 minutes.</p>
        </div>

        <p>Enter this code on the verification page to access your account.</p>
      </div>

      <div class="footer">
        <p>If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.</p>

        <div class="security-tip">
          <p><strong>Security Tip:</strong> Never share this code with anyone. EmployAI will never ask you for this code via email, phone, or any other method.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of the OTP email (fallback)
 */
export function getOTPEmailText(code: string): string {
  return `
EmployAI - Your Verification Code

Hello! You requested to sign in to EmployAI.

Your verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Security Tip: Never share this code with anyone.

---
EmployAI Document Management System
  `.trim();
}
