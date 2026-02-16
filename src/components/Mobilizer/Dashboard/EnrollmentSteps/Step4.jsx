import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { saveEnrollmentStep } from "../../../utils/enrollmentStorage";

/* ===================== FIX LEAFLET ICON ===================== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function StepLiveCapture({
  value = {},
  onChange,
  onValidChange,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photo, setPhoto] = useState(value.photo || "");
  const [location, setLocation] = useState(value.location || null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  /* ===================== SYNC + VALIDATION ===================== */
  useEffect(() => {
    const payload = { photo, location };
    onChange(payload);
    onValidChange(Boolean(photo && location));
    saveEnrollmentStep("capture", payload);
  }, [photo, location]);

  /* ===================== CAMERA ===================== */
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(imageData);

    video.srcObject.getTracks().forEach((t) => t.stop());
  };

  /* ===================== LOCATION ===================== */
  const captureLocation = () => {
    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
          place: data.display_name || "",
          timestamp: new Date().toISOString(),
        });

        setLoadingLoc(false);
      },
      () => setLoadingLoc(false),
      { enableHighAccuracy: true }
    );
  };

  /* ===================== UI ===================== */
  return (
    <div className="grid lg:grid-cols-2 gap-6 text-slate-200">

      {/* ================= CAMERA ================= */}
      <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-400 mb-4">
          Live Photo Capture
        </h3>

        {!photo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded-lg mb-4"
            />

            <canvas ref={canvasRef} hidden />

            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-md
                  border border-yellow-400 text-yellow-400
                  hover:bg-yellow-400/10"
              >
                Start Camera
              </button>

              <button
                onClick={capturePhoto}
                className="px-4 py-2 rounded-md
                  bg-yellow-400 text-black font-semibold
                  hover:bg-yellow-300"
              >
                Capture Photo
              </button>
            </div>
          </>
        ) : (
          <>
            <img
              src={photo}
              className="w-full h-64 object-cover rounded-lg mb-4 border border-yellow-400/20"
            />
            <button
              onClick={() => setPhoto("")}
              className="px-4 py-2 w-full rounded-md
                border border-yellow-400/30 text-yellow-400
                hover:bg-yellow-400/10"
            >
              Retake Photo
            </button>
          </>
        )}
      </div>

      {/* ================= LOCATION ================= */}
      <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-400 mb-4">
          Live Location Capture
        </h3>

        {!location ? (
          <button
            onClick={captureLocation}
            disabled={loadingLoc}
            className={`px-4 py-2 rounded-md font-semibold
              ${
                loadingLoc
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
          >
            {loadingLoc ? "Fetching location..." : "Capture Location"}
          </button>
        ) : (
          <div className="space-y-4">

            {/* LOCATION DETAILS */}
            <div className="text-sm space-y-1">
              <p><span className="text-slate-400">Latitude:</span> {location.lat}</p>
              <p><span className="text-slate-400">Longitude:</span> {location.lng}</p>
              <p>
                <span className="text-slate-400">Accuracy:</span>{" "}
                ±{Math.round(location.accuracy)} m
              </p>
              <p className="text-slate-400">
                <span className="text-slate-500">Place:</span> {location.place}
              </p>
              <p className="text-xs text-slate-500">
                Captured at:{" "}
                {new Date(location.timestamp).toLocaleString()}
              </p>
            </div>

            {/* MAP */}
            <div className="h-64 rounded-lg overflow-hidden border border-yellow-400/20">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lng]} />
              </MapContainer>
            </div>

            <button
              onClick={() => setLocation(null)}
              className="px-4 py-2 rounded-md w-full
                border border-yellow-400/30 text-yellow-400
                hover:bg-yellow-400/10"
            >
              Recapture Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
