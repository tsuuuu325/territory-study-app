export interface OwnedCell {
  cellId: string;
  ownerId: string;
  acquiredAt: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  cellsEarned: number;
}

export interface Settings {
  color: string;
  nickname: string;
}

export interface AppData {
  startCell: string | null;
  ownedCells: OwnedCell[];
  totalFocusMinutes: number;
  sessions: FocusSession[];
  settings: Settings;
}
