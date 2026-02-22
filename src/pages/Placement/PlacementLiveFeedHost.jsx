import { useRef, useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Copy,
  Users,
} from "lucide-react";

export default function TrainerLiveHostMeet() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [link, setLink] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [viewers, setViewers] = useState(0);

  /* ================= START SESSION ================= */

  const startSession = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setViewers((v) => v + 1);
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const encoded = btoa(JSON.stringify(offer));

    const sessionLink =
      window.location.origin + "/trainer/live?offer=" + encoded;

    setLink(sessionLink);
    pcRef.current = pc;
    setStarted(true);

    window.addEventListener("message", async (e) => {
      if (e.data?.answer) {
        const answer = JSON.parse(atob(e.data.answer));
        await pc.setRemoteDescription(answer);
      }
    });
  };

  /* ================= CONTROLS ================= */

  const toggleMic = () => {
    const track = videoRef.current.srcObject.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = videoRef.current.srcObject.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  const endSession = () => {
    videoRef.current.srcObject
      ?.getTracks()
      .forEach((t) => t.stop());

    pcRef.current?.close();

    setStarted(false);
    setViewers(0);
    setLink("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    alert("Link copied");
  };

  return (
    <div className="h-screen bg-[#0b0f14] text-white flex flex-col">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3">
          <Video size={18} className="text-emerald-400" />
          <span className="font-medium">Trainer Live Session</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Users size={16} />
            {viewers}
          </div>

          {link && (
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
            >
              <Copy size={14} />
              Copy Link
            </button>
          )}
        </div>
      </div>

      {/* VIDEO AREA */}
      <div className="flex-1 flex items-center justify-center p-6">

        <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {!started && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <button
                onClick={startSession}
                className="px-6 py-3 bg-emerald-500 rounded-lg text-white font-semibold hover:bg-emerald-400"
              >
                Start Live Session
              </button>
            </div>
          )}
        </div>

      </div>

      {/* CONTROLS */}
      {started && (
        <div className="flex justify-center pb-6">

          <div className="flex items-center gap-4 bg-black/50 backdrop-blur px-6 py-3 rounded-full border border-white/10 shadow-xl">

            <button
              onClick={toggleMic}
              className={`p-3 rounded-full ${
                micOn ? "bg-white/10" : "bg-red-600"
              }`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={toggleCam}
              className={`p-3 rounded-full ${
                camOn ? "bg-white/10" : "bg-red-600"
              }`}
            >
              {camOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              onClick={endSession}
              className="p-3 rounded-full bg-red-600 hover:bg-red-500"
            >
              <PhoneOff size={18} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}