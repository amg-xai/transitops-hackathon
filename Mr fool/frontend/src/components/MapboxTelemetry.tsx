import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ShieldAlert } from 'lucide-react';

const DEMO_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const MapboxTelemetry = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!DEMO_TOKEN) {
      setHasError(true);
      return;
    }

    try {
      mapboxgl.accessToken = DEMO_TOKEN;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [73.8567, 18.5204], // Pune, India coordinate
        zoom: 5.5,
        attributionControl: false
      });

      // Add navigation controls (Zoom + Compass)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add custom active telemetry markers
      const coordinates: Array<[number, number, string]> = [
        [73.8567, 18.5204, 'Pune Hub — 4 active dispatches'],
        [72.8777, 19.0760, 'Mumbai Port — 12 active dispatches'],
        [77.5946, 12.9716, 'Bangalore HQ — 8 active dispatches']
      ];

      coordinates.forEach(([lng, lat, label]) => {
        // Create custom neon marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#2563eb';
        el.style.border = '2px solid #d4e4fa';
        el.style.boxShadow = '0 0 10px #2563eb';
        el.style.cursor = 'pointer';

        // Instantiate popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<span style="color:#030712; font-size:11px; font-weight:bold;">${label}</span>`);

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      });

      return () => map.remove();
    } catch (err) {
      console.error('Failed to initialize Mapbox GL:', err);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-6 min-h-[300px]">
        <ShieldAlert className="w-12 h-12 text-danger animate-pulse mb-3" />
        <h4 className="font-bold text-sm text-text-primary">Mapbox GL Token Missing</h4>
        <p className="text-xs text-text-muted text-center mt-2 leading-relaxed max-w-sm">
          Please add your Mapbox access token to a <code className="bg-white/10 px-1 py-0.5 rounded text-accent">.env</code> file as <code className="bg-white/10 px-1 py-0.5 rounded text-accent">VITE_MAPBOX_TOKEN</code> to load the satellite telemetry feed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />
      
      {/* Floating Map Info Overlay */}
      <div className="absolute bottom-4 left-4 glass p-3 rounded-xl border border-white/5 z-10 flex items-center gap-2 text-[10px] text-text-primary">
        <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <span className="font-semibold">Satellite Mapbox Feed: Active</span>
      </div>
    </div>
  );
};
