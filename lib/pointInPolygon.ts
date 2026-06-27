type Ring = [number, number][];
type Polygon = Ring[];

function pointInRing(point: [number, number], ring: Ring): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point: [number, number], polygon: Polygon): boolean {
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

export interface LandChecker {
  isLand(lat: number, lng: number): boolean;
}

export function createLandChecker(geojson: GeoJSON.FeatureCollection): LandChecker {
  const polygons: Polygon[] = [];
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (geom.type === "Polygon") {
      polygons.push(geom.coordinates as unknown as Polygon);
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates as unknown as Polygon[]) {
        polygons.push(poly);
      }
    }
  }

  return {
    isLand(lat: number, lng: number): boolean {
      const point: [number, number] = [lng, lat];
      for (const polygon of polygons) {
        if (pointInPolygon(point, polygon)) return true;
      }
      return false;
    },
  };
}
