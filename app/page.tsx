"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatsBar from "@/components/StatsBar";
import ResultModal from "@/components/ResultModal";
import { useAppData } from "@/lib/useAppData";
import { totalAreaKm2 } from "@/lib/territory";
import { useTranslation } from "@/lib/useTranslation";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const REVEAL_INTERVAL_MS = 180;

type PickingMode = "initial" | "newIsland" | null;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, landChecker, pickStartCell, completeFocusSession, claimNewIsland } =
    useAppData();
  const t = useTranslation(data);

  const [newCellIds, setNewCellIds] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"session" | "newIsland">("session");
  const [leftoverCells, setLeftoverCells] = useState(0);

  const [pickingMode, setPickingMode] = useState<PickingMode>(null);
  const [pendingPick, setPendingPick] = useState<{ lat: number; lng: number } | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const processedRef = useRef(false);

  useEffect(() => {
    if (data && data.ownedCells.length === 0 && pickingMode === null) {
      setPickingMode("initial");
    }
  }, [data, pickingMode]);

  useEffect(() => {
    const completed = searchParams.get("completed");
    if (!completed || processedRef.current || !data || !landChecker) return;
    processedRef.current = true;

    const minutes = Number(completed);
    const result = completeFocusSession(minutes);

    setSessionMinutes(minutes);
    setNewCellIds(result.newCellIds);
    setLeftoverCells(result.leftoverCells);
    setRevealedCount(0);
    setModalKind("session");
    setModalOpen(true);
    router.replace("/");
  }, [searchParams, data, landChecker, completeFocusSession, router]);

  useEffect(() => {
    if (!modalOpen || revealedCount >= newCellIds.length) return;
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), REVEAL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [modalOpen, revealedCount, newCellIds.length]);

  if (!data) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  const allOwnedIds = data.ownedCells.map((c) => c.cellId);
  const revealingIds = new Set(newCellIds.slice(0, revealedCount));
  const displayedIds = modalOpen
    ? allOwnedIds.filter((id) => !newCellIds.includes(id) || revealingIds.has(id))
    : allOwnedIds;

  const revealing = modalOpen && revealedCount < newCellIds.length;
  const exhausted = modalKind === "session" && leftoverCells > 0;

  function handleMapClick(lat: number, lng: number) {
    if (!pickingMode) return;
    setPickError(null);
    setPendingPick({ lat, lng });
  }

  function handleConfirmPick() {
    if (!pendingPick) return;
    if (landChecker && !landChecker.isLand(pendingPick.lat, pendingPick.lng)) {
      setPickError(t("seaError"));
      return;
    }

    if (pickingMode === "initial") {
      pickStartCell(pendingPick.lat, pendingPick.lng);
      setPickingMode(null);
      setPendingPick(null);
      setPickError(null);
      return;
    }

    if (pickingMode === "newIsland") {
      const claimed = claimNewIsland(pendingPick.lat, pendingPick.lng, leftoverCells);
      setPickingMode(null);
      setPendingPick(null);
      setPickError(null);
      if (claimed.length > 0) {
        setNewCellIds(claimed);
        setRevealedCount(0);
        setModalKind("newIsland");
        setModalOpen(true);
      }
    }
  }

  function handleCancelPick() {
    setPendingPick(null);
    setPickError(null);
  }

  function handleModalClose() {
    if (exhausted) {
      setModalOpen(false);
      setPickingMode("newIsland");
      return;
    }
    setModalOpen(false);
  }

  return (
    <div className="relative flex h-dvh flex-col">
      <div className="relative flex-1">
        <MapView
          ownedCellIds={displayedIds}
          color={data.settings.color}
          onMapClick={pickingMode ? handleMapClick : undefined}
          pendingPoint={pendingPick}
        />
        {pickingMode === "initial" && !pendingPick && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow">
            {t("pickInitialPrompt")}
          </div>
        )}
        {pickingMode === "newIsland" && !pendingPick && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow">
            {t("pickNewIslandPrompt")}
          </div>
        )}
        {pendingPick && (
          <div className="absolute bottom-6 left-1/2 z-[500] flex w-[90%] max-w-sm -translate-x-1/2 flex-col gap-2 rounded-2xl bg-white p-4 shadow-lg">
            {pickError && <p className="text-center text-sm text-red-600">{pickError}</p>}
            <p className="text-center text-sm text-gray-600">{t("confirmPickQuestion")}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelPick}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmPick}
                className="flex-1 rounded-full bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                {t("confirmButton")}
              </button>
            </div>
          </div>
        )}
        {!pickingMode && data.ownedCells.length > 0 && (
          <Link
            href="/focus"
            className="absolute bottom-6 right-6 z-[500] rounded-full bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg active:scale-95"
          >
            {t("startFocusButton")}
          </Link>
        )}
        {!pickingMode && (
          <Link
            href="/settings"
            className="absolute top-4 right-4 z-[500] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow"
            aria-label={t("settingsAria")}
          >
            ⚙️
          </Link>
        )}
      </div>
      <StatsBar
        areaKm2={totalAreaKm2(allOwnedIds)}
        totalFocusMinutes={data.totalFocusMinutes}
        t={t}
      />
      {modalOpen && (
        <ResultModal
          headline={
            modalKind === "session"
              ? t("headlineSession", { minutes: sessionMinutes })
              : t("headlineNewIsland")
          }
          cellsEarnedText={t("cellsEarned", { count: newCellIds.length })}
          cellsEarnedNote={t("cellsEarnedNote")}
          revealing={revealing}
          revealingLabel={t("revealingLabel")}
          closeLabel={exhausted ? t("closeNewIsland") : t("closeMap")}
          exhaustedNote={exhausted ? t("exhaustedNote") : undefined}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
