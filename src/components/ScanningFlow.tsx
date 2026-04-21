"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2 } from "lucide-react";

type QualityLevel = "poor" | "fair" | "good";

/**
 * CHALLENGE: SCAN ENHANCEMENT
 * 
 * Your goal is to improve the User Experience of the Scanning Flow.
 * 1. Implement a Visual Guidance Overlay (e.g., a circle or mouth outline) on the video feed.
 * 2. Add real-time feedback to the user (e.g., "Face not centered", "Move closer").
 * 3. Ensure the UI feels premium and responsive.
 */

export default function ScanningFlow() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camReady, setCamReady] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>("fair");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const VIEWS = [
    { label: "Front View", instruction: "Smile and look straight at the camera." },
    { label: "Left View", instruction: "Turn your head to the left." },
    { label: "Right View", instruction: "Turn your head to the right." },
    { label: "Upper Teeth", instruction: "Tilt your head back and open wide." },
    { label: "Lower Teeth", instruction: "Tilt your head down and open wide." },
  ];

  // Initialize Camera
  useEffect(() => {
    async function startCamera() {
      try {
        // Request camera access with specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setCamReady(true);
              setCameraError(null);
            }).catch((err) => {
              console.error("Video play error:", err);
              setCameraError("Failed to start video. Please refresh the page.");
            });
          };
        }
      } catch (err: any) {
        console.error("Camera access error:", err);

        // Provide user-friendly error messages
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera access denied. Please allow camera permissions in your browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera found. Please connect a camera and refresh.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError("Camera is already in use by another application.");
        } else {
          setCameraError("Failed to access camera. Please check permissions and try again.");
        }
      }
    }
    startCamera();
  }, []);

  // Real-time quality analysis - measures image sharpness and brightness
  useEffect(() => {
    if (!camReady || currentStep >= 5) return;

    const intervalId = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      setIsAnalyzing(true);

      // Create offscreen canvas for analysis
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Sample a small region for performance
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(video, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;

      // Calculate average brightness
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      brightness = brightness / (data.length / 4);

      // Calculate variance (proxy for sharpness/stability)
      let variance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        variance += Math.pow(gray - brightness, 2);
      }
      variance = variance / (data.length / 4);

      // Quality determination based on brightness and variance
      const brightnessOk = brightness > 60 && brightness < 200;
      const sharpnessScore = Math.sqrt(variance);

      let quality: QualityLevel = "poor";
      if (brightnessOk && sharpnessScore > 30) {
        quality = "good";
      } else if (brightnessOk || sharpnessScore > 20) {
        quality = "fair";
      }

      setQualityLevel(quality);
      setIsAnalyzing(false);
    }, 300); // Check every 300ms to avoid performance issues

    return () => clearInterval(intervalId);
  }, [camReady, currentStep]);

  const handleCapture = useCallback(() => {
    // Boilerplate logic for capturing a frame from the video feed
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImages((prev) => [...prev, dataUrl]);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Trigger notification when all scans are complete
      if (nextStep === 5) {
        handleScanComplete();
      }
    }
  }, [currentStep]);

  const handleScanComplete = async () => {
    try {
      // In production, this would use a real scan ID from the database
      const scanId = `scan-${Date.now()}`;
      const userId = "demo-user-123";

      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          userId,
          status: "completed",
        }),
      });

      if (response.ok) {
        console.log("✓ Scan completion notification sent");
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <div className="flex flex-col items-center bg-black min-h-screen text-white">
      {/* Header */}
      <div className="p-4 w-full bg-zinc-900 border-b border-zinc-800 flex justify-between">
        <h1 className="font-bold text-blue-400">DentalScan AI</h1>
        <span className="text-xs text-zinc-500">Step {currentStep + 1}/5</span>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-zinc-950 overflow-hidden flex items-center justify-center">
        {currentStep < 5 ? (
          <>
            {/* Camera Error Display */}
            {cameraError && (
              <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
                <div className="text-center">
                  <Camera size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
                  <p className="text-red-400 mb-4">{cameraError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {!camReady && !cameraError && (
              <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="text-blue-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-white font-medium">Initializing camera...</p>
                  <p className="text-zinc-400 text-sm mt-2">Please allow camera access if prompted</p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover grayscale opacity-80"
            />
            
            {/* Visual Guidance Circle with Quality Indicator */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Guidance Circle */}
              <div
                className={`
                  relative w-64 h-80 rounded-full border-4 transition-all duration-300
                  ${qualityLevel === 'good' ? 'border-green-500 shadow-lg shadow-green-500/50' : ''}
                  ${qualityLevel === 'fair' ? 'border-amber-400 shadow-lg shadow-amber-400/30' : ''}
                  ${qualityLevel === 'poor' ? 'border-red-500 shadow-lg shadow-red-500/30' : ''}
                `}
                style={{
                  background: qualityLevel === 'good'
                    ? 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)'
                    : qualityLevel === 'fair'
                    ? 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)'
                }}
              >
                {/* Corner markers for alignment */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-1 bg-white/40 rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-8 h-1 bg-white/40 rounded-full" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-8 w-1 bg-white/40 rounded-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-8 w-1 bg-white/40 rounded-full" />

                {/* Center instruction text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`
                      text-xs font-bold uppercase tracking-wider mb-1 transition-colors
                      ${qualityLevel === 'good' ? 'text-green-400' : ''}
                      ${qualityLevel === 'fair' ? 'text-amber-300' : ''}
                      ${qualityLevel === 'poor' ? 'text-red-400' : ''}
                    `}>
                      {qualityLevel === 'good' && '✓ Ready'}
                      {qualityLevel === 'fair' && 'Adjust Position'}
                      {qualityLevel === 'poor' && 'Move Closer'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated pulse effect for good quality */}
              {qualityLevel === 'good' && (
                <div className="absolute w-64 h-80 rounded-full border-2 border-green-500 animate-ping opacity-20" />
              )}
            </div>

            {/* Hidden canvas for quality analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Instruction Overlay */}
            <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent text-center">
              <p className="text-sm font-medium">{VIEWS[currentStep].instruction}</p>
            </div>
          </>
        ) : (
          <div className="text-center p-10">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Scan Complete</h2>
            <p className="text-zinc-400 mt-2 mb-6">Your scan has been uploaded successfully!</p>
            <a
              href="/results"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              View Results
            </a>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-10 w-full flex justify-center">
        {currentStep < 5 && (
          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
               <Camera className="text-black" />
            </div>
          </button>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto w-full">
        {VIEWS.map((v, i) => (
          <div 
            key={i} 
            className={`w-16 h-20 rounded border-2 shrink-0 ${i === currentStep ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800'}`}
          >
            {capturedImages[i] ? (
               <img src={capturedImages[i]} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700">{i+1}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
