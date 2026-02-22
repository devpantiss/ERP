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
  const [stream, setStream] = useState(null);

  const startSession = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = media;
      videoRef.current.srcObject = media;
      setStream(media);

      // 🔥 Create Peer (IMPORTANT)
      const peer = new Peer({
        config: ICE_CONFIG,
      });

      peerRef.current = peer;

      // 🔥 Get Peer ID
      peer.on("open", (id) => {
        console.log("Peer ID:", id);
        setSessionId(id);
      });

      // 🔥 Answer Viewer Calls
      peer.on("call", (call) => {
        console.log("Incoming viewer");

        if (streamRef.current) {
          call.answer(streamRef.current);
        }
      });

      peer.on("error", (err) => {
        console.error(err);
      });

    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    setStream(null);
    setSessionId(null);
  };

  const shareLink = sessionId
    ? `${window.location.origin}/trainer/live/${sessionId}`
    : "";

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

        {!stream && (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            Start Session
          </button>
        )}

        {stream && (
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
          <p className="text-emerald-400 break-all">{shareLink}</p>
        </div>
      )}

    </div>
  );
}