import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);

  useEffect(() => {
    let peer;
    let call;

    const startViewer = async () => {
      try {
        // Create peer
        peer = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });

        // Dummy stream (important fix)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        peer.on("open", () => {
          call = peer.call(sessionId, stream);

          if (!call) return;

          call.on("stream", (remoteStream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream;
            }
          });

          call.on("error", (err) => {
            console.error("Call error:", err);
          });
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
        });

      } catch (err) {
        console.error("Viewer error:", err);
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
        controls
        className="w-full max-w-4xl rounded-lg"
      />

    </div>
  );
}