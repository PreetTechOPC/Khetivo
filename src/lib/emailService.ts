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
}

/**
 * Creates a configured nodemailer transport.
 * Reads custom SMTP credentials if provided in .env.local (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS),
 * or falls back to an Ethereal/mock transport with console logging so test orders always succeed.
 */
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
  } = payload;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM || "Khetivo Accounts <billing@khetivo.com>";

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
    // Development / Test mode: Create JSON transporter or Ethereal test account
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F8F4; margin: 0; padding: 24px; color: #26352D; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #DCE6DE; padding: 32px; box-shadow: 0 4px 12px rgba(12, 75, 50, 0.05); }
    .header { border-bottom: 2px solid #E7F3EB; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: bold; color: #0C4B32; text-decoration: none; }
    .badge { background: #E7F3EB; color: #0C4B32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #0C4B32; }
    .inv-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .inv-table th { background: #F8FAF8; color: #55685D; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #E5ECE7; }
    .inv-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #E5ECE7; }
    .total-row { background: #F4F8F4; font-weight: bold; color: #0C4B32; font-size: 15px; }
    .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #889B90; line-height: 1.5; }
    .btn { display: inline-block; background: #0C4B32; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 600; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">🌾 Khetivo</div>
      <span class="badge">Payment Verified ✓</span>
    </div>

    <div class="greeting">Subscription Confirmed!</div>
    <p style="font-size: 14px; color: #55685D; line-height: 1.5;">
      Hello <strong>${farmerName}</strong>, thank you for purchasing your Khetivo farm license. Your subscription is active, and all features including Sentinel-2 NDVI satellite monitoring, farm quotas, and telemetry analytics are now unlocked.
    </p>

    <div style="background: #FBFDFB; border: 1px solid #E5ECE7; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <div style="font-size: 12px; color: #55685D;">Tax Invoice Number: <strong style="color: #26352D;">${invoiceNo}</strong></div>
      <div style="font-size: 12px; color: #55685D; margin-top: 4px;">Payment Date: <strong style="color: #26352D;">${date}</strong></div>
      <div style="font-size: 12px; color: #55685D; margin-top: 4px;">Transaction Mode: <strong style="color: #26352D;">${paymentMethod}</strong></div>
      ${paymentId ? `<div style="font-size: 12px; color: #55685D; margin-top: 4px;">Razorpay Payment ID: <strong style="color: #26352D; font-family: monospace;">${paymentId}</strong></div>` : ""}
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>Plan Description</th>
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
          <td colspan="2">Total Paid (Inclusive of all GST)</td>
          <td style="text-align: right;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center; margin: 28px 0 12px;">
      <a href="https://khetivo.com/dashboard" class="btn">Open Your Farm Dashboard</a>
    </div>

    <div class="footer">
      <p>Khetivo Precision Agriculture Technologies Pvt. Ltd.<br>
      GSTIN: 03AAAFK1234Q1Z5 • Village Samrala, GT Road Belt, Ludhiana, Punjab 141001<br>
      If you have questions about your billing, reply to this email or visit your dashboard Support tab.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `[Receipt & Invoice ${invoiceNo}] Your Khetivo ${planName} Subscription is Active`,
      html: htmlContent,
    });
    console.log(`[Invoice Email Sent]: To ${toEmail}, MessageId: ${info.messageId || "json-dev"}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Invoice Email Send Error]:", err);
    return { success: false, error: err.message };
  }
}
