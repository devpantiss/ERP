import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("idle");

  /* ================= START SESSION ================= */

  const startSession = async () => {
    try {
      setStatus("initializing");

      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = media;

      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }

      const peer = new Peer(undefined, {
        host: "0.peerjs.com",
        port: 443,
        secure: true,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Host Peer ID:", id);
        setSessionId(id);
        setStarted(true);
        setStatus("live");
      });

      /* ===== VERY IMPORTANT ===== */
      peer.on("call", (call) => {
        console.log("Incoming viewer connection");

        if (!streamRef.current) return;

        call.answer(streamRef.current);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        setStatus("error");
      });

    } catch (err) {
      console.error(err);
      alert("Camera/Microphone permission required");
      setStatus("error");
    }
  };

  /* ================= STOP ================= */

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    streamRef.current = null;
    setStarted(false);
    setSessionId(null);
    setStatus("idle");
  };

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl">

      <h2 className="text-xl mb-4 font-semibold text-emerald-400">
        Trainer Live Feed
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-xl rounded-lg border border-emerald-400/30 bg-black"
      />

      <div className="mt-4 flex gap-3">

        {!started ? (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Stop Session
          </button>
        )}

      </div>

      {sessionId && (
        <div className="mt-4 p-3 bg-[#020617] rounded border border-emerald-400/20">
          <p className="text-sm text-slate-400 mb-1">Share Link</p>

          <p className="text-emerald-400 break-all">
            {window.location.origin}/trainer/live/{sessionId}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Status: {status}
      </p>

    </div>
  );
}