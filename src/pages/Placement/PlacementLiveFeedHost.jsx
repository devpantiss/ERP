import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

/* ================= ICE SERVERS ================= */

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [sessionId, setSessionId] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [gps, setGps] = useState(null);
  const [time, setTime] = useState(new Date());

  /* ================= CLOCK ================= */

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= GPS ================= */

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
        });
      },
      () => console.log("GPS permission denied")
    );
  }, []);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24 },
      },
      audio: true,
    });

    streamRef.current = media;

    videoRef.current.srcObject = media;

    /* ===== PEER ===== */
    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
      config: ICE_CONFIG,
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("Host Peer ID:", id);
      setSessionId(id);
      setStarted(true);
    });

    peer.on("call", (call) => {
      console.log("Viewer connected");

      call.answer(media);

      setViewerCount((c) => c + 1);

      call.on("close", () => {
        setViewerCount((c) => Math.max(0, c - 1));
      });
    });

    /* ===== RECORDING ===== */
    const recorder = new MediaRecorder(media, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 1500000, // bandwidth optimization
    });

    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start();
    setRecording(true);
  };

  /* ================= STOP ================= */

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    if (recorderRef.current) {
      recorderRef.current.stop();
    }

    setStarted(false);
    setSessionId(null);
  };

  /* ================= SAVE RECORDING ================= */

  const saveRecording = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "session-recording.webm";
    a.click();

    chunksRef.current = [];
  };

  /* ================= WATERMARK CANVAS ================= */

  useEffect(() => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!videoRef.current) return;

      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;

      ctx.drawImage(videoRef.current, 0, 0);

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(10, canvas.height - 90, 320, 80);

      ctx.fillStyle = "#fff";
      ctx.font = "14px sans-serif";

      ctx.fillText(`Place: ${placeName || "N/A"}`, 20, canvas.height - 60);

      if (gps) {
        ctx.fillText(`GPS: ${gps.lat}, ${gps.lng}`, 20, canvas.height - 40);
      }

      ctx.fillText(`Time: ${time.toLocaleString()}`, 20, canvas.height - 20);

      requestAnimationFrame(draw);
    };

    draw();
  }, [time, gps, placeName]);

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl">

      <h2 className="text-xl font-semibold text-emerald-400 mb-4">
        Trainer Live Session
      </h2>

      {/* PLACE INPUT */}
      <input
        placeholder="Enter Place Name"
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        className="mb-4 px-3 py-2 rounded bg-black border border-emerald-400/30"
      />

      <div className="relative">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xl rounded-lg"
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* LIVE BADGE */}
        {started && (
          <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded text-xs">
            LIVE • {viewerCount} viewers
          </div>
        )}

      </div>

      <div className="mt-4 flex gap-3">

        {!started && (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            Start
          </button>
        )}

        {started && (
          <>
            <button
              onClick={stopSession}
              className="px-4 py-2 bg-red-500 rounded"
            >
              Stop
            </button>

            <button
              onClick={saveRecording}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Save Recording
            </button>
          </>
        )}

      </div>

      {sessionId && (
        <div className="mt-4 p-3 bg-black rounded border border-emerald-400/20">
          <p className="text-sm text-slate-400">Share Link</p>

          <p className="text-emerald-400 break-all">
            {window.location.origin}/trainer/live/{sessionId}
          </p>
        </div>
      )}

    </div>
  );
}