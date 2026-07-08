const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── CORS middleware ───
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ─── Default templates (used if none saved in Firestore) ───
const DEFAULT_CLIENT_TEMPLATE = `Hi {{name}},

Your appointment has been received! Here's a summary:

  Style:      {{style}}
  Date:       {{date}}
  Time:       {{time}}
  Stylist:    {{stylist}}
  Reference:  {{bookingRef}}

Your booking is pending payment verification. We'll notify you via WhatsApp once confirmed.

Questions? Contact us at {{email}}.

Best regards,
{{businessName}}`;

const DEFAULT_ADMIN_TEMPLATE = `New Booking from {{name}}!

  Client:     {{name}}
  Phone:      {{phone}}
  Email:      {{email}}
  Style:      {{style}}
  Date:       {{date}}
  Time:       {{time}}
  Stylist:    {{stylist}}
  Notes:      {{notes}}
  Reference:  {{bookingRef}}
  Payment:    {{paymentMethod}} - {{paymentHandle}}

Payment status: awaiting verification. Check the admin dashboard to update.

Visit the admin dashboard to manage this booking.

{{businessName}} - Admin Notification`;

// ─── POST /api/send-booking-email ───
app.post('/api/send-booking-email', async (req, res) => {
  const { booking, emailConfig } = req.body;

  if (!booking || !emailConfig) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured in environment variables');
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const vars = {
    '{{name}}': booking.name || '',
    '{{phone}}': booking.phone || '',
    '{{email}}': booking.email || '',
    '{{style}}': booking.style || booking.service || '',
    '{{date}}': booking.date || '',
    '{{time}}': booking.time || '',
    '{{stylist}}': booking.stylist === 'any' ? 'Any Available Stylist' : (booking.stylist || ''),
    '{{notes}}': booking.notes || '',
    '{{bookingRef}}': booking.bookingRef || '',
    '{{paymentMethod}}': booking.paymentMethod || '',
    '{{paymentHandle}}': booking.paymentHandle || '',
    '{{businessName}}': emailConfig.businessName || 'Ani Braids',
  };

  const render = (text) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars['{{' + key + '}}'] || '{{' + key + '}}');
  };

  const isHtml = (text) => /<[a-z][\s\S]*>/i.test(text);

  const sendEmail = async (to, subject, content) => {
    const from = (emailConfig.fromName || 'Ani Braids') + ' <' + (emailConfig.fromEmail || 'bookings@anibraids.com') + '>';
    const renderedSubject = render(subject);
    const renderedContent = render(content);
    const body = {
      from,
      to,
      subject: renderedSubject,
    };
    if (isHtml(renderedContent)) {
      body.html = renderedContent;
    } else {
      body.text = renderedContent;
      body.html = renderedContent.replace(/\n/g, '<br>\n');
    }
    console.log('Sending email to:', to, 'subject:', renderedSubject);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('Resend API error:', resp.status, err);
      throw new Error(err.substring(0, 200));
    }
    console.log('Email sent successfully to:', to);
    return resp.json();
  };

  const errors = [];
  const forceType = req.body.forceType;

  if (!forceType || forceType === 'client') {
    if (emailConfig.clientEnabled !== false && booking.email) {
      try {
        await sendEmail(
          booking.email,
          emailConfig.clientSubject || 'Booking Confirmation - {{businessName}}',
          emailConfig.clientTemplate || DEFAULT_CLIENT_TEMPLATE
        );
      } catch (e) {
        errors.push('client:' + e.message);
      }
    }
  }

  if (!forceType || forceType === 'admin') {
    if (emailConfig.adminEnabled !== false && emailConfig.adminEmail) {
      try {
        await sendEmail(
          emailConfig.adminEmail,
          emailConfig.adminSubject || 'New Booking: {{name}} - {{style}}',
          emailConfig.adminTemplate || DEFAULT_ADMIN_TEMPLATE
        );
      } catch (e) {
        errors.push('admin:' + e.message);
      }
    }
  }

  console.log('Email processing complete. Errors:', errors.length ? errors : 'none');
  res.status(200).json({ success: true, errors: errors.length ? errors : undefined });
});

// ─── Serve static files ───
app.use(express.static(path.join(__dirname)));

// ─── Start ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
