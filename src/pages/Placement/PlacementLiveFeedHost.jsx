import { useRef, useState } from "react";
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
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [isLive, setIsLive] = useState(false);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = media;
      videoRef.current.srcObject = media;

      const peer = new Peer({
        config: ICE_CONFIG,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Host Peer ID:", id);
        setSessionId(id);
        setIsLive(true);
      });

      /* 🔥 VERY IMPORTANT PART */
      peer.on("call", (call) => {
        console.log("Incoming viewer connection");

        if (!streamRef.current) {
          console.error("No stream available");
          return;
        }

        call.answer(streamRef.current);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });

    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  /* ================= STOP SESSION ================= */

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    setSessionId(null);
    setIsLive(false);
  };

  const shareLink = sessionId
    ? `${window.location.origin}/trainer/live/${sessionId}`
    : "";

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl">

      <h2 className="text-xl mb-4 font-semibold text-emerald-400">
        Trainer Live Session
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-2xl rounded-lg border border-emerald-400/30"
      />

      <div className="mt-4 flex gap-3">

        {!isLive && (
          <button
            onClick={startSession}
            className="px-5 py-2 bg-emerald-500 rounded"
          >
            Start Session
          </button>
        )}

        {isLive && (
          <button
            onClick={stopSession}
            className="px-5 py-2 bg-red-500 rounded"
          >
            Stop
          </button>
        )}

      </div>

      {sessionId && (
        <div className="mt-5 p-3 bg-[#020617] rounded border border-emerald-400/20">
          <p className="text-sm text-slate-400">Share Link</p>
          <p className="text-emerald-400 break-all">{shareLink}</p>
        </div>
      )}

    </div>
  );
}