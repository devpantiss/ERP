import { useRef, useState } from "react";
import Peer from "peerjs";

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted] = useState(false);

  const startSession = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = media;
      videoRef.current.srcObject = media;

      const peer = new Peer(undefined, {
        host: "peerjs.com",
        secure: true,
        port: 443,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Host Peer ID:", id);
        setSessionId(id);
        setStarted(true);
      });

      peer.on("call", (call) => {
        console.log("Incoming call");

        if (!streamRef.current) return;

        call.answer(streamRef.current);
      });

    } catch (err) {
      console.error(err);
      alert("Camera permission required");
    }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    setStarted(false);
    setSessionId(null);
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl mb-4">Trainer Live Feed</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-xl rounded"
      />

      <div className="mt-4">
        {!started ? (
          <button
            onClick={startSession}
            className="px-4 py-2 bg-green-500 rounded"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Stop
          </button>
        )}
      </div>

      {sessionId && (
        <div className="mt-4">
          Share:
          <div className="text-green-400 break-all">
            {window.location.origin}/trainer/live/{sessionId}
          </div>
        </div>
      )}
    </div>
  );
}