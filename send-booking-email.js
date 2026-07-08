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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking, emailConfig } = req.body;

  if (!booking || !emailConfig) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured in Vercel environment variables' });
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
      throw new Error(err.substring(0, 200));
    }
    return resp.json();
  };

  const errors = [];
  const forceType = req.body.forceType;

  // Send confirmation to client
  const shouldSendClient = !forceType || forceType === 'client';
  if (shouldSendClient && emailConfig.clientEnabled !== false && booking.email) {
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

  // Send notification to admin
  const shouldSendAdmin = !forceType || forceType === 'admin';
  if (shouldSendAdmin && emailConfig.adminEnabled !== false && emailConfig.adminEmail) {
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

  res.status(200).json({ success: true, errors: errors.length ? errors : undefined });
};
