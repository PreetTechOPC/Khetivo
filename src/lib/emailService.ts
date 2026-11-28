import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface InvoiceEmailPayload {
  toEmail: string;
  farmerName: string;
  invoiceNo: string;
  planName: string;
  period: string;
  amount: number;
  paymentMethod: string;
  date: string;
  paymentId?: string;
  acresLimit?: string;
  renewalDate?: string;
}

export interface WelcomeEmailPayload {
  toEmail: string;
  farmerName: string;
  farmerId?: string;
  phone?: string;
  dashboardUrl?: string;
}

export interface ForgotPasswordEmailPayload {
  toEmail: string;
  farmerName?: string;
  resetLink?: string;
  resetCode?: string;
  expiresInMinutes?: number;
}

/**
 * Creates a configured nodemailer transport.
 * Reads custom SMTP credentials if provided in .env.local (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS),
 * or falls back to an Ethereal/JSON test transport with console logging.
 */
function getEmailTransporter(): { transporter: Transporter; fromEmail: string } {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM || "Khetivo Support <support@khetivo.com>";

  let transporter: Transporter;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    // Development / Test mode: logs email payload cleanly
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return { transporter, fromEmail };
}

// =============================================================================
// 1. WELCOME EMAIL FOR NEW USER
// =============================================================================
export async function sendWelcomeEmail(payload: WelcomeEmailPayload) {
  const { toEmail, farmerName, farmerId, phone, dashboardUrl = "https://khetivo.com/dashboard" } = payload;
  const { transporter, fromEmail } = getEmailTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F8F4; margin: 0; padding: 24px; color: #26352D; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #DCE6DE; padding: 32px; box-shadow: 0 4px 14px rgba(12, 75, 50, 0.06); }
    .header { border-bottom: 2px solid #E7F3EB; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #0C4B32; text-decoration: none; letter-spacing: 0.5px; }
    .badge { background: #E7F3EB; color: #0C4B32; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .greeting { font-size: 22px; font-weight: 800; margin-bottom: 10px; color: #0C4B32; }
    .highlight-box { background: #F8FAF8; border: 1px solid #E5ECE7; border-radius: 14px; padding: 18px; margin: 22px 0; }
    .feature-list { margin: 20px 0; padding-left: 0; list-style: none; }
    .feature-item { margin-bottom: 12px; display: flex; align-items: flex-start; font-size: 13px; line-height: 1.5; color: #374151; }
    .check-icon { color: #059669; font-weight: bold; margin-right: 10px; font-size: 16px; }
    .btn { display: inline-block; background: #0C4B32; color: #ffffff !important; padding: 13px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin-top: 14px; }
    .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #E5ECE7; font-size: 11px; color: #889B90; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">🌾 KHETIVO</div>
      <span class="badge">Welcome to Precision Farming</span>
    </div>

    <div class="greeting">Welcome to Khetivo, ${farmerName}! 🚜</div>
    <p style="font-size: 14px; color: #55685D; line-height: 1.6;">
      Thank you for joining India’s leading smart agriculture platform. Your farm account has been successfully created and your holdings are ready to be geo-tagged.
    </p>

    <div class="highlight-box">
      <div style="font-size: 12px; color: #55685D; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Farm Account Details</div>
      <div style="font-size: 13px; color: #26352D; margin-bottom: 5px;">• <strong>Farmer Name:</strong> ${farmerName}</div>
      <div style="font-size: 13px; color: #26352D; margin-bottom: 5px;">• <strong>Registered Email:</strong> ${toEmail}</div>
      ${farmerId ? `<div style="font-size: 13px; color: #26352D; margin-bottom: 5px;">• <strong>Farmer ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #0C4B32;">${farmerId}</span></div>` : ""}
      ${phone ? `<div style="font-size: 13px; color: #26352D;">• <strong>Mobile Number:</strong> ${phone}</div>` : ""}
    </div>

    <div style="font-size: 14px; font-weight: 700; color: #0C4B32; margin-top: 18px;">What you can do right now:</div>
    <ul class="feature-list">
      <li class="feature-item"><span class="check-icon">✓</span> <span><strong>Map Your Holdings:</strong> Draw GPS field boundaries or import coordinates to detect soil profile.</span></li>
      <li class="feature-item"><span class="check-icon">✓</span> <span><strong>Track Crop Milestones:</strong> Day-by-day agronomic timeline with PAU university protocols.</span></li>
      <li class="feature-item"><span class="check-icon">✓</span> <span><strong>Hyper-Local Weather:</strong> 7-day agricultural forecast with optimal foliar spray window alerts.</span></li>
      <li class="feature-item"><span class="check-icon">✓</span> <span><strong>Kisan Stock Ledger:</strong> Manage seed, fertilizer, and pesticide stock with automatic expiry alerts.</span></li>
    </ul>

    <div style="text-align: center; margin: 26px 0 10px;">
      <a href="${dashboardUrl}" class="btn">Launch Farm Dashboard →</a>
    </div>

    <div class="footer">
      <p>Khetivo Precision Agriculture Technologies Pvt. Ltd.<br>
      Toll-Free Kisan Support: 1800-KHETIVO (1800-543-8486) • GT Road Belt, Ludhiana, Punjab<br>
      You received this email because you signed up for an account at khetivo.com.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `Welcome to Khetivo, ${farmerName}! 🌾 Your Smart Farm Account is Ready`,
      html: htmlContent,
    });
    console.log(`[Welcome Email Sent]: To ${toEmail}, MessageId: ${info.messageId || "json-dev"}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Welcome Email Send Error]:", err);
    return { success: false, error: err.message };
  }
}

// =============================================================================
// 2. SUBSCRIPTION & PLAN CONFIRMATION EMAIL (WITH TAX INVOICE)
// =============================================================================
export async function sendSubscriptionInvoiceEmail(payload: InvoiceEmailPayload) {
  const {
    toEmail,
    farmerName,
    invoiceNo,
    planName,
    period,
    amount,
    paymentMethod,
    date,
    paymentId,
    acresLimit = "Up to 5 Farms (100 Acres)",
    renewalDate,
  } = payload;

  const { transporter, fromEmail } = getEmailTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F8F4; margin: 0; padding: 24px; color: #26352D; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #DCE6DE; padding: 32px; box-shadow: 0 4px 14px rgba(12, 75, 50, 0.06); }
    .header { border-bottom: 2px solid #E7F3EB; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #0C4B32; text-decoration: none; }
    .badge { background: #E7F3EB; color: #0C4B32; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .greeting { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #0C4B32; }
    .inv-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .inv-table th { background: #F8FAF8; color: #55685D; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #E5ECE7; }
    .inv-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #E5ECE7; }
    .total-row { background: #F4F8F4; font-weight: bold; color: #0C4B32; font-size: 15px; }
    .btn { display: inline-block; background: #0C4B32; color: #ffffff !important; padding: 13px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin-top: 14px; }
    .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #E5ECE7; font-size: 11px; color: #889B90; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">🌾 KHETIVO</div>
      <span class="badge">Payment Verified ✓</span>
    </div>

    <div class="greeting">Subscription Confirmed: ${planName}</div>
    <p style="font-size: 14px; color: #55685D; line-height: 1.6;">
      Hello <strong>${farmerName}</strong>, thank you for choosing Khetivo. Your farm subscription has been activated, and all professional agronomic telemetry, Sentinel-2 NDVI satellite passes, and farm limits are now active.
    </p>

    <div style="background: #F8FAF8; border: 1px solid #E5ECE7; border-radius: 14px; padding: 18px; margin: 20px 0;">
      <div style="font-size: 12px; color: #55685D;">Tax Invoice Number: <strong style="color: #26352D;">${invoiceNo}</strong></div>
      <div style="font-size: 12px; color: #55685D; margin-top: 4px;">Payment Date: <strong style="color: #26352D;">${date}</strong></div>
      <div style="font-size: 12px; color: #55685D; margin-top: 4px;">Transaction Mode: <strong style="color: #26352D;">${paymentMethod}</strong></div>
      <div style="font-size: 12px; color: #55685D; margin-top: 4px;">Entitled Farm Limit: <strong style="color: #0C4B32;">${acresLimit}</strong></div>
      ${renewalDate ? `<div style="font-size: 12px; color: #55685D; margin-top: 4px;">Next Renewal Date: <strong style="color: #26352D;">${renewalDate}</strong></div>` : ""}
      ${paymentId ? `<div style="font-size: 12px; color: #55685D; margin-top: 4px;">Payment ID: <strong style="color: #26352D; font-family: monospace;">${paymentId}</strong></div>` : ""}
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>Plan Tier</th>
          <th>Coverage Duration</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${planName}</strong></td>
          <td>${period}</td>
          <td style="text-align: right; font-weight: 600;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">Total Paid (Inclusive of 18% GST)</td>
          <td style="text-align: right;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center; margin: 26px 0 10px;">
      <a href="https://khetivo.com/dashboard" class="btn">Access Pro Farm Dashboard →</a>
    </div>

    <div class="footer">
      <p>Khetivo Precision Agriculture Technologies Pvt. Ltd.<br>
      GSTIN: 03AAAFK1234Q1Z5 • Village Samrala, GT Road Belt, Ludhiana, Punjab 141001<br>
      For tax queries or invoices, contact billing@khetivo.com or call 1800-KHETIVO.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `[Receipt & Invoice ${invoiceNo}] Khetivo ${planName} Subscription Active`,
      html: htmlContent,
    });
    console.log(`[Invoice Email Sent]: To ${toEmail}, MessageId: ${info.messageId || "json-dev"}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Invoice Email Send Error]:", err);
    return { success: false, error: err.message };
  }
}

// =============================================================================
// 3. FORGOT PASSWORD & RECOVERY EMAIL
// =============================================================================
export async function sendForgotPasswordEmail(payload: ForgotPasswordEmailPayload) {
  const { toEmail, farmerName = "Farmer", resetLink, resetCode, expiresInMinutes = 60 } = payload;
  const { transporter, fromEmail } = getEmailTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F8F4; margin: 0; padding: 24px; color: #26352D; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #DCE6DE; padding: 32px; box-shadow: 0 4px 14px rgba(12, 75, 50, 0.06); }
    .header { border-bottom: 2px solid #E7F3EB; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #0C4B32; text-decoration: none; }
    .badge { background: #FEF3C7; color: #B45309; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .greeting { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #0C4B32; }
    .code-box { background: #F0FDF4; border: 1.5px dashed #059669; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .code-digits { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; color: #0C4B32; letter-spacing: 6px; }
    .btn { display: inline-block; background: #0C4B32; color: #ffffff !important; padding: 13px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin-top: 14px; }
    .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #E5ECE7; font-size: 11px; color: #889B90; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">🌾 KHETIVO</div>
      <span class="badge">Security Verification</span>
    </div>

    <div class="greeting">Reset Your Khetivo Password</div>
    <p style="font-size: 14px; color: #55685D; line-height: 1.6;">
      Hello <strong>${farmerName}</strong>, we received a request to reset the password for your Khetivo farm account (<strong>${toEmail}</strong>).
    </p>

    ${
      resetCode
        ? `
    <div class="code-box">
      <div style="font-size: 12px; color: #065F46; font-weight: 700; margin-bottom: 6px; text-transform: uppercase;">Your 6-Digit Password Reset Code</div>
      <div class="code-digits">${resetCode}</div>
      <div style="font-size: 11px; color: #047857; margin-top: 6px;">Valid for the next ${expiresInMinutes} minutes only</div>
    </div>
    `
        : ""
    }

    ${
      resetLink
        ? `
    <div style="text-align: center; margin: 26px 0 16px;">
      <a href="${resetLink}" class="btn">Reset My Password →</a>
    </div>
    <p style="font-size: 12px; color: #6B7280; text-align: center;">
      Or copy & paste this URL into your browser:<br>
      <a href="${resetLink}" style="color: #059669; word-break: break-all;">${resetLink}</a>
    </p>
    `
        : ""
    }

    <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin-top: 24px;">
      If you did not request this password reset, please ignore this email or contact support immediately. Your password remains safe and unchanged.
    </p>

    <div class="footer">
      <p>Khetivo Precision Agriculture Technologies Pvt. Ltd.<br>
      Security & Accounts Division • Ludhiana, Punjab 141001<br>
      Need help? Reach our duty helpdesk at security@khetivo.com</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `[Khetivo Security] Reset Your Farm Account Password`,
      html: htmlContent,
    });
    console.log(`[Forgot Password Email Sent]: To ${toEmail}, MessageId: ${info.messageId || "json-dev"}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Forgot Password Email Send Error]:", err);
    return { success: false, error: err.message };
  }
}
