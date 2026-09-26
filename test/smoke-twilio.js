require('dotenv').config();
const base = process.env.API, mock = process.env.MOCK_URL, pw = process.env.SEED_PASSWORD;
const call = async (m, p, t, b) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
(async () => {
  const t = (await call('POST', '/api/auth/login', null, { email: 'coord@urbanresq.local', password: pw })).j.token;
  await call('PATCH', '/api/auth/profile', t, { phone: '+910000000099' });
  const st = (await call('GET', '/api/system/status', t)).j;
  await call('POST', '/api/broadcasts', t, { audience: 'coordinator', message: 'Twilio path check', external: true });
  let hit = null;
  for (let i = 0; i < 25 && !hit; i++) { await new Promise(r => setTimeout(r, 200)); hit = (await (await fetch(mock + '/_twilio')).json()).find(x => /Twilio path check/.test(x.Body || '')); }
  const ok = st.sms && hit && hit.To === '+910000000099' && hit.From === '+15550001111' && /^Basic /.test(hit.auth);
  console.log(ok ? 'PASS twilio adapter sends authenticated SMS' : 'FAIL twilio adapter', JSON.stringify({ st, hit }));
  process.exit(ok ? 0 : 1);
})();
