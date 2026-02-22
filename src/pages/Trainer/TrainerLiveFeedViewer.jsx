import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);

  useEffect(() => {
    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
    });

    peer.on("open", () => {
      console.log("Viewer ready");

      const call = peer.call(sessionId, new MediaStream());

      call.on("stream", async (remoteStream) => {
        console.log("Stream received");

        videoRef.current.srcObject = remoteStream;

        try {
          await videoRef.current.play();
        } catch (err) {
          console.log("Autoplay blocked, user interaction needed");
        }
      });
    });

    return () => peer.destroy();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        className="w-full max-w-4xl rounded"
      />

    </div>
  );
}