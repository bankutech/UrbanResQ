let token = sessionStorage.getItem('uq_token');

export const user = () => JSON.parse(sessionStorage.getItem('uq_user') || 'null');
export function setSession(t, u) {
  token = t;
  sessionStorage.setItem('uq_token', t);
  sessionStorage.setItem('uq_user', JSON.stringify(u));
}
export function clearSession() { token = null; sessionStorage.clear(); }
export const can = (...roles) => { const u = user(); return !!u && (u.role === 'admin' || roles.includes(u.role)); };

export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && !path.startsWith('/auth/login')) { clearSession(); location.reload(); }
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

export async function apiBlob(path) {
  const r = await fetch('/api' + path, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Download failed');
  return r.blob();
}

export async function apiUpload(path, form) {
  const r = await fetch('/api' + path, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j;
}

let streamAbort = null;
export function stopStream() { if (streamAbort) streamAbort.abort(); streamAbort = null; }
export function openStream(onEvent) {
  stopStream();
  const ac = new AbortController();
  streamAbort = ac;
  (async () => {
    let delay = 2000;
    while (!ac.signal.aborted) {
      try {
        const r = await fetch('/api/stream', { headers: { Authorization: 'Bearer ' + token }, signal: ac.signal });
        if (r.status === 401) return;
        const reader = r.body.getReader(), dec = new TextDecoder();
        let buf = '';
        delay = 2000;
        onEvent('open', {});
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
            let ev = 'message', data = '';
            for (const l of chunk.split('\n')) { if (l.startsWith('event: ')) ev = l.slice(7); else if (l.startsWith('data: ')) data += l.slice(6); }
            if (data) { try { onEvent(ev, JSON.parse(data)); } catch { /* ignore bad frame */ } }
          }
        }
      } catch { if (ac.signal.aborted) return; }
      onEvent('closed', {});
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, 30000);
    }
  })();
}
