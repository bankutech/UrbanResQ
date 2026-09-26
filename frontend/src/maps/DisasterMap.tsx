import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import HeatmapLayer, { HeatmapPoint } from './HeatmapLayer';

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  label: string;
  type: 'disaster' | 'request' | 'hospital' | 'shelter' | 'team' | 'vehicle';
  severity?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'STABLE';
  meta?: string;
  radiusMeters?: number;
}

export const MARKER_COLORS: Record<MapMarker['type'], string> = {
  disaster: '#EF4444',
  request:  '#F97316',
  hospital: '#06B6D4',
  shelter:  '#10B981',
  team:     '#EAB308',
  vehicle:  '#38BDF8',
};

function createTacticalIcon(type: MapMarker['type'], severity?: string, isSelected?: boolean) {
  const isCritical = severity === 'CRITICAL' || type === 'disaster';
  const color = MARKER_COLORS[type] || '#06B6D4';
  
  const iconHtml = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 36px; height: 36px;">
      ${isCritical ? `
        <span class="absolute inset-0 animate-ping opacity-60" style="background-color: ${color};"></span>
        <span class="absolute inset-1 opacity-30" style="background-color: ${color};"></span>
      ` : ''}
      <div class="relative z-10 flex items-center justify-center border shadow-lg ${
        isSelected ? 'ring-2 ring-cyan-400 scale-125' : ''
      }" style="
        width: 26px; 
        height: 26px; 
        background: #090D16; 
        border-color: ${color};
        color: ${color};
        box-shadow: 0 0 10px ${color}40;
      ">
        ${getGlyphSvg(type)}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-tactical-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function getGlyphSvg(type: MapMarker['type']): string {
  switch (type) {
    case 'disaster':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    case 'hospital':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/></svg>`;
    case 'shelter':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'team':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case 'request':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    case 'vehicle':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="6" rx="2"/><circle cx="6" cy="18" r="2"/><circle cx="14" cy="18" r="2"/><path d="M18 10h4l2 3v3h-2"/></svg>`;
    default:
      return `<circle cx="12" cy="12" r="6" fill="currentColor"/>`;
  }
}

function MapFocusController({ selectedCoord }: { selectedCoord?: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    if (selectedCoord) {
      map.flyTo(selectedCoord, Math.max(map.getZoom(), 13), { duration: 1.2 });
    }
  }, [selectedCoord, map]);
  return null;
}

export default function DisasterMap({
  markers,
  center = [13.04, 80.24],
  zoom = 12,
  height = 460,
  showHeatmap = false,
  heatmapPoints = [],
  selectedId,
  onSelectMarker,
}: {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  showHeatmap?: boolean;
  heatmapPoints?: HeatmapPoint[];
  selectedId?: string | number | null;
  onSelectMarker?: (marker: MapMarker) => void;
}) {
  const selectedCoord = useMemo(() => {
    if (!selectedId) return undefined;
    const found = markers.find((m) => m.id === selectedId);
    return found ? ([found.lat, found.lng] as [number, number]) : undefined;
  }, [selectedId, markers]);

  return (
    <div 
      style={{ height }} 
      className="relative overflow-hidden border border-eoc-border bg-[#090D16] shadow-tactical"
      role="region"
      aria-label="Tactical GIS Map Interface"
    >
      <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5 border border-eoc-border bg-[#090D16]/90 px-2 py-1 font-mono text-[10px] text-cyan-400 backdrop-blur-sm pointer-events-none">
        <span className="h-1.5 w-1.5 bg-cyan-400 animate-pulse" />
        GIS TELEMETRY · EPSG:3857
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }} 
        scrollWheelZoom={true}
      >
        <MapFocusController selectedCoord={selectedCoord} />

        <TileLayer
          className="tactical-dark-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapLayer points={heatmapPoints} />
        )}

        {!showHeatmap && markers.filter(m => m.type === 'disaster').map((m) => (
          <Circle
            key={`radius-${m.id}`}
            center={[m.lat, m.lng]}
            radius={m.radiusMeters || 2200}
            pathOptions={{
              color: '#EF4444',
              fillColor: '#EF4444',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        ))}

        {!showHeatmap && markers.map((m) => {
          const isSelected = selectedId === m.id;
          const icon = createTacticalIcon(m.type, m.severity, isSelected);

          return (
            <Marker
              key={`${m.type}-${m.id}`}
              position={[m.lat, m.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectMarker?.(m),
              }}
            >
              <Popup>
                <div className="p-1 font-mono text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-eoc-text uppercase tracking-tight">
                    <span 
                      className="inline-block h-2 w-2" 
                      style={{ backgroundColor: MARKER_COLORS[m.type] }} 
                    />
                    {m.label}
                  </div>
                  <div className="mt-1 text-[11px] text-eoc-muted border-t border-eoc-border pt-1">
                    {m.meta || `Type: ${m.type.toUpperCase()}`}
                  </div>
                  <div className="mt-1 text-[9px] text-cyan-400">
                    GPS: {m.lat.toFixed(4)}°N, {m.lng.toFixed(4)}°E
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
