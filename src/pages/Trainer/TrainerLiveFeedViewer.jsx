import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();

  const videoRef = useRef(null);
  const peerRef = useRef(null);

  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!sessionId) return;

    const peer = new Peer(undefined, {
      host: "peerjs.com",
      secure: true,
      port: 443,
    });

    peerRef.current = peer;

    peer.on("open", () => {
      console.log("Viewer ready");

      const call = peer.call(sessionId, new MediaStream());

      if (!call) {
        setStatus("offline");
        return;
      }

      call.on("stream", async (remoteStream) => {
        console.log("Stream received");

        videoRef.current.srcObject = remoteStream;

        try {
          await videoRef.current.play();
        } catch {}

        setStatus("live");
      });
    });

    return () => peer.destroy();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

      <h1 className="mb-4">Live Session</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        className="w-full max-w-4xl rounded"
      />

      {status !== "live" && (
        <p className="mt-4 text-slate-400">
          Connecting to trainer...
        </p>
      )}
    </div>
  );
}