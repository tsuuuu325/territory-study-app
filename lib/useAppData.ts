"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { AppData, FocusSession } from "./types";
import { loadAppData, saveAppData, LOCAL_OWNER_ID } from "./storage";
import { createLandChecker, LandChecker } from "./pointInPolygon";
import { cellFromLatLng, expandTerritory, minutesToCells } from "./territory";

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

  const pickStartCell = useCallback((lat: number, lng: number) => {
    const cellId = cellFromLatLng(lat, lng);
    setData((prev) => {
      const base = prev ?? loadAppData();
      return {
        ...base,
        startCell: cellId,
        ownedCells: [{ cellId, ownerId: LOCAL_OWNER_ID, acquiredAt: new Date().toISOString() }],
      };
    });
  }, []);

  const completeFocusSession = useCallback(
    (durationMinutes: number): string[] => {
      if (!data || !landChecker) return [];
      const cellsEarned = minutesToCells(durationMinutes);
      if (cellsEarned <= 0) return [];

      const ownedIds = data.ownedCells.map((c) => c.cellId);
      const newCellIds = expandTerritory(ownedIds, cellsEarned, landChecker);

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
          ownedCells: [
            ...base.ownedCells,
            ...newCellIds.map((cellId) => ({
              cellId,
              ownerId: LOCAL_OWNER_ID,
              acquiredAt: new Date().toISOString(),
            })),
          ],
          totalFocusMinutes: base.totalFocusMinutes + durationMinutes,
          sessions: [...base.sessions, session],
        };
      });

      return newCellIds;
    },
    [data, landChecker]
  );

  return { data, landChecker, pickStartCell, completeFocusSession };
}
