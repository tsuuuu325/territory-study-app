import { v4 as uuid } from "uuid";
import { AppData } from "./types";

const STORAGE_KEY = "territory-study-app:data";
export const LOCAL_OWNER_ID = "local-player";

export function defaultAppData(): AppData {
  return {
    playerId: uuid(),
    startCell: null,
    ownedCells: [],
    totalFocusMinutes: 0,
    sessions: [],
    settings: {
      color: "#3B82F6",
      nickname: "つかさ",
    },
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") return defaultAppData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAppData();
  try {
    const parsed = JSON.parse(raw) as AppData;
    return { ...defaultAppData(), ...parsed };
  } catch {
    return defaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
