import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export type HeatmapPoint = [number, number, number]; // [lat, lng, intensity]

export interface HeatmapLayerProps {
  points: HeatmapPoint[];
  options?: L.HeatMapOptions;
}

export default function HeatmapLayer({ points, options }: HeatmapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    // Only initialize once, otherwise it might flicker on re-renders if we're not careful
    if (!heatLayerRef.current) {
      heatLayerRef.current = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 14,
        max: 1.0,
        gradient: {
          0.4: 'blue',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        },
        ...options
      }).addTo(map);
    } else {
      heatLayerRef.current.setLatLngs(points);
      if (options) {
        heatLayerRef.current.setOptions(options);
      }
    }

    return () => {
      // Cleanup on unmount
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, options]);

  return null;
}
