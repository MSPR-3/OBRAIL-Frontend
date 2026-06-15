import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function css(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    if (points.length > 0) map.fitBounds(points, { padding: [32, 32], maxZoom: 9 });
    return () => clearTimeout(t);
  }, [points, map]);
  return null;
}

// dep/arr = { latitude, longitude, nom_officiel|nom, ville }
export default function TrajetMiniMap({ dep, arr }) {
  if (dep?.latitude == null || arr?.latitude == null) {
    return <div className="muted tiny">Coordonnées indisponibles pour ce trajet.</div>;
  }
  const a = [dep.latitude, dep.longitude];
  const b = [arr.latitude, arr.longitude];
  const accent = css('--accent', '#F5C518');
  const success = css('--success', '#16a34a');
  const danger = css('--danger', '#dc2626');

  return (
    <div style={{ height: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={a} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit points={[a, b]} />
        <Polyline positions={[a, b]} pathOptions={{ color: accent, weight: 3, opacity: 0.75 }} />
        <CircleMarker center={a} radius={7} pathOptions={{ color: success, fillColor: success, fillOpacity: 0.85, weight: 2 }}>
          <Popup>Départ · {dep.nom_officiel ?? dep.nom}{dep.ville ? ` (${dep.ville})` : ''}</Popup>
        </CircleMarker>
        <CircleMarker center={b} radius={7} pathOptions={{ color: danger, fillColor: danger, fillOpacity: 0.85, weight: 2 }}>
          <Popup>Arrivée · {arr.nom_officiel ?? arr.nom}{arr.ville ? ` (${arr.ville})` : ''}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
