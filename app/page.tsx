"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatsBar from "@/components/StatsBar";
import ResultModal from "@/components/ResultModal";
import { useAppData } from "@/lib/useAppData";
import { totalAreaKm2 } from "@/lib/territory";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const REVEAL_INTERVAL_MS = 180;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, landChecker, pickStartCell, completeFocusSession } = useAppData();

  const [newCellIds, setNewCellIds] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    const completed = searchParams.get("completed");
    if (!completed || processedRef.current || !data || !landChecker) return;
    processedRef.current = true;

    const minutes = Number(completed);
    const earned = completeFocusSession(minutes);

    setSessionMinutes(minutes);
    setNewCellIds(earned);
    setRevealedCount(0);
    setModalOpen(true);
    router.replace("/");
  }, [searchParams, data, landChecker, completeFocusSession, router]);

  useEffect(() => {
    if (!modalOpen || revealedCount >= newCellIds.length) return;
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), REVEAL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [modalOpen, revealedCount, newCellIds.length]);

  if (!data) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">読み込み中...</div>;
  }

  const allOwnedIds = data.ownedCells.map((c) => c.cellId);
  const revealingIds = new Set(newCellIds.slice(0, revealedCount));
  const displayedIds = modalOpen
    ? allOwnedIds.filter((id) => !newCellIds.includes(id) || revealingIds.has(id))
    : allOwnedIds;

  const revealing = modalOpen && revealedCount < newCellIds.length;

  return (
    <div className="relative flex h-dvh flex-col">
      <div className="relative flex-1">
        <MapView
          ownedCellIds={displayedIds}
          color={data.settings.color}
          onMapClick={
            !data.startCell ? (lat, lng) => pickStartCell(lat, lng) : undefined
          }
        />
        {!data.startCell && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-700 shadow">
            地図をタップして起点となる場所を選んでください
          </div>
        )}
        {data.startCell && (
          <Link
            href="/focus"
            className="absolute bottom-6 right-6 z-[500] rounded-full bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg active:scale-95"
          >
            集中スタート
          </Link>
        )}
      </div>
      <StatsBar
        areaKm2={totalAreaKm2(allOwnedIds)}
        totalFocusMinutes={data.totalFocusMinutes}
      />
      {modalOpen && (
        <ResultModal
          durationMinutes={sessionMinutes}
          cellsEarned={newCellIds.length}
          revealing={revealing}
          onClose={() => setModalOpen(false)}
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
