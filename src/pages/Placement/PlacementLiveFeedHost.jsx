import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted] = useState(false);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = media;
      setStream(media);

      const peer = new Peer(undefined, {
        config: ICE_CONFIG,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Host Peer ID:", id);
        setSessionId(id);
        setStarted(true);
      });

      /* ===== VERY IMPORTANT PART ===== */
      peer.on("call", (call) => {
        console.log("Incoming viewer connection");

        call.answer(media); // 🔥 SEND STREAM TO VIEWER
      });

    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera permission denied");
    }
  };

  /* ================= STOP ================= */

  const stopSession = () => {
    stream?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    setStream(null);
    setSessionId(null);
    setStarted(false);
  };

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
      stream?.getTracks().forEach((t) => t.stop());
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
        className="w-full max-w-xl rounded-lg border border-emerald-400/30"
      />

      <div className="mt-4 flex gap-3">

        {!started && (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            Start Session
          </button>
        )}

        {started && (
          <button
            onClick={stopSession}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Stop
          </button>
        )}

      </div>

      {sessionId && (
        <div className="mt-4 p-3 bg-[#020617] rounded border border-emerald-400/20">
          <p className="text-sm text-slate-400">Share Link</p>

          <p className="text-emerald-400 break-all">
            {window.location.origin}/trainer/live/{sessionId}
          </p>
        </div>
      )}

    </div>
  );
}