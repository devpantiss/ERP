import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

export default function TrainerLiveFeedViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", () => {
      const call = peer.call(sessionId, null);

      call.on("stream", (remoteStream) => {
        videoRef.current.srcObject = remoteStream;
      });
    });

    return () => peer.destroy();
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
        className="w-full max-w-4xl rounded-lg"
      />

    </div>
  );
}