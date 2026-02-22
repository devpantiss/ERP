import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

/* ================= ICE SERVERS ================= */

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },

    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();

  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const callRef = useRef(null);

  const [status, setStatus] = useState("connecting");

  /* ================= CONNECT ================= */

  useEffect(() => {
    if (!sessionId) return;

    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
      config: ICE_CONFIG,
    });

    peerRef.current = peer;

    peer.on("open", () => {
      console.log("Viewer peer ready");

      const call = peer.call(sessionId, new MediaStream());

      if (!call) {
        setStatus("trainer_offline");
        return;
      }

      callRef.current = call;

      call.on("stream", async (remoteStream) => {
        console.log("Remote stream received");

        if (!videoRef.current) return;

        videoRef.current.srcObject = remoteStream;

        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("Autoplay blocked:", err);
        }

        setStatus("live");
      });

      call.on("close", () => {
        setStatus("ended");
      });

      call.on("error", (err) => {
        console.error(err);
        setStatus("error");
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      setStatus("error");
    });

    return () => {
      callRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [sessionId]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">

      <h1 className="text-white text-xl font-semibold mb-4">
        Live Session Monitor
      </h1>

      <p className="text-slate-400 text-sm mb-4">
        Session ID: {sessionId}
      </p>

      <div className="relative w-full max-w-5xl">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full rounded-xl bg-black border border-white/10"
        />

        {status !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
            <p className="text-slate-300">
              {status === "connecting" && "Connecting to trainer..."}
              {status === "trainer_offline" && "Trainer not live yet"}
              {status === "ended" && "Session ended"}
              {status === "error" && "Connection error"}
            </p>
          </div>
        )}

        {status === "live" && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs rounded-full">
            LIVE
          </div>
        )}

      </div>

    </div>
  );
}