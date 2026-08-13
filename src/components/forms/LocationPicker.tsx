"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// react-leaflet's default marker icon resolves relative to the bundler's
// asset pipeline, which breaks under Next.js. Point it at copies of Leaflet's
// own images served from public/ — a CDN here would be a third-party request
// on the critical path of the one control the form depends on.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
});

const AMIOUN_CENTER: [number, number] = [34.2983, 35.8079];

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Leaflet measures its container once, at mount, and never again on its own.
 * The picker mounts inside a lazily-hydrated card that is still laying out —
 * and on phones the address bar collapses and the on-screen keyboard opens
 * and closes while the form is being filled — so that first measurement is
 * routinely wrong or taken at zero height. The result is the blank grey panel:
 * a live map that believes it is 0x0 and therefore requests no tiles.
 * Re-measuring on every container resize is what makes it reliable across
 * devices rather than only on the desktop where it happened to be tested.
 */
function ResizeWatcher() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    // The mount-time pass covers the common case where the card is still
    // being laid out on the frame the map initialises.
    map.invalidateSize({ animate: false });

    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);

    // Orientation changes resize the viewport without necessarily resizing
    // the container in the same frame the observer fires.
    const onOrientationChange = () => {
      window.setTimeout(() => map.invalidateSize({ animate: false }), 200);
    };
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, [map]);

  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (value: { lat: number; lng: number }) => void;
}) {
  return (
    <MapContainer
      center={AMIOUN_CENTER}
      zoom={14}
      // A map that swallows wheel and two-finger gestures traps the reader
      // mid-page; pinch-zoom on the map itself still works, and the +/-
      // controls cover the rest.
      scrollWheelZoom={false}
      touchZoom
      className="h-full w-full"
      // Leaflet paints its own panes; without a background the container shows
      // through as a white block while the first tiles are in flight.
      style={{ background: "#e5e7eb" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // OSM's usage policy caps tiles at zoom 19; requesting more returns
        // errors instead of imagery, so upscale the last real level instead.
        maxZoom={19}
      />
      <ResizeWatcher />
      <ClickHandler onSelect={(lat, lng) => onChange({ lat, lng })} />
      {value && <Marker position={[value.lat, value.lng]} />}
    </MapContainer>
  );
}
