const PRIMARY_COLOR = '#FF385C';

export interface EmailTemplateOptions {
  title: string;
  content: string;
  logoUrl?: string;
}

export function generateEmailTemplate(options: EmailTemplateOptions): string {
  const logoUrl = options.logoUrl || '/public/brand-logo.jpeg';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: ${PRIMARY_COLOR}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="${logoUrl}" alt="Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              ${options.content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px; text-align: center; color: #666666; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Servease. All rights reserved.</p>
              <p style="margin: 0;">If you have any questions, please contact our support team.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateOTPEmail(otp: string, type: 'signup' | 'signin', expiryMinutes: number, userName?: string, logoUrl?: string): string {
  const title = type === 'signup' ? 'Verify your account' : 'Sign in to your account';
  const action = type === 'signup' ? 'verify your account' : 'sign in to your account';
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  const content = `
    <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">${title}</h1>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      ${greeting}
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Please use the following code to ${action}:
    </p>
    <div style="background-color: #f9f9f9; border: 2px dashed ${PRIMARY_COLOR}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
      <div style="color: ${PRIMARY_COLOR}; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${otp}
      </div>
    </div>
    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      This code will expire in <strong>${expiryMinutes} minutes</strong>.
    </p>
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      If you didn't request this code, please ignore this email.
    </p>
  `;
  
  return generateEmailTemplate({
    title,
    content,
    logoUrl,
  });
}

export function generateKYCNotificationEmail(
  status: 'approved' | 'rejected',
  notes?: string,
  logoUrl?: string,
): string {
  const title = status === 'approved' ? 'KYC Verification Approved' : 'KYC Verification Rejected';
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  const statusIcon = status === 'approved' ? '✓' : '✗';
  
  const content = `
    <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">${title}</h1>
    <div style="background-color: ${status === 'approved' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
        <span style="color: ${statusColor}; font-size: 20px; margin-right: 8px;">${statusIcon}</span>
        Your KYC verification has been <strong>${status}</strong>.
      </p>
    </div>
    ${notes ? `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="color: #666666; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Notes:</p>
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">${notes}</p>
      </div>
    ` : ''}
    ${status === 'rejected' ? `
      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
        Please submit a new KYC application with the necessary corrections.
      </p>
    ` : `
      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
        You can now access all features available to verified service providers.
      </p>
    `}
  `;
  
  return generateEmailTemplate({
    title,
    content,
    logoUrl,
  });
}
