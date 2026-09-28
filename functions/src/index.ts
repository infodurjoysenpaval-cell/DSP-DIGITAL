import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

// Configure Email Transporter (Supports SMTP, SendGrid, Gmail, or Firebase Custom SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'dspdigitalmart@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

/**
 * Generate Responsive HTML Email for DSP Digital Mart Order & License Key Delivery
 */
export function generateOrderConfirmationEmailHtml(order: {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  totalAmount: number;
  paymentMethod?: string;
  transactionId?: string;
  licenseKey?: string;
  items: Array<{
    product: { name: string; slug?: string; salePrice?: number };
    quantity: number;
    selectedVariation?: { name: string; salePrice: number };
  }>;
  createdAt?: string;
}): string {
  const licenseKey =
    order.licenseKey ||
    `DSP-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const itemsRows = (order.items || [])
    .map((item) => {
      const price = item.selectedVariation
        ? item.selectedVariation.salePrice
        : item.product?.salePrice || 0;
      const variationBadge = item.selectedVariation
        ? `<div style="display:inline-block; font-size:11px; color:#2563EB; background:#EFF6FF; padding:2px 8px; border-radius:6px; margin-top:4px;">${item.selectedVariation.name}</div>`
        : '';

      return `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 12px 8px; vertical-align: top;">
            <div style="font-weight: 600; color: #0F172A; font-size: 14px;">${item.product?.name || 'Digital Product'}</div>
            ${variationBadge}
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #64748B; font-size: 13px; vertical-align: top;">
            x${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #0F172A; font-size: 14px; vertical-align: top;">
            ৳${(price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation & License Delivery - DSP Digital Mart</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 20px auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #0052FF 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px;">
                DSP DIGITAL MART
              </div>
              <div style="font-size: 13px; color: #93C5FD; font-weight: 500;">
                Your Smart Partner in the Digital World
              </div>
            </td>
          </tr>

          <!-- Success Greeting -->
          <tr>
            <td style="padding: 28px 24px 16px 24px;">
              <div style="display: inline-block; background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
                ✓ PAYMENT CONFIRMED & FULFILLED
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0;">
                Hello ${order.customerName || 'Customer'},
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                Thank you for your purchase! Your order <strong>#${order.orderId}</strong> has been successfully processed and your official digital license details are ready below.
              </p>
            </td>
          </tr>

          <!-- LICENSE KEY DELIVERY BOX (HIGHLIGHTED) -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <div style="background: linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px dashed #22C55E; border-radius: 16px; padding: 20px; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; color: #15803D; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                  OFFICIAL LICENSE KEY / ACCESS CODE
                </div>
                <div style="font-family: monospace, Courier, sans-serif; font-size: 18px; font-weight: 800; color: #0F172A; background: #FFFFFF; border: 1px solid #86EFAC; padding: 12px 16px; border-radius: 10px; display: inline-block; letter-spacing: 2px; word-break: break-all; margin: 4px 0 10px 0;">
                  ${licenseKey}
                </div>
                <div style="font-size: 12px; color: #166534; font-weight: 500;">
                  ⚡ Instant Genuine Activation | Guaranteed Support
                </div>
              </div>
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                  <tr>
                    <td style="color: #64748B; padding-bottom: 6px;">Order ID:</td>
                    <td style="text-align: right; font-weight: 700; color: #0F172A; padding-bottom: 6px;">#${order.orderId}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B; padding-bottom: 6px;">Payment Method:</td>
                    <td style="text-align: right; font-weight: 600; color: #0F172A; text-transform: capitalize; padding-bottom: 6px;">${order.paymentMethod || 'Online'}</td>
                  </tr>
                  ${
                    order.transactionId
                      ? `
                  <tr>
                    <td style="color: #64748B; padding-bottom: 6px;">Transaction ID:</td>
                    <td style="text-align: right; font-mono; font-weight: 600; color: #0F172A; padding-bottom: 6px;">${order.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="color: #64748B;">Date & Time:</td>
                    <td style="text-align: right; font-weight: 500; color: #64748B;">${new Date().toLocaleDateString('en-GB')}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Items Breakdown -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 10px 0; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;">
                Purchased Digital Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #CBD5E1; color: #64748B; font-size: 12px; text-transform: uppercase;">
                    <th align="left" style="padding-bottom: 6px;">Product</th>
                    <th align="center" style="padding-bottom: 6px;">Qty</th>
                    <th align="right" style="padding-bottom: 6px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding-top: 14px; font-weight: 700; font-size: 15px; color: #0F172A;">Total Paid:</td>
                    <td align="right" style="padding-top: 14px; font-weight: 800; font-size: 18px; color: #0052FF;">৳${order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Instructions & 24/7 Support -->
          <tr>
            <td style="padding: 0 24px 28px 24px;">
              <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 14px; padding: 16px; font-size: 13px; color: #1E40AF; line-height: 1.5;">
                <strong style="color: #1E3A8A; display: block; margin-bottom: 4px;">📌 How to Activate:</strong>
                Enter your license key into the respective application or portal. If you need any assistance, installation guide, or help with activation, message us on WhatsApp anytime:
                <div style="margin-top: 8px;">
                  <a href="https://wa.me/8801712792184" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 12px;">
                    💬 WhatsApp Support: +880 1712-792184
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
              <div>DSP DIGITAL MART • Khulna, Bangladesh</div>
              <div style="margin-top: 4px;">Email: <a href="mailto:dspdigitalmart@gmail.com" style="color: #0052FF; text-decoration: none;">dspdigitalmart@gmail.com</a> | Helpline: +880 9649-141111</div>
              <div style="margin-top: 8px; font-size: 11px; color: #94A3B8;">© ${new Date().getFullYear()} DSP DIGITAL MART. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;
}

/**
 * 1. Cloud Firestore Trigger: onOrderCreated
 * Automatically triggered when a new order document is added to /orders/{orderId}
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    if (!orderData || !orderData.email) {
      console.log('No recipient email found in order document.');
      return null;
    }

    const { orderId } = context.params;
    const emailHtml = generateOrderConfirmationEmailHtml({
      orderId: orderData.orderId || orderId,
      customerName: orderData.customerName || 'Customer',
      email: orderData.email,
      phone: orderData.phone || '',
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod,
      transactionId: orderData.transactionId,
      licenseKey: orderData.licenseKey,
      items: orderData.items || [],
      createdAt: orderData.createdAt,
    });

    try {
      // 1. Direct Email Dispatch via SMTP/Nodemailer
      await transporter.sendMail({
        from: '"DSP DIGITAL MART" <dspdigitalmart@gmail.com>',
        to: orderData.email,
        subject: `Order Confirmed #${orderData.orderId || orderId} - Digital License Delivery | DSP DIGITAL MART`,
        html: emailHtml,
        text: `Hello ${orderData.customerName}, your order #${orderData.orderId || orderId} for ৳${orderData.totalAmount} has been confirmed. Your License Key: ${orderData.licenseKey || 'DSP-KEY-GENUINE'}. Thank you for choosing DSP DIGITAL MART!`,
      });

      // 2. Also log to /mail queue for Firebase Trigger Email Extension if active
      await db.collection('mail').add({
        to: orderData.email,
        message: {
          subject: `Order Confirmed #${orderData.orderId || orderId} - License Key Delivery`,
          html: emailHtml,
        },
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        orderId: orderData.orderId || orderId,
      });

      // 3. Mark email as dispatched in order doc
      await snapshot.ref.update({
        emailSent: true,
        emailSentAt: new Date().toISOString(),
      });

      console.log(`Successfully dispatched order confirmation email for #${orderId} to ${orderData.email}`);
      return { success: true, orderId };
    } catch (error) {
      console.error('Error sending order confirmation email via Cloud Function:', error);
      return null;
    }
  });

/**
 * 2. Callable HTTPS Cloud Function: sendOrderConfirmationEmail
 * Can be invoked directly via Firebase client SDK `httpsCallable` or REST
 */
export const sendOrderConfirmationEmail = functions.https.onCall(async (data) => {
  const { order } = data;
  if (!order || !order.email || !order.orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing order details or destination email.');
  }

  const html = generateOrderConfirmationEmailHtml(order);

  try {
    await transporter.sendMail({
      from: '"DSP DIGITAL MART" <dspdigitalmart@gmail.com>',
      to: order.email,
      subject: `Order Confirmed #${order.orderId} - Digital License Delivery | DSP DIGITAL MART`,
      html,
    });

    return { success: true, message: 'Confirmation & license key email sent successfully!' };
  } catch (err: any) {
    console.error('Direct callable email dispatch error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to dispatch email.');
  }
});
