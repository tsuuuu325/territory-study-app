import { cellArea, cellToBoundary, cellToLatLng, gridDisk, latLngToCell, UNITS } from "h3-js";
import { LandChecker } from "./pointInPolygon";

export const H3_RESOLUTION = 7;
export const MINUTES_PER_CELL = 1;

export function minutesToCells(durationMinutes: number): number {
  return Math.floor(durationMinutes / MINUTES_PER_CELL);
}

export function cellFromLatLng(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RESOLUTION);
}

export function totalAreaKm2(cellIds: string[]): number {
  return cellIds.reduce((sum, cellId) => sum + cellArea(cellId, UNITS.km2), 0);
}

const landCache = new Map<string, boolean>();

function isCellOnLand(cellId: string, landChecker: LandChecker): boolean {
  const cached = landCache.get(cellId);
  if (cached !== undefined) return cached;

  const [lat, lng] = cellToLatLng(cellId);
  let result = landChecker.isLand(lat, lng);

  if (!result) {
    // Coastal cells can have their center fall just outside the land
    // polygon even though most of the hexagon is on land. Checking the
    // boundary vertices too catches these near-shore false negatives.
    const boundary = cellToBoundary(cellId, false) as [number, number][];
    result = boundary.some(([vLat, vLng]) => landChecker.isLand(vLat, vLng));
  }

  landCache.set(cellId, result);
  return result;
}

/**
 * Expands territory by `count` cells, picking randomly from cells adjacent
 * to the existing territory so the shape stays contiguous (no enclaves).
 */
export function expandTerritory(
  ownedCellIds: string[],
  count: number,
  landChecker: LandChecker
): string[] {
  const owned = new Set(ownedCellIds);
  const newCells: string[] = [];

  for (let i = 0; i < count; i++) {
    const frontier = new Set<string>();
    for (const cellId of owned) {
      for (const neighbor of gridDisk(cellId, 1)) {
        if (!owned.has(neighbor) && isCellOnLand(neighbor, landChecker)) {
          frontier.add(neighbor);
        }
      }
    }

    const candidates = Array.from(frontier);
    if (candidates.length === 0) break;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    owned.add(picked);
    newCells.push(picked);
  }

  return newCells;
}
