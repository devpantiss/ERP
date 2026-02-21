import { useEffect, useRef, useState } from "react";

export default function PlacementLiveFeedHost() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const startSession = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoRef.current.srcObject = media;
    setStream(media);

    const id = crypto.randomUUID();
    setSessionId(id);

    // TODO: emit to socket server
  };

  const stopSession = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setSessionId(null);
  };

  return (
    <div className="p-6 bg-[#0b0f14] text-white rounded-xl">

      <h2 className="text-xl mb-4 font-semibold text-emerald-400">
        Trainer Live Feed
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
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
          <p className="text-emerald-400 break-all">
            {window.location.origin}/live/{sessionId}
          </p>
        </div>
      )}

    </div>
  );
}