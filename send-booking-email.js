module.exports = async (req, res) => {
  // CORS headers
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

  const sendEmail = async (to, subject, html) => {
    const from = (emailConfig.fromName || 'Ani Braids') + ' <' + (emailConfig.fromEmail || 'bookings@anibraids.com') + '>';
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: render(subject),
        html: render(html),
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(err.substring(0, 200));
    }
    return resp.json();
  };

  const errors = [];

  // Send confirmation to client
  if (emailConfig.clientEnabled !== false && emailConfig.clientTemplate && booking.email) {
    try {
      await sendEmail(
        booking.email,
        emailConfig.clientSubject || 'Booking Confirmation - {{businessName}}',
        emailConfig.clientTemplate
      );
    } catch (e) {
      errors.push('client:' + e.message);
    }
  }

  // Send notification to admin
  if (emailConfig.adminEnabled !== false && emailConfig.adminEmail && emailConfig.adminTemplate) {
    try {
      await sendEmail(
        emailConfig.adminEmail,
        emailConfig.adminSubject || 'New Booking: {{name}} - {{style}}',
        emailConfig.adminTemplate
      );
    } catch (e) {
      errors.push('admin:' + e.message);
    }
  }

  res.status(200).json({ success: true, errors: errors.length ? errors : undefined });
};
