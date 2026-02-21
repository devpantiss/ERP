import { useRef, useState } from "react";
import Peer from "peerjs";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function TrainerLiveHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    try {
      setStatus("initializing");
      setError(null);

      // Get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus("connecting");

      const peer = new Peer({
        config: ICE_CONFIG,
        debug: 2,
      });

      peerRef.current = peer;

      /* ---------- PEER READY ---------- */

      peer.on("open", (id) => {
        console.log("Host Peer ID:", id);
        setSessionId(id);
        setStatus("live");
      });

      /* ---------- INCOMING VIEWER CALL ---------- */
      // 🔥 THIS IS THE MOST IMPORTANT PART
      peer.on("call", (call) => {
        console.log("Incoming viewer connection");

        if (streamRef.current) {
          call.answer(streamRef.current);
        }

        call.on("error", (err) => {
          console.error("Call error:", err);
        });

        call.on("close", () => {
          console.log("Viewer disconnected");
        });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        setError(err.message);
        setStatus("error");
      });

    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera permission denied");
      setStatus("error");
    }
  };

  /* ================= STOP SESSION ================= */

  const stopSession = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();

      streamRef.current = null;
      peerRef.current = null;

      setSessionId(null);
      setStatus("idle");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SHARE LINK ================= */

  const shareLink = sessionId
    ? `${window.location.origin}/live/${sessionId}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  /* ================= STATUS LABEL ================= */

  const renderStatus = () => {
    switch (status) {
      case "initializing":
        return "Initializing camera...";
      case "connecting":
        return "Connecting...";
      case "live":
        return "Live";
      case "error":
        return error || "Error";
      default:
        return "Idle";
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-emerald-400">
          Trainer Live Session
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Start a session and share link to monitor
        </p>
      </div>

      {/* VIDEO */}
      <div className="relative w-full max-w-4xl">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-xl bg-black border border-white/10"
        />

        {/* LIVE BADGE */}
        {status === "live" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium shadow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {/* OVERLAY WHEN NOT LIVE */}
        {status !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <p className="text-slate-300">{renderStatus()}</p>
          </div>
        )}

      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex gap-3">

        {status !== "live" && (
          <button
            onClick={startSession}
            className="px-5 py-2 bg-emerald-500 rounded-lg font-medium hover:bg-emerald-600 transition"
          >
            Start Live
          </button>
        )}

        {status === "live" && (
          <button
            onClick={stopSession}
            className="px-5 py-2 bg-red-500 rounded-lg font-medium hover:bg-red-600 transition"
          >
            Stop
          </button>
        )}

      </div>

      {/* SHARE SECTION */}
      {sessionId && (
        <div className="mt-6 w-full max-w-2xl bg-[#0b0f14] border border-emerald-400/20 rounded-xl p-4">

          <p className="text-xs text-slate-400 mb-2">
            Share this monitoring link
          </p>

          <div className="flex gap-2">
            <input
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded text-sm"
            />

            <button
              onClick={copyLink}
              className="px-4 py-2 bg-emerald-500 rounded text-sm"
            >
              Copy
            </button>
          </div>

        </div>
      )}

    </div>
  );
}