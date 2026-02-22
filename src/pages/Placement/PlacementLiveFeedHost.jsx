import { useRef, useState } from "react";
import Peer from "peerjs";

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const peerRef = useRef(null);
  const capturedStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted] = useState(false);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      cameraStreamRef.current = cameraStream;

      const video = videoRef.current;
      video.srcObject = cameraStream;

      await video.play();

      await new Promise((res) => {
        if (video.readyState >= 2) res();
        else video.onloadedmetadata = res;
      });

      // Canvas overlay
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const draw = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(20, canvas.height - 60, 320, 40);

        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.fillText(
          `Live • ${new Date().toLocaleTimeString()}`,
          30,
          canvas.height - 30
        );

        requestAnimationFrame(draw);
      };

      draw();

      const canvasStream = canvas.captureStream(25);
      capturedStreamRef.current = canvasStream;

      // Peer
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
      });

      peer.on("call", (call) => {
        console.log("Incoming viewer connection");

        call.answer(capturedStreamRef.current);

        call.on("close", () => console.log("Viewer disconnected"));
      });
    } catch (err) {
      console.error(err);
      alert("Camera permission required");
    }
  };

  const stopSession = () => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    setStarted(false);
    setSessionId(null);
  };

  return (
    <div className="p-6 text-white">

      <h2 className="text-xl mb-4">Trainer Live Feed</h2>

      <div className="relative w-full max-w-xl">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded"
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="mt-4 flex gap-3">
        {!started ? (
          <button onClick={startSession} className="bg-green-500 px-4 py-2 rounded">
            Start Session
          </button>
        ) : (
          <button onClick={stopSession} className="bg-red-500 px-4 py-2 rounded">
            Stop
          </button>
        )}
      </div>

      {sessionId && (
        <div className="mt-4">
          Share Link:
          <div className="text-green-400 break-all">
            {window.location.origin}/trainer/live/{sessionId}
          </div>
        </div>
      )}
    </div>
  );
}