import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Fix Leaflet marker icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Step2Location({
  value = {},
  update,
  onValidChange,
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onValidChange(Boolean(value.location));
  }, [value.location]);

  const captureLocation = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          update("location", {
            lat: latitude,
            lng: longitude,
            accuracy,
            place: data.display_name || "",
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Reverse geocode failed", err);
        }

        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-8">

      {/* CAPTURE BUTTON */}
      {!value.location && (
        <button
          onClick={captureLocation}
          disabled={loading}
          className="px-6 py-2 bg-yellow-400 text-black
          rounded-lg font-semibold hover:bg-yellow-300"
        >
          {loading ? "Fetching Location..." : "Capture Live GPS Location"}
        </button>
      )}

      {/* LOCATION DETAILS */}
      {value.location && (
        <div className="space-y-6">

          <div className="bg-[#020617] border border-yellow-400/20 rounded-lg p-6 space-y-2 text-sm">
            <p><strong>Latitude:</strong> {value.location.lat}</p>
            <p><strong>Longitude:</strong> {value.location.lng}</p>
            <p>
              <strong>Accuracy:</strong> ±
              {Math.round(value.location.accuracy)} m
            </p>
            <p>
              <strong>Place:</strong> {value.location.place}
            </p>
            <p className="text-slate-400 text-xs">
              Captured at:{" "}
              {new Date(value.location.timestamp).toLocaleString()}
            </p>
          </div>

          {/* MAP VIEW */}
          <div className="h-80 rounded-xl overflow-hidden border border-yellow-400/20">
            <MapContainer
              center={[value.location.lat, value.location.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[
                  value.location.lat,
                  value.location.lng,
                ]}
              />
            </MapContainer>
          </div>

          {/* RECAPTURE */}
          <button
            onClick={() => update("location", null)}
            className="px-4 py-2 border border-yellow-400/30
            rounded-lg text-yellow-400 hover:bg-yellow-400/10"
          >
            Recapture Location
          </button>
        </div>
      )}
    </div>
  );
}
