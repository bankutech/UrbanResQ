const clients = new Map();
let timer = null;
const topics = new Set();

const send = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

function add(userId, res) {
  const set = clients.get(userId) || new Set();
  if (set.size >= 5) { const old = set.values().next().value; set.delete(old); old.end(); }
  set.add(res);
  clients.set(userId, set);
  res.on('close', () => { set.delete(res); if (!set.size) clients.delete(userId); });
}

function emit(event, data, userIds) {
  for (const [uid, set] of clients) {
    if (userIds && !userIds.includes(uid)) continue;
    for (const res of set) { try { send(res, event, data); } catch { /* client gone */ } }
  }
}

function refresh(topic) {
  topics.add(topic);
  if (timer) return;
  timer = setTimeout(() => { emit('refresh', { topics: [...topics] }); topics.clear(); timer = null; }, 300);
}

function closeAll() { for (const set of clients.values()) for (const res of set) { try { res.end(); } catch { /* already closed */ } } clients.clear(); }

module.exports = { add, emit, refresh, send, closeAll, connected: () => [...clients.values()].reduce((n, s) => n + s.size, 0) };
