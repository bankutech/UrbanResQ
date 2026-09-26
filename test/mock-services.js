const http = require('http');
const { SMTPServer } = require('smtp-server');
const sms = [], twilio = [], mail = [];

new SMTPServer({
  authOptional: true, disabledCommands: ['STARTTLS'],
  onData(stream, session, cb) { let raw = ''; stream.on('data', d => { raw += d; }); stream.on('end', () => { mail.push({ to: session.envelope.rcptTo.map(r => r.address), raw }); cb(); }); }
}).listen(4125, '127.0.0.1');

http.createServer((req, res) => {
  const send = (o, c = 200) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  const body = cb => { let b = ''; req.on('data', d => { b += d; }); req.on('end', () => cb(b)); };
  if (req.url.startsWith('/v1/forecast')) return send({ current: { temperature_2m: 31, precipitation: 12, wind_speed_10m: 20 } });
  if (req.url.startsWith('/route/v1/driving/')) return send({ routes: [{ distance: 2500, duration: 420, geometry: { coordinates: [[72.88, 19.07], [72.89, 19.06], [72.9, 19.05]] } }] });
  if (req.url === '/_sms') return send(sms);
  if (req.url === '/_mail') return send(mail);
  if (req.url === '/_twilio') return send(twilio);
  if (req.url === '/sms' && req.method === 'POST') return body(b => { sms.push(JSON.parse(b)); send({ ok: true }); });
  if (/^\/2010-04-01\/Accounts\/[^/]+\/Messages\.json$/.test(req.url) && req.method === 'POST')
    return body(b => { twilio.push({ auth: req.headers.authorization, ...Object.fromEntries(new URLSearchParams(b)) }); send({ sid: 'SMtest' }, 201); });
  send({ error: 'not found' }, 404);
}).listen(4101, '127.0.0.1', () => console.log('mock services: http 4101, smtp 4125'));
