import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ===================== CONSTANT DATA ===================== */

const PROJECTS = ["Skill India", "Green Jobs", "Rural Employment"];
const GPS_LIST = ["Binjharpur GP", "Jajpur Road GP", "Dharmasala GP", "Sukinda GP"];
const BLOCKS = ["Jajpur", "Dharmasala", "Sukinda", "Danagadi"];

/* ===================== GEO HELPERS ===================== */

const getGeoLocation = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      reject
    );
  });

const watermarkImage = (file, textLines) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

      ctx.fillStyle = "white";
      ctx.font = "18px sans-serif";

      textLines.forEach((line, i) => {
        ctx.fillText(line, 20, canvas.height - 60 + i * 22);
      });

      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, "image/jpeg");
    };
  });

/* ===================== DUMMY EVENTS ===================== */

const createEvents = () => {
  return Array.from({ length: 18 }, (_, i) => {
    const completed = i % 3 === 0 || i % 5 === 0;

    return {
      id: i + 1,
      name: `Community Awareness ${i + 1}`,
      project: PROJECTS[i % PROJECTS.length],
      block: BLOCKS[i % BLOCKS.length],
      gp: GPS_LIST[i % GPS_LIST.length],
      participants: Math.floor(Math.random() * 50) + 20,
      location: `Community Hall ${i + 1}`, // TEXT PLACE NAME
      lat: null,
      lng: null,
      timestamp: null,
      date: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String(
        (i % 28) + 1
      ).padStart(2, "0")}`,
      status: completed ? "Completed" : "Pending",
      image: null,
      video: null,
    };
  });
};

/* ===================== COMPONENT ===================== */

export default function CommunityHistory() {
  const [events, setEvents] = useState(createEvents());

  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewMeta, setPreviewMeta] = useState(null);

  /* ===================== FILTERS ===================== */
  const [filterGP, setFilterGP] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterDate, setFilterDate] = useState("");

  /* ===================== ACTIONS ===================== */

  const markCompleted = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "Completed" } : e
      )
    );
  };

  const uploadImage = async (id, file) => {
    try {
      const geo = await getGeoLocation();
      const timestamp = new Date().toLocaleString();

      const event = events.find((e) => e.id === id);

      const watermarked = await watermarkImage(file, [
        `📍 ${event.location}`,
        `Lat: ${geo.lat.toFixed(5)}  Lng: ${geo.lng.toFixed(5)}`,
        timestamp,
      ]);

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                image: watermarked,
                lat: geo.lat,
                lng: geo.lng,
                timestamp,
              }
            : e
        )
      );
    } catch {
      alert("GPS permission required");
    }
  };

  const uploadVideo = async (id, file) => {
    try {
      const geo = await getGeoLocation();
      const timestamp = new Date().toLocaleString();

      const url = URL.createObjectURL(file);

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                video: url,
                lat: geo.lat,
                lng: geo.lng,
                timestamp,
              }
            : e
        )
      );
    } catch {
      alert("GPS permission required");
    }
  };

  /* ===================== SUMMARY ===================== */

  const totalParticipants = events.reduce(
    (sum, e) => sum + e.participants,
    0
  );

  const completedCount = events.filter(
    (e) => e.status === "Completed"
  ).length;

  /* ===================== FILTERED DATA ===================== */

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterGP && e.gp !== filterGP) return false;
      if (filterBlock && e.block !== filterBlock) return false;
      if (filterDate && e.date !== filterDate) return false;
      return true;
    });
  }, [events, filterGP, filterBlock, filterDate]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  /* ===================== EXPORT ===================== */

  const exportExcel = () => {
    const rows = filteredEvents.map((e) => ({
      Name: e.name, Project: e.project, Block: e.block,
      GP: e.gp, Date: e.date, Participants: e.participants,
      Location: e.location, Status: e.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CommunityEvents");
    XLSX.writeFile(wb, "community_events.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Project", "Block", "GP", "Date", "Participants", "Status"]],
      body: filteredEvents.map((e) => [
        e.name, e.project, e.block, e.gp, e.date, e.participants, e.status,
      ]),
    });
    doc.save("community_events.pdf");
  };

  return (
    <>
      <section className="rounded-2xl border border-yellow-400/20 bg-transparent p-6 shadow-xl">

        {/* HEADER */}
        <div className="flex items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Community Events
            </h2>
            <p className="text-sm text-white/60">
              Monitor mobilizer activities & uploads
            </p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={exportExcel}
              className="px-4 py-2 text-sm rounded-lg border border-yellow-400/30
              text-yellow-400 hover:bg-yellow-400/10 transition font-medium"
            >
              Export Excel
            </button>
            <button
              onClick={exportPDF}
              className="px-4 py-2 text-sm rounded-lg border border-yellow-400/30
              text-yellow-400 hover:bg-yellow-400/10 transition font-medium"
            >
              Export PDF
            </button>
            <Link
              to="/mobilizer/create-community-drive"
              className="px-4 py-2 text-sm rounded-lg
              bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
            >
              + Create Event
            </Link>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card title="Total Events" value={events.length} />
          <Card title="Completed" value={completedCount} />
          <Card title="Participants" value={totalParticipants} />
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <select
            value={filterBlock}
            onChange={(e) => { setFilterBlock(e.target.value); setCurrentPage(1); }}
            className="bg-[#020617] border border-yellow-400/20 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Blocks</option>
            {BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filterGP}
            onChange={(e) => { setFilterGP(e.target.value); setCurrentPage(1); }}
            className="bg-[#020617] border border-yellow-400/20 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Gram Panchayats</option>
            {GPS_LIST.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            className="bg-[#020617] border border-yellow-400/20 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-yellow-400/20">
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#020617]/80 backdrop-blur sticky top-0 z-10 border-b border-yellow-400/20">
                <tr className="text-white/80 text-xs uppercase tracking-wider">

                  {[
                    "Name",
                    "Project",
                    "Block",
                    "GP",
                    "Date",
                    "Participants",
                    "Location",
                    "Status",
                    "Image",
                    "Video",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>
            {paginatedData.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-yellow-400/10 hover:bg-yellow-400/5 transition-colors"
                  >

                    <td className="px-4 py-3 font-medium text-white">{e.name}</td>
                    <td className="px-4 py-3 text-white/80">{e.project}</td>
                    <td className="px-4 py-3 text-white/80">{e.block}</td>
                    <td className="px-4 py-3 text-white/80">{e.gp}</td>
                    <td className="px-4 py-3 text-white/80">{e.date}</td>
                    <td className="px-4 py-3 text-white/80">{e.participants}</td>

                    {/* LOCATION TEXT */}
                    <td className="px-4 py-3 text-white/60 text-xs">
                      {e.location}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      {e.status === "Pending" ? (
                        <button
                          onClick={() => markCompleted(e.id)}
                          className="px-3 py-1 text-xs rounded-full
                          bg-yellow-400/10 text-yellow-400 border border-yellow-400/30
                          hover:bg-yellow-400 hover:text-black transition"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="px-3 py-1 text-xs rounded-full
                        bg-green-500/10 text-green-400 border border-green-400/30">
                          Completed
                        </span>
                      )}
                    </td>

                    {/* IMAGE */}
                    <td className="px-4 py-3">
                      {e.image ? (
                        <img
                          src={e.image}
                          onClick={() => {
                            setPreviewImage(e.image);
                            setPreviewMeta(e);
                          }}
                          className="w-14 h-10 object-cover rounded-md cursor-pointer border border-yellow-400/30"
                        />
                      ) : (
                        <UploadButton
                          disabled={e.status !== "Completed"}
                          onFile={(file) => uploadImage(e.id, file)}
                          label="Upload"
                        />
                      )}
                    </td>

                    {/* VIDEO */}
                    <td className="px-4 py-3">
                      {e.video ? (
                        <div
                          onClick={() => {
                            setPreviewVideo(e.video);
                            setPreviewMeta(e);
                          }}
                          className="w-14 h-10 rounded-md cursor-pointer bg-transparent flex items-center justify-center border border-yellow-400/30"
                        >
                          ▶
                        </div>
                      ) : (
                        <UploadButton
                          disabled={e.status !== "Completed"}
                          onFile={(file) => uploadVideo(e.id, file)}
                          label="Upload"
                        />
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>

      {/* IMAGE MODAL */}
      {previewImage && (
        <Modal onClose={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-xl rounded-lg" />
        </Modal>
      )}

      {/* VIDEO MODAL WITH WATERMARK OVERLAY */}
      {previewVideo && (
        <Modal onClose={() => setPreviewVideo(null)}>
          <div className="relative">
            <video src={previewVideo} controls autoPlay className="max-w-2xl rounded-lg" />

            {previewMeta && (
              <div className="absolute bottom-3 left-3 text-xs bg-transparent/60 px-3 py-2 rounded">
                <div>📍 {previewMeta.location}</div>
                <div>
                  Lat: {previewMeta.lat?.toFixed(5)} | Lng: {previewMeta.lng?.toFixed(5)}
                </div>
                <div>{previewMeta.timestamp}</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ===================== COMPONENTS ===================== */

function Card({ title, value }) {
  return (
    <div className="bg-[#020617] border border-yellow-400/20 rounded-xl p-4">
      <p className="text-xs text-white/60">{title}</p>
      <p className="text-2xl font-semibold text-yellow-400 mt-1">{value}</p>
    </div>
  );
}

function UploadButton({ disabled, onFile, label }) {
  return (
    <label
      className={`px-3 py-1 text-xs rounded-md border cursor-pointer
      ${
        disabled
          ? "opacity-40 cursor-not-allowed border-slate-600 text-slate-500"
          : "border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
      }`}
    >
      {label}
      <input
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onFile(e.target.files[0])}
      />
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-transparent/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
