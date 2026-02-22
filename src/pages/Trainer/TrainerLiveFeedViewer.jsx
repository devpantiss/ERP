import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);

  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
      config: ICE_CONFIG,
    });

    peer.on("open", () => {
      console.log("Viewer ready");

      const call = peer.call(sessionId, new MediaStream());

      call.on("stream", async (stream) => {
        console.log("Stream received");

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setStatus("live");
      });

      call.on("close", () => setStatus("ended"));
    });

    return () => peer.destroy();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-5xl bg-black rounded-xl border border-white/10 p-4">

        <div className="flex justify-between mb-3 text-sm text-slate-400">
          <span>Live Session Monitor</span>
          <span>ID: {sessionId}</span>
        </div>

        <div className="relative">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            className="w-full rounded-lg"
          />

          {status !== "live" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <p className="text-white">
                {status === "connecting"
                  ? "Connecting to trainer..."
                  : "Session ended"}
              </p>
            </div>
          )}

          {status === "live" && (
            <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full text-xs">
              ● LIVE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}