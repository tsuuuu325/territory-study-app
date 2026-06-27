interface StatsBarProps {
  areaKm2: number;
  totalFocusMinutes: number;
}

export default function StatsBar({ areaKm2, totalFocusMinutes }: StatsBarProps) {
  const hours = totalFocusMinutes / 60;
  return (
    <div className="flex items-center justify-around bg-white/90 backdrop-blur px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="text-center">
        <div className="text-xs text-gray-500">総領土面積</div>
        <div className="text-lg font-bold text-gray-900">{areaKm2.toFixed(1)} km²</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500">総集中時間</div>
        <div className="text-lg font-bold text-gray-900">{hours.toFixed(1)} 時間</div>
      </div>
    </div>
  );
}
