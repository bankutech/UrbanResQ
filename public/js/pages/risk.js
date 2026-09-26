import { api } from '../api.js';
import { esc, num, pill } from '../ui.js';

export async function render(root) {
  const [w, r, f] = await Promise.all([api('/weather'), api('/analytics/risk'), api('/analytics/forecast')]);
  root.innerHTML = `
    <div class="card" style="margin-bottom:14px"><h2>Weather by area</h2>${w.available ? `<table class="t"><tr><th>Area</th><th>Temp</th><th>Rain now</th><th>Wind</th><th></th></tr>${w.data.map(x => `<tr><td>${esc(x.area)}</td><td>${x.temp_c}°C</td><td>${x.rain_mm} mm</td><td>${x.wind_kmh} km/h</td><td>${x.alert ? '<span class="pill critical">heavy rain / wind</span>' : ''}</td></tr>`).join('')}</table>` : '<p class="mut">The weather feed could not be reached from the server. Areas will show here once it can.</p>'}</div>
    <div class="cols"><div class="card"><h2>Area risk</h2><table class="t"><tr><th>Area</th><th>Baseline</th><th>Incidents (12 mo)</th><th>Score</th><th>Band</th></tr>${r.data.map(a => `<tr><td>${esc(a.area)}</td><td>${esc(a.baseline)}</td><td>${a.incidents_12m}</td><td>${a.score}</td><td>${pill(a.band)}</td></tr>`).join('')}</table><p class="mut" style="margin-top:10px">${esc(r.method)}</p></div>
    <div class="card"><h2>Demand forecast</h2><table class="t"><tr><th>Resource</th><th>Used 30d</th><th>Next 7d</th><th>In stock</th><th>Cover</th><th>Basis</th></tr>${f.data.filter(d => d.used_30d > 0 || d.in_stock > 0).map(d => `<tr><td>${esc(d.resource)}</td><td>${num(d.used_30d)}</td><td>${num(d.next_7d)}</td><td>${num(d.in_stock)}</td><td class="${d.days_of_cover !== null && d.days_of_cover < 7 ? 'err' : ''}">${d.days_of_cover === null ? '–' : d.days_of_cover + ' d'}</td><td>${esc(d.confidence)}</td></tr>`).join('')}</table><p class="mut" style="margin-top:10px">${esc(f.method)}</p></div></div>`;
}
