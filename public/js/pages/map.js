import { api, can } from '../api.js';
import { esc, num, $, opts, toast, dialog } from '../ui.js';

const COL = { low: '#8b8a85', moderate: '#E3B341', high: '#FF5A1F', critical: '#FF4D4D' };
const RAD = { low: 300, moderate: 600, high: 1000, critical: 1600 };
const KINDS = ['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'industrial'];

const km = (a, b) => {
  const r = x => x * Math.PI / 180, R = 6371;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const nearest = (p, list, n = 3) => list.map(x => ({ ...x, d: km(p, x) })).sort((a, b) => a.d - b.d).slice(0, n);

export async function render(root) {
  const L = window.L;
  if (!L) { root.innerHTML = '<p class="err">The map library did not load. Check your connection.</p>'; return; }
  const [d, cfg] = await Promise.all([api('/map'), api('/config')]);
  const canMark = can('coordinator', 'field_team');
  root.innerHTML = `<div class="bar"><div class="checks">
      <label><input type="checkbox" data-layer="incidents" checked>Incidents</label><label><input type="checkbox" data-layer="impact" checked>Impact zones</label><label><input type="checkbox" data-layer="depots" checked>Depots</label>
      <label><input type="checkbox" data-layer="hospitals" checked>Hospitals</label><label><input type="checkbox" data-layer="shelters" checked>Shelters</label><label><input type="checkbox" data-layer="blocks" checked>Blocked roads</label><label><input type="checkbox" data-layer="teams" checked>Rescue teams</label></div>
      <select id="kind"><option value="">All disaster types</option>${opts(KINDS)}</select>${canMark ? '<button class="btn ghost" id="mark">Mark blocked road</button>' : ''}</div>
    <div id="map"></div>
    <div class="legend"><span><i style="background:#FF4D4D"></i>critical</span><span><i style="background:#FF5A1F"></i>high</span><span><i style="background:#E3B341"></i>moderate</span><span><i style="background:#8b8a85"></i>low</span>
      <span><i style="background:#C6FF3D"></i>depot</span><span><i style="background:#4DA3FF"></i>hospital</span><span><i style="background:#6BD68A"></i>shelter</span><span><i style="background:#000;border:2px solid #FF4D4D"></i>blocked road</span><span><i style="background:#B38CFF"></i>rescue team (live)</span></div>
    <p class="mut" style="margin-top:8px">Shaded circles are estimated impact zones by severity, not surveyed boundaries. Tiles by OpenStreetMap. Routing needs a routing service configured on the server.</p>`;

  const map = L.map($('#map', root), { zoomControl: true });
  L.tileLayer(cfg.tileUrl, { maxZoom: 19, attribution: cfg.attribution }).addTo(map);
  const layers = Object.fromEntries(['incidents', 'impact', 'depots', 'hospitals', 'shelters', 'blocks', 'teams'].map(k => [k, L.layerGroup()]));
  const dot = (p, color, r) => L.circleMarker([p.lat, p.lng], { radius: r, color, fillColor: color, fillOpacity: .55, weight: 2 });
  let routeLine = null, marking = false;

  const drawIncidents = kind => {
    layers.incidents.clearLayers(); layers.impact.clearLayers();
    d.incidents.filter(i => !kind || i.kind === kind).forEach(i => {
      const list = (arr) => nearest(i, arr).map(x => `${esc(x.name)} (${x.d.toFixed(1)} km)`).join('<br>') || '–';
      const ns = nearest(i, d.shelters, 1)[0];
      dot(i, COL[i.severity], Math.min(22, 7 + Math.sqrt(i.affected_pop) / 12)).bindPopup(
        `<b>${esc(i.code)}</b> · ${esc(i.kind)} · ${esc(i.severity)}<br>${esc(i.area)} · ${num(i.affected_pop)} affected<br><br><b>Nearest shelters</b><br>${list(d.shelters)}<br><br><b>Nearest hospitals</b><br>${list(d.hospitals)}
         ${ns ? `<br><br><button data-route="${i.lat},${i.lng}|${ns.lat},${ns.lng}">Route to nearest shelter</button>` : ''}`).addTo(layers.incidents);
      L.circle([i.lat, i.lng], { radius: RAD[i.severity], color: COL[i.severity], weight: 1, fillColor: COL[i.severity], fillOpacity: .08, interactive: false }).addTo(layers.impact);
    });
  };
  const drawBlocks = async () => {
    layers.blocks.clearLayers();
    (await api('/road-blocks')).forEach(b => L.circleMarker([b.lat, b.lng], { radius: 9, color: '#FF4D4D', fillColor: '#000', fillOpacity: .85, weight: 3 })
      .bindPopup(`<b>Blocked</b><br>${esc(b.description)}${canMark ? `<br><br><button data-clear="${b.block_id}">Mark cleared</button>` : ''}`).addTo(layers.blocks));
  };
  const teamMarkers = {};
  const ago = m => (m == null || m < 1 ? 'just now' : m + ' min ago');
  const putTeam = t => {
    const html = `<b>${esc(t.name)}</b><br>location ${ago(t.age_min)}`;
    if (teamMarkers[t.team_id]) { teamMarkers[t.team_id].setLatLng([t.lat, t.lng]).setPopupContent(html); return; }
    teamMarkers[t.team_id] = L.circleMarker([t.lat, t.lng], { radius: 9, color: '#B38CFF', fillColor: '#B38CFF', fillOpacity: .8, weight: 3 }).bindPopup(html).addTo(layers.teams);
  };
  const drawTeams = list => { layers.teams.clearLayers(); Object.keys(teamMarkers).forEach(k => delete teamMarkers[k]); list.forEach(putTeam); };
  drawTeams(d.teams || []);
  const onPos = e => { if (!root.isConnected) return window.removeEventListener('uq:team_position', onPos); putTeam({ ...e.detail, age_min: 0 }); };
  window.addEventListener('uq:team_position', onPos);
  root.refresh = async () => { Object.assign(d, await api('/map')); drawIncidents($('#kind', root).value); drawTeams(d.teams || []); await drawBlocks(); };
  drawIncidents('');
  await drawBlocks();
  d.warehouses.forEach(w => dot(w, '#C6FF3D', 7).bindPopup(`<b>${esc(w.name)}</b><br>Supply depot`).addTo(layers.depots));
  d.hospitals.forEach(h => dot(h, '#4DA3FF', 8).bindPopup(`<b>${esc(h.name)}</b><br>${h.beds_available} beds free · ER ${esc(h.er_status)}`).addTo(layers.hospitals));
  d.shelters.forEach(s => dot(s, '#6BD68A', 8).bindPopup(`<b>${esc(s.name)}</b><br>${s.occupancy} / ${s.capacity} occupied`).addTo(layers.shelters));
  Object.values(layers).forEach(l => l.addTo(map));

  const pts = [...d.incidents, ...d.warehouses, ...d.hospitals, ...d.shelters].map(p => [p.lat, p.lng]);
  if (pts.length) map.fitBounds(pts, { padding: [40, 40] }); else map.setView([19.05, 72.88], 12);
  setTimeout(() => map.invalidateSize(), 100);

  const go = async (from, to) => {
    try {
      const r = await api(`/route?from=${from}&to=${to}`);
      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.polyline(r.coordinates, { color: '#C6FF3D', weight: 5 }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      const warn = r.blocked_warning.length;
      toast(`${r.distance_km} km, about ${r.duration_min} min${warn ? `. WARNING: ${warn} blocked road(s) near this route` : ''}`, warn > 0);
    } catch (err) { toast(err.message, true); }
  };
  map.on('popupopen', e => {
    const el = e.popup.getElement();
    el.querySelectorAll('[data-route]').forEach(b => { b.onclick = () => { const [a, c] = b.dataset.route.split('|'); go(a, c); }; });
    el.querySelectorAll('[data-clear]').forEach(b => { b.onclick = async () => { try { await api(`/road-blocks/${b.dataset.clear}/clear`, { method: 'POST' }); map.closePopup(); drawBlocks(); } catch (err) { toast(err.message, true); } }; });
  });
  map.on('click', e => {
    if (!marking) return;
    marking = false; $('#mark', root).textContent = 'Mark blocked road';
    const dg = dialog(`<h2>Blocked road</h2><p class="mut">${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</p><label style="margin-top:12px">What is blocking it?</label><input id="why" maxlength="200" placeholder="Flooded underpass, fallen tree…">
      <div class="actions"><button class="btn" id="ok">Save</button><button class="btn ghost" data-close>Cancel</button></div>`);
    $('#ok', dg).onclick = async () => {
      try { await api('/road-blocks', { method: 'POST', body: { lat: e.latlng.lat, lng: e.latlng.lng, description: $('#why', dg).value } }); toast('Road marked as blocked'); dg.close(); drawBlocks(); }
      catch (err) { toast(err.message, true); }
    };
  });
  root.addEventListener('change', e => {
    if (e.target.dataset.layer) { const l = layers[e.target.dataset.layer]; e.target.checked ? l.addTo(map) : map.removeLayer(l); }
    if (e.target.id === 'kind') drawIncidents(e.target.value);
  });
  const mk = $('#mark', root);
  if (mk) mk.onclick = () => { marking = !marking; mk.textContent = marking ? 'Click the map…' : 'Mark blocked road'; };
}
