import { useRef, useState } from "react";
import Peer from "peerjs";

export default function TrainerLiveHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    try {
      setLoading(true);

      // Get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Create peer
      const peer = new Peer({
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        setSessionId(id);
        setIsLive(true);
        setLoading(false);
      });

      // Answer incoming calls
      peer.on("call", (call) => {
        if (streamRef.current) {
          call.answer(streamRef.current);
        }
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });
    } catch (err) {
      console.error("Camera error:", err);
      setLoading(false);
    }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();

    setIsLive(false);
    setSessionId(null);
  };

  const shareLink = sessionId
    ? `${window.location.origin}/trainer/live/${sessionId}`
    : "";

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-emerald-400 mb-4">
        Trainer Live Session
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg border border-emerald-400/30"
      />

      <div className="mt-4 flex gap-3">
        {!isLive && (
          <button
            onClick={startSession}
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            {loading ? "Starting..." : "Start Live"}
          </button>
        )}

        {isLive && (
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
          <p className="text-sm text-slate-400 mb-1">Share this link</p>
          <p className="text-emerald-400 break-all">{shareLink}</p>
        </div>
      )}
    </div>
  );
}
