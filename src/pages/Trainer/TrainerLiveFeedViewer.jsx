import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    let peer;
    let call;

    const startViewer = async () => {
      try {
        setStatus("Connecting to trainer...");

        peer = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });

        peer.on("open", () => {
          console.log("Viewer peer open");

          // 🔥 IMPORTANT: send empty stream instead of mic request
          const emptyStream = new MediaStream();

          call = peer.call(sessionId, emptyStream);

          if (!call) {
            setStatus("Trainer not available");
            return;
          }

          call.on("stream", (remoteStream) => {
            console.log("Received stream");

            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream;
            }

            setStatus("Live");
          });

          call.on("error", (err) => {
            console.error("Call error:", err);
            setStatus("Connection error");
          });
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          setStatus("Peer error");
        });

      } catch (err) {
        console.error("Viewer error:", err);
        setStatus("Error starting viewer");
      }
    };

    startViewer();

    return () => {
      call?.close();
      peer?.destroy();
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">

      <h2 className="text-white mb-4">
        Live Session
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted   // helps autoplay on browsers
        controls
        className="w-full max-w-4xl rounded-lg bg-black"
      />

      <p className="text-slate-400 mt-4">{status}</p>

    </div>
  );
}