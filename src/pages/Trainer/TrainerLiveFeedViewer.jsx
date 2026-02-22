import { useEffect, useRef } from "react";

export default function TrainerLiveViewerMeet() {
  const videoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const offerEncoded = params.get("offer");

    if (!offerEncoded) return;

    const offer = JSON.parse(atob(offerEncoded));

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    const start = async () => {
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const encodedAnswer = btoa(JSON.stringify(answer));

      window.opener?.postMessage(
        { answer: encodedAnswer },
        "*"
      );
    };

    start();
  }, []);

  return (
    <div className="h-screen bg-black flex items-center justify-center">

      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium">
          LIVE
        </div>

      </div>

    </div>
  );
}