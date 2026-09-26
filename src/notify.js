const nodemailer = require('nodemailer');
const db = require('./db');
const { audit } = require('./util');
const stream = require('./stream');

const smtp = process.env.SMTP_URL;
const transport = smtp ? nodemailer.createTransport(smtp === 'json' ? { jsonTransport: true } : smtp) : null;
const smsUrl = process.env.SMS_WEBHOOK_URL;
const twilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM;
const status = () => ({ email: !!transport, email_dry_run: smtp === 'json', sms: !!smsUrl || !!twilio, routing: !!process.env.ROUTING_URL, weather: true });

async function sendExternal(rec, title, body) {
  for (const r of rec) {
    try {
      if (transport && r.email) {
        await transport.sendMail({ from: process.env.MAIL_FROM || 'urbanresq@localhost', to: r.email, subject: '[UrbanResQ] ' + title, text: body });
        if (smtp === 'json') await audit(db, null, 'email_dry_run', 'notification', null, { to: r.email, subject: title });
      }
      if (smsUrl && r.phone) {
        const res = await fetch(smsUrl, {
          method: 'POST', signal: AbortSignal.timeout(8000),
          headers: { 'Content-Type': 'application/json', ...(process.env.SMS_WEBHOOK_TOKEN && { Authorization: 'Bearer ' + process.env.SMS_WEBHOOK_TOKEN }) },
          body: JSON.stringify({ to: r.phone, text: `${title}: ${body}`.slice(0, 300) })
        });
        if (!res.ok) throw new Error('SMS provider returned ' + res.status);
      }
      if (twilio && r.phone) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const res = await fetch(`${process.env.TWILIO_BASE || 'https://api.twilio.com'}/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST', signal: AbortSignal.timeout(8000),
          headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ To: r.phone, From: process.env.TWILIO_FROM, Body: `${title}: ${body}`.slice(0, 300) })
        });
        if (!res.ok) throw new Error('Twilio returned ' + res.status);
      }
    } catch (e) { console.error('external alert failed:', e.message); }
  }
}

async function notify({ roles, userIds, kind, title, body = '', incidentId = null, external = false, dedupe = false }) {
  try {
    const [rec] = userIds && userIds.length
      ? await db.query('SELECT user_id, email, phone FROM users WHERE is_active AND user_id IN (?)', [userIds])
      : await db.query('SELECT u.user_id, u.email, u.phone FROM users u JOIN roles r USING (role_id) WHERE u.is_active AND r.name IN (?)', [roles]);
    let targets = rec;
    if (dedupe && targets.length) {
      const [have] = await db.query('SELECT user_id FROM notifications WHERE kind = ? AND title = ? AND read_at IS NULL AND user_id IN (?)', [kind, title, targets.map(t => t.user_id)]);
      const skip = new Set(have.map(h => h.user_id));
      targets = targets.filter(t => !skip.has(t.user_id));
    }
    if (!targets.length) return 0;
    await db.query('INSERT INTO notifications (user_id, kind, title, body, incident_id) VALUES ?',
      [targets.map(t => [t.user_id, kind, title.slice(0, 160), String(body).slice(0, 1000), incidentId])]);
    stream.emit('notification', { kind, title, body: String(body).slice(0, 300), incident_id: incidentId }, targets.map(t => t.user_id));
    if (external) sendExternal(targets, title, body);
    return targets.length;
  } catch (e) { console.error('notify failed:', e.message); return 0; }
}

async function notifyLowStock() {
  const [low] = await db.query('SELECT warehouse, resource, qty, min_qty FROM v_low_stock LIMIT 5');
  if (!low.length) return;
  await notify({ roles: ['admin', 'coordinator'], kind: 'low_stock', title: 'Low stock alert', dedupe: true,
    body: low.map(l => `${l.resource} at ${l.warehouse}: ${l.qty} (min ${l.min_qty})`).join('; ') });
}

module.exports = { notify, notifyLowStock, status };
