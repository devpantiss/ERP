import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  GeoJSON,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaGlobeAsia, FaFire, FaLayerGroup } from "react-icons/fa";

/* ================= DUMMY DATA ================= */

const openings = [
  { country: "India", state: "Odisha", district: "Baleshwar", vacancies: 18 },
  { country: "India", state: "Odisha", district: "Jajpur", vacancies: 25 },
  { country: "India", state: "Odisha", district: "Keonjhar", vacancies: 16 },
  { country: "India", state: "Odisha", district: "Khordha", vacancies: 20 },
  { country: "India", state: "Odisha", district: "Cuttack", vacancies: 14 },

  { country: "India", state: "West Bengal", vacancies: 22 },
  { country: "India", state: "Jharkhand", vacancies: 18 },
  { country: "India", state: "Bihar", vacancies: 14 },
  { country: "India", state: "Gujarat", vacancies: 28 },
  { country: "India", state: "Maharashtra", vacancies: 32 },

  { country: "United Arab Emirates", vacancies: 20 },
  { country: "Australia", vacancies: 60 },
  { country: "South Africa", vacancies: 14 },
  { country: "Russia", vacancies: 28 },
  { country: "Germany", vacancies: 10 },
  { country: "Brazil", vacancies: 9 },
  { country: "Canada", vacancies: 22 },
  { country: "Sweden", vacancies: 98 },
];

/* ================= MAP CONFIG ================= */

const MAP_CONFIG = {
  odisha: {
    file: "/map/Orissa.geojson",
    center: [20.3, 85.8],
    zoom: 10,
  },
  india: {
    file: "/map/india_states.geojson",
    center: [22.8, 79],
    zoom: 4.6,
  },
  world: {
    file: "/map/world.geo.json",
    center: [25, 0],
    zoom: 2.4,
  },
};

/* ================= HEAT COLOR ================= */

const getHeatColor = (value) => {
  if (value > 80) return "#0891b2";
  if (value > 40) return "#06b6d4";
  if (value > 20) return "#22d3ee";
  if (value > 10) return "#67e8f9";
  return "#a5f3fc";
};

/* ================= MARKER ================= */

const createPulseIcon = (count) =>
  L.divIcon({
    className: "",
    html: `
      <div class="pulse-container">
        <div class="pulse-ring"></div>
        <div class="pulse-core">${count}</div>
      </div>
    `,
    iconSize: [40, 40],
  });

/* ================= FIT ODISHA ================= */

function FitBounds({ geoData, level }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData || level !== "odisha") return;

    const layer = L.geoJSON(geoData);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [5, 5], maxZoom: 8 });
    }
  }, [geoData, level, map]);

  return null;
}

/* ================= SKELETON ================= */

function MapSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-900">
      <div className="w-full h-full shimmer opacity-60" />
      <p className="absolute text-cyan-400 text-sm">
        Loading Map Intelligence...
      </p>
    </div>
  );
}

/* ================= MAIN ================= */

