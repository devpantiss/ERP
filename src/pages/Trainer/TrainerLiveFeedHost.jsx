import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function TrainerLiveHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const startSession = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    const peer = new Peer(); // uses free PeerJS server
    peerRef.current = peer;

    peer.on("open", (id) => {
      setSessionId(id);
      setIsLive(true);
    });

    peer.on("call", (call) => {
      call.answer(stream);
    });
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    setIsLive(false);
    setSessionId(null);
  };

  const shareLink = `${window.location.origin}/live/${sessionId}`;

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl">

      <h2 className="text-xl font-semibold text-emerald-400 mb-4">
        Trainer Live Session
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-xl rounded-lg border border-emerald-400/30"
      />

      <div className="mt-4 flex gap-3">

        {!isLive && (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-emerald-500 rounded"
          >
            Start Live
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
          <p className="text-sm text-slate-400">Share this link</p>
          <p className="text-emerald-400 break-all">{shareLink}</p>
        </div>
      )}

    </div>
  );
}