"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

type OrientationMode = "checking" | "needsPermission" | "supported" | "unsupported";

type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function getDOE(): DeviceOrientationEventStatic | undefined {
  return (typeof DeviceOrientationEvent !== "undefined"
    ? DeviceOrientationEvent
    : undefined) as DeviceOrientationEventStatic | undefined;
}

export default function FocusPage() {
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [orientationMode, setOrientationMode] = useState<OrientationMode>("checking");
  const [faceDown, setFaceDown] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sawOrientationEvent = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    async function acquireWakeLock() {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // wake lock not available right now (e.g. low battery mode); timer still works while screen stays on manually
      }
    }

    acquireWakeLock();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && wakeLockRef.current === null) {
        acquireWakeLock();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  function handleOrientation(e: DeviceOrientationEvent) {
    sawOrientationEvent.current = true;
    setOrientationMode("supported");
    const beta = e.beta ?? 0;
    setFaceDown(Math.abs(beta) > 150);
  }

  useEffect(() => {
    const DOE = getDOE();

    if (!DOE) {
      setOrientationMode("unsupported");
      return;
    }

    // iOS (Safari, Chrome, Yahoo!, etc. all use the same WebKit engine) only
    // grants sensor permission when requestPermission() is called directly
    // inside a user tap — it cannot be requested automatically on page load.
    if (typeof DOE.requestPermission === "function") {
      setOrientationMode("needsPermission");
      return;
    }

    window.addEventListener("deviceorientation", handleOrientation);
    const fallbackTimer = setTimeout(() => {
      if (!sawOrientationEvent.current) setOrientationMode("unsupported");
    }, 1500);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(fallbackTimer);
    };
  }, []);

  function handleRequestPermission() {
    const DOE = getDOE();
    if (!DOE?.requestPermission) return;

    DOE.requestPermission()
      .then((result) => {
        if (result === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          const fallbackTimer = setTimeout(() => {
            if (!sawOrientationEvent.current) setOrientationMode("unsupported");
          }, 1500);
          setTimeout(() => clearTimeout(fallbackTimer), 2000);
        } else {
          setOrientationMode("unsupported");
        }
      })
      .catch(() => setOrientationMode("unsupported"));
  }

  useEffect(() => {
    setRunning(orientationMode === "supported" && faceDown);
  }, [orientationMode, faceDown]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleFinish() {
    const minutes = Math.floor(elapsedSeconds / 60);
    router.push(`/?completed=${minutes}`);
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-8 bg-gray-900 px-6 text-white">
      <div className="text-6xl font-mono font-bold tabular-nums">
        {formatTime(elapsedSeconds)}
      </div>

      <p className="text-center text-sm text-gray-400">
        {orientationMode === "checking" && "センサーを確認中..."}
        {orientationMode === "supported" &&
          (faceDown ? "計測中：画面を伏せています" : "スマホを裏返すと計測が始まります")}
        {orientationMode === "unsupported" &&
          "このデバイスでは裏返し検知が使えません（対応スマホのブラウザで開いてください）"}
      </p>
      <p className="text-center text-xs text-gray-500">
        この画面を開いている間は自動消灯しません
      </p>

      {orientationMode === "needsPermission" && (
        <button
          onClick={handleRequestPermission}
          className="rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-gray-900"
        >
          センサーの使用を許可する
        </button>
      )}

      <button
        onClick={handleFinish}
        disabled={elapsedSeconds === 0}
        className="rounded-full bg-red-600 px-8 py-4 text-lg font-semibold disabled:opacity-40"
      >
        集中終了
      </button>
    </div>
  );
}