export default function OpeningGeoMapSection() {
  const [level, setLevel] = useState("odisha");
  const [geoData, setGeoData] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [loading, setLoading] = useState(true);

  /* LOAD GEOJSON */

  useEffect(() => {
    const file = MAP_CONFIG[level].file;

    setGeoData(null);
    setLoading(true);

    fetch(file)
      .then((res) => res.json())
      .then((data) => {
        if (level === "world") {
          data.features = data.features.filter(
            (f) => f.properties?.admin !== "Antarctica"
          );
        }

        setGeoData(data);

        setTimeout(() => setLoading(false), 500);
      });
  }, [level]);

  /* NAME RESOLVER */

  const getFeatureName = (feature) =>
    (
      feature.properties?.Dist_Name ||
      feature.properties?.NAME_1 ||
      feature.properties?.State_Name ||
      feature.properties?.admin ||
      feature.properties?.name ||
      ""
    );

  /* MATCH OPENINGS */

  const getOpeningsForFeature = (feature) => {
    const name = getFeatureName(feature).toLowerCase();

    if (level === "odisha") {
      return openings.filter(
        (o) =>
          o.state?.toLowerCase() === "odisha" &&
          o.district?.toLowerCase() === name
      );
    }

    if (level === "india") {
      return openings.filter(
        (o) =>
          o.country === "India" &&
          o.state?.toLowerCase() === name
      );
    }

    if (level === "world") {
      return openings.filter(
        (o) => o.country?.toLowerCase() === name
      );
    }

    return [];
  };

  /* CENTER */

  const getCenter = (geometry) => {
    if (!geometry) return null;

    const coords =
      geometry.type === "Polygon"
        ? geometry.coordinates[0]
        : geometry.coordinates[0][0];

    let lat = 0,
      lng = 0;

    coords.forEach((c) => {
      lng += c[0];
      lat += c[1];
    });

    return [lat / coords.length, lng / coords.length];
  };

  /* ANALYTICS */

  const analytics = useMemo(() => {
    const totalVacancies = openings.reduce(
      (sum, o) => sum + o.vacancies,
      0
    );

    const highest = openings.reduce(
      (max, o) => (o.vacancies > max.vacancies ? o : max),
      openings[0]
    );

    return {
      totalVacancies,
      regions: openings.length,
      highest,
    };
  }, []);

  /* STYLE */

  const geoJsonStyle = (feature) => {
    const jobs = getOpeningsForFeature(feature);
    const total = jobs.reduce((s, j) => s + j.vacancies, 0);

    return {
      fillColor: getHeatColor(total),
      fillOpacity: total ? 0.85 : 0,
      weight: hoveredName === getFeatureName(feature) ? 2.2 : 1.2,
      color: "#ffffff",
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = getFeatureName(feature);
    const jobs = getOpeningsForFeature(feature);

    const total = jobs.reduce((s, j) => s + j.vacancies, 0);

    layer.bindTooltip(
      `<strong>${name}</strong><br/>Vacancies: ${total}`,
      { sticky: true }
    );

    layer.on({
      mouseover: () => setHoveredName(name),
      mouseout: () => setHoveredName(null),
    });
  };

  return (
    <div className="min-h-screen mt-4 bg-black text-white">

      {/* ================= TOP BAR ================= */}

      <div className="flex items-center justify-between px-8 py-4 border-b border-cyan-900">

        <div>
          <h1 className="text-xl font-semibold text-cyan-400">
            Placement Intelligence Map
          </h1>
          <p className="text-xs text-gray-400">
            Geographic distribution of openings
          </p>
        </div>

        <div className="flex items-center gap-3">

          {["odisha", "india", "world"].map((tab) => (
            <button
              key={tab}
              onClick={() => setLevel(tab)}
              className={`px-4 py-1.5 rounded-md text-sm capitalize transition ${
                level === tab
                  ? "bg-cyan-500 text-black"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}

          <FaGlobeAsia className="text-cyan-400 text-xl" />

        </div>

      </div>

      {/* ================= MAP AREA ================= */}

      <div className="relative h-[calc(100vh-70px)]">

        {loading && <MapSkeleton />}

        {!loading && geoData && (
          <MapContainer
            key={`map-${level}`}
            center={MAP_CONFIG[level].center}
            zoom={MAP_CONFIG[level].zoom}
            style={{ height: "100%", width: "100%", background: "#000" }}
          >

            {/* ⭐ DARK TILE LAYER */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap & Carto"
            />

            <FitBounds geoData={geoData} level={level} />

            <GeoJSON
              data={geoData}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />

            {geoData.features.map((feature, idx) => {
              const jobs = getOpeningsForFeature(feature);
              if (!jobs.length) return null;

              const center = getCenter(feature.geometry);
              if (!center) return null;

              const total = jobs.reduce(
                (s, j) => s + j.vacancies,
                0
              );

              return (
                <Marker
                  key={idx}
                  position={center}
                  icon={createPulseIcon(total)}
                />
              );
            })}
          </MapContainer>
        )}

        {/* ================= KPI FLOAT ================= */}

        <div className="absolute top-6 left-6 flex gap-4 z-1000">

          <KpiCard
            title="Vacancies"
            value={analytics.totalVacancies}
            icon={<FaLayerGroup />}
          />

          <KpiCard
            title="Regions"
            value={analytics.regions}
            icon={<FaFire />}
          />

          <KpiCard
            title="Peak"
            value={analytics.highest?.vacancies}
            icon={<FaFire />}
          />

        </div>

        {/* ================= ANALYTICS PANEL ================= */}

        <div className="absolute top-6 right-6 w-[260px] bg-black/70 backdrop-blur border border-cyan-900 rounded-xl p-4 z-1000">

          <h3 className="text-sm text-cyan-400 mb-3">
            Analytics
          </h3>

          <Stat label="Map Level" value={level.toUpperCase()} />
          <Stat label="Highest Region" value={analytics.highest?.vacancies} />

        </div>

        {/* ================= LEGEND ================= */}

        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur border border-cyan-900 rounded-lg p-3 text-xs z-1000">

          <p className="text-gray-400 mb-2">
            Vacancy Density
          </p>

          <div className="flex gap-2">
            <LegendBox color="#a5f3fc" />
            <LegendBox color="#22d3ee" />
            <LegendBox color="#06b6d4" />
            <LegendBox color="#0891b2" />
          </div>

        </div>

      </div>

      {/* ================= CSS ================= */}

      <style>{`

        .leaflet-container {
          background: #000 !important;
        }

        .leaflet-tile {
          filter: brightness(0.6) contrast(1.2);
        }

        .shimmer {
          background: linear-gradient(
            110deg,
            #000 8%,
            #0b1120 18%,
            #000 33%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }

        @keyframes shimmer {
          to { background-position-x: -200%; }
        }

        .pulse-container {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .pulse-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,0,0,0.4);
          animation: pulse 1.6s infinite;
        }

        .pulse-core {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ff0000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 0 12px rgba(255,0,0,0.9);
        }

        @keyframes pulse {
          0% { transform: scale(0.7); opacity: 0.7; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { opacity: 0; }
        }

      `}</style>

    </div>
  );
}

/* ================= UI ================= */

function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-black/70 backdrop-blur border border-cyan-900 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">

      <div className="text-cyan-400">{icon}</div>

      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="mb-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function LegendBox({ color }) {
  return (
    <div
      className="w-6 h-3 rounded"
      style={{ background: color }}
    />
  );
}
