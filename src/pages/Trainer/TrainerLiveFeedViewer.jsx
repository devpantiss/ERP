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
  const peerRef = useRef(null);

  const [status, setStatus] = useState("connecting");

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
      const call = peer.call(sessionId, new MediaStream());

      call.on("stream", async (remoteStream) => {
        videoRef.current.srcObject = remoteStream;
        await videoRef.current.play();
        setStatus("live");
      });

      call.on("close", () => setStatus("ended"));
    });

    return () => peer.destroy();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">

      <div className="w-full max-w-5xl relative">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full rounded-xl bg-black"
        />

        {status !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-white">Connecting to trainer...</p>
          </div>
        )}

      </div>

    </div>
  );
}