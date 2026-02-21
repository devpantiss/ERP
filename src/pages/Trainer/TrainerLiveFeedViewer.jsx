import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function TrainerLiveViewer() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const callRef = useRef(null);

  const [status, setStatus] = useState("initializing");
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /* ================= CONNECTION ================= */

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const connect = () => {
      try {
        setStatus("connecting");

        const peer = new Peer({
          config: ICE_CONFIG,
          debug: 2,
        });

        peerRef.current = peer;

        peer.on("open", () => {
          if (!isMounted) return;

          console.log("Viewer peer ready");

          const emptyStream = new MediaStream();

          const call = peer.call(sessionId, emptyStream);

          if (!call) {
            setStatus("trainer_offline");
            return;
          }

          callRef.current = call;

          call.on("stream", (remoteStream) => {
            console.log("Remote stream received");

            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream;
            }

            setStatus("live");
          });

          call.on("close", () => {
            console.log("Call closed");
            setStatus("ended");
          });

          call.on("error", (err) => {
            console.error("Call error", err);
            setError("Connection failed");
            setStatus("error");
          });
        });

        peer.on("error", (err) => {
          console.error("Peer error", err);
          setError(err.message);
          setStatus("error");
        });

        peer.on("disconnected", () => {
          console.log("Peer disconnected");
          setStatus("reconnecting");
        });

      } catch (err) {
        console.error(err);
        setError("Unexpected error");
        setStatus("error");
      }
    };

    connect();

    return () => {
      isMounted = false;
      callRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [sessionId, retryCount]);

  /* ================= RETRY ================= */

  const retry = () => {
    setRetryCount((r) => r + 1);
    setError(null);
  };

  /* ================= STATUS UI ================= */

  const renderStatus = () => {
    switch (status) {
      case "connecting":
        return "Connecting to trainer...";
      case "trainer_offline":
        return "Trainer not live yet";
      case "reconnecting":
        return "Reconnecting...";
      case "live":
        return "Live";
      case "ended":
        return "Session ended";
      case "error":
        return error || "Connection error";
      default:
        return "Initializing...";
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">

      {/* HEADER */}
      <div className="mb-6 text-center">
        <h1 className="text-white text-xl font-semibold">
          Live Session Monitor
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Session ID: {sessionId}
        </p>
      </div>

      {/* VIDEO CONTAINER */}
      <div className="relative w-full max-w-5xl">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls
          className="w-full rounded-xl bg-black border border-white/10"
        />

        {/* LIVE BADGE */}
        {status === "live" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-medium shadow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {/* OVERLAY */}
        {status !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">

            <div className="text-center space-y-3">

              <p className="text-slate-300">{renderStatus()}</p>

              {status === "trainer_offline" && (
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-emerald-500 rounded text-white text-sm"
                >
                  Retry
                </button>
              )}

              {status === "error" && (
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-yellow-500 rounded text-black text-sm"
                >
                  Try Again
                </button>
              )}

            </div>

          </div>
        )}

      </div>

      {/* FOOTER INFO */}
      <div className="mt-6 text-slate-500 text-xs text-center max-w-md">
        Ensure trainer has started the session and granted camera permissions.
      </div>

    </div>
  );
}