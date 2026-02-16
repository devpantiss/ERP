import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { saveEnrollmentStep } from "../../../utils/enrollmentStorage";

/* ===================== CONSTANTS ===================== */

const DEFAULT_POS = { lat: 20.2961, lng: 85.8245 };

const EMPTY_ADDRESS = {
  house: "",
  street: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
};

/* ===================== SEARCH BAR ===================== */

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    setResults(data.slice(0, 5));
  };

  return (
    <div className="absolute top-3 left-3 z-1000 w-72 bg-[#020617] border border-yellow-400 rounded-lg shadow-lg">
      <div className="flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="flex-1 px-3 py-2 text-sm bg-transparent text-slate-200 outline-none"
        />
        <button
          onClick={search}
          className="px-3 text-sm text-yellow-400 border-l border-yellow-400 hover:bg-yellow-400/10"
        >
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="max-h-48 overflow-auto border-t border-yellow-400">
          {results.map((r) => (
            <div
              key={r.place_id}
              onClick={() => {
                onSelect({
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lon),
                });
                setQuery(r.display_name);
                setResults([]);
              }}
              className="px-3 py-2 text-xs cursor-pointer hover:bg-yellow-400/10 text-slate-300"
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== MAP CONTROLLER ===================== */

function MapController({ pos }) {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, 14);
  }, [pos]);
  return null;
}

/* ===================== MAIN COMPONENT ===================== */

export default function Step2({ value = {}, onChange, onValidChange }) {
  const [pos, setPos] = useState(
    value?.lat && value?.lng ? value : DEFAULT_POS
  );

  const [address, setAddress] = useState({
    ...EMPTY_ADDRESS,
    ...(value?.address || {}),
  });

  /* ===================== REVERSE GEOCODE ===================== */
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      setAddress((prev) => ({
        ...prev,
        street: data.address?.road || "",
        landmark: data.address?.neighbourhood || "",
        city: data.address?.city || data.address?.town || "",
        district: data.address?.county || "",
        state: data.address?.state || "",
        pincode: data.address?.postcode || prev.pincode,
      }));
    } catch (err) {
      console.error("Reverse geocode failed", err);
    }
  };

  /* ===================== PINCODE → MAP ===================== */
  const geocodePincode = async (pincode) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&countrycodes=in`
    );
    const data = await res.json();
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  };

  /* ===================== MAP EVENTS ===================== */
  function MarkerHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPos({ lat, lng });
        reverseGeocode(lat, lng);
      },
    });
    return <Marker position={pos} />;
  }

  /* ===================== CURRENT LOCATION ===================== */
  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPos({ lat: latitude, lng: longitude });
      reverseGeocode(latitude, longitude);
    });
  };

  /* ===================== SYNC ===================== */
  useEffect(() => {
    const payload = { lat: pos.lat, lng: pos.lng, address };

    onChange(payload);
    onValidChange(
      Boolean(
        pos.lat &&
          pos.lng &&
          address.city &&
          address.state &&
          address.pincode
      )
    );

    saveEnrollmentStep("address", payload);
  }, [pos, address]);

  /* ===================== UI ===================== */
  return (
    <div className="grid md:grid-cols-2 gap-0">

      {/* ================= MAP ================= */}
      <div className="relative border border-yellow-400 rounded-t-xl lg:rounded-l-xl overflow-hidden">
        <MapContainer center={pos} zoom={13} className="lg:h-[620px] h-[350px]">
          <SearchBar
            onSelect={(coords) => {
              setPos(coords);
              reverseGeocode(coords.lat, coords.lng);
            }}
          />

          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerHandler />
          <MapController pos={pos} />
        </MapContainer>

        <button
          onClick={useMyLocation}
          className="w-full border-t border-yellow-400 py-2 text-sm
          bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
        >
          Use Current Location
        </button>
      </div>

      {/* ================= ADDRESS FORM ================= */}
      <div className="bg-[#020617] border border-yellow-400 rounded-b-xl lg:rounded-r-xl p-6">
        <h3 className="font-semibold mb-4 text-yellow-400">
          Address Details
        </h3>

        <div className="grid gap-3">
          <Input label="House / Flat No" value={address.house} onChange={(v) => setAddress({ ...address, house: v })} />
          <Input label="Street / Locality" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
          <Input label="Nearest Landmark" value={address.landmark} onChange={(v) => setAddress({ ...address, landmark: v })} />
          <Input label="City / Town" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
          <Input label="District" value={address.district} onChange={(v) => setAddress({ ...address, district: v })} />
          <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
          <Input
            label="Pincode"
            value={address.pincode}
            onChange={async (v) => {
              setAddress({ ...address, pincode: v });
              if (/^\d{6}$/.test(v)) {
                const result = await geocodePincode(v);
                if (result) {
                  setPos(result);
                  reverseGeocode(result.lat, result.lng);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ===================== INPUT ===================== */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg px-3 py-2
        bg-[#0b0f14] border border-yellow-400
        text-slate-200 outline-none
        focus:border-yellow-400"
      />
    </div>
  );
}
