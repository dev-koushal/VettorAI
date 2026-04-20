import React, { useEffect, useRef, useState } from "react";
import { FcVideoCall } from "react-icons/fc";

function CameraPreview({ isCameraOn }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraBlocked, setCameraBlocked] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraBlocked(true);
      }
    }

    if (isCameraOn) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  return (
    <div className="w-full h-[160px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {isCameraOn && !cameraBlocked ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <FcVideoCall size={40} />
          <p className="text-xs">
            {cameraBlocked ? "Camera blocked" : "Camera off"}
          </p>
        </div>
      )}
    </div>
  );
}

export default CameraPreview;