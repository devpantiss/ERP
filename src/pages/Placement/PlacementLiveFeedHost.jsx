import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function TrainerLiveFeedHost() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [time, setTime] = useState(new Date());
  const [gps, setGps] = useState(null);

  /* ================= CLOCK ================= */

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  /* ================= GPS ================= */

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setGps({
        lat: pos.coords.latitude.toFixed(5),
        lng: pos.coords.longitude.toFixed(5),
      });
    });
  }, []);

  /* ================= WATERMARK LOOP ================= */

  const startWatermarkLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!video.videoWidth) return requestAnimationFrame(draw);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(20, canvas.height - 110, 340, 90);

      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";

      ctx.fillText(`Place: ${placeName || "N/A"}`, 30, canvas.height - 70);

      if (gps)
        ctx.fillText(
          `GPS: ${gps.lat}, ${gps.lng}`,
          30,
          canvas.height - 45
        );

      ctx.fillText(
        `Time: ${new Date().toLocaleString()}`,
        30,
        canvas.height - 20
      );

      requestAnimationFrame(draw);
    };

    draw();
  };

  /* ================= START SESSION ================= */

  const startSession = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });

    streamRef.current = media;

    videoRef.current.srcObject = media;

    startWatermarkLoop();

    const canvasStream = canvasRef.current.captureStream(25);

    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
      config: ICE_CONFIG,
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      setSessionId(id);
      setStarted(true);
      console.log("Host ID:", id);
    });

    peer.on("call", (call) => {
      console.log("Viewer connected");

      call.answer(canvasStream);

      setViewerCount((c) => c + 1);

      call.on("close", () =>
        setViewerCount((c) => Math.max(0, c - 1))
      );
    });
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    setStarted(false);
    setSessionId(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl font-semibold text-emerald-400 mb-6">
          Trainer Live Monitoring Console
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* VIDEO PANEL */}
          <div className="lg:col-span-2 bg-black rounded-xl p-4 border border-white/10">

            <div className="relative">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full rounded-lg"
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />

              {started && (
                <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-xs">
                  ● LIVE • {viewerCount} viewers
                </div>
              )}
            </div>
          </div>

          {/* CONTROL PANEL */}
          <div className="bg-[#0b1220] rounded-xl p-5 border border-white/10 space-y-4">

            <input
              placeholder="Enter Place Name"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black border border-white/10"
            />

            {!started && (
              <button
                onClick={startSession}
                className="w-full py-2 bg-emerald-500 rounded font-semibold"
              >
                Start Session
              </button>
            )}

            {started && (
              <button
                onClick={stopSession}
                className="w-full py-2 bg-red-500 rounded font-semibold"
              >
                Stop Session
              </button>
            )}

            {sessionId && (
              <div className="text-sm break-all bg-black p-3 rounded border border-white/10">
                {window.location.origin}/trainer/live/{sessionId}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}