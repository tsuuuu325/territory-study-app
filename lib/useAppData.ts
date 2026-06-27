"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { AppData, FocusSession, Settings } from "./types";
import { loadAppData, saveAppData, LOCAL_OWNER_ID } from "./storage";
import { createLandChecker, LandChecker } from "./pointInPolygon";
import { cellFromLatLng, expandTerritory, minutesToCells, totalAreaKm2 } from "./territory";
import { upsertRanking } from "./supabase";

export interface CompleteSessionResult {
  newCellIds: string[];
  exhausted: boolean;
  leftoverCells: number;
}

function nowCell(cellId: string) {
  return { cellId, ownerId: LOCAL_OWNER_ID, acquiredAt: new Date().toISOString() };
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [landChecker, setLandChecker] = useState<LandChecker | null>(null);

  useEffect(() => {
    setData(loadAppData());
  }, []);

  useEffect(() => {
    fetch("/data/japan.geojson")
      .then((res) => res.json())
      .then((geojson) => setLandChecker(createLandChecker(geojson)))
      .catch(() => setLandChecker(createLandChecker({ type: "FeatureCollection", features: [] })));
  }, []);

  useEffect(() => {
    if (data) saveAppData(data);
  }, [data]);

  useEffect(() => {
    if (!data || data.ownedCells.length === 0) return;
    const ids = data.ownedCells.map((c) => c.cellId);
    upsertRanking(data.playerId, data.settings.nickname, totalAreaKm2(ids));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.playerId, data?.ownedCells.length, data?.settings.nickname]);

  const pickStartCell = useCallback((lat: number, lng: number) => {
    const cellId = cellFromLatLng(lat, lng);
    setData((prev) => {
      const base = prev ?? loadAppData();
      return {
        ...base,
        startCell: cellId,
        ownedCells: [nowCell(cellId)],
      };
    });
  }, []);

  const completeFocusSession = useCallback(
    (durationMinutes: number): CompleteSessionResult => {
      if (!data || !landChecker) {
        return { newCellIds: [], exhausted: false, leftoverCells: 0 };
      }
      const requested = minutesToCells(durationMinutes);
      if (requested <= 0) {
        return { newCellIds: [], exhausted: false, leftoverCells: 0 };
      }

      const ownedIds = data.ownedCells.map((c) => c.cellId);
      const newCellIds = expandTerritory(ownedIds, requested, landChecker);
      const leftoverCells = requested - newCellIds.length;

      const session: FocusSession = {
        id: uuid(),
        startTime: new Date(Date.now() - durationMinutes * 60_000).toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes,
        cellsEarned: newCellIds.length,
      };

      setData((prev) => {
        const base = prev ?? data;
        return {
          ...base,
          ownedCells: [...base.ownedCells, ...newCellIds.map(nowCell)],
          totalFocusMinutes: base.totalFocusMinutes + durationMinutes,
          sessions: [...base.sessions, session],
        };
      });

      return { newCellIds, exhausted: leftoverCells > 0, leftoverCells };
    },
    [data, landChecker]
  );

  /**
   * Anchors a new island with a free start cell, then expands `leftoverCells`
   * more cells from it. Used when the previous island ran out of land.
   */
  const claimNewIsland = useCallback(
    (lat: number, lng: number, leftoverCells: number): string[] => {
      if (!data || !landChecker) return [];
      if (!landChecker.isLand(lat, lng)) return [];

      const startCellId = cellFromLatLng(lat, lng);
      const ownedIds = [...data.ownedCells.map((c) => c.cellId), startCellId];
      const expanded = expandTerritory(ownedIds, leftoverCells, landChecker);
      const allNew = [startCellId, ...expanded];

      setData((prev) => {
        const base = prev ?? data;
        return {
          ...base,
          ownedCells: [...base.ownedCells, ...allNew.map(nowCell)],
        };
      });

      return allNew;
    },
    [data, landChecker]
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => {
      const base = prev ?? loadAppData();
      return { ...base, settings: { ...base.settings, ...patch } };
    });
  }, []);

  return {
    data,
    landChecker,
    pickStartCell,
    completeFocusSession,
    claimNewIsland,
    updateSettings,
  };
}
