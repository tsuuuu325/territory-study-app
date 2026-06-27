import { useTranslation } from "@/lib/useTranslation";

interface StatsBarProps {
  areaKm2: number;
  totalFocusMinutes: number;
  t: ReturnType<typeof useTranslation>;
}

export default function StatsBar({ areaKm2, totalFocusMinutes, t }: StatsBarProps) {
  const hours = totalFocusMinutes / 60;
  return (
    <div className="flex items-center justify-around bg-white/90 backdrop-blur px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="text-center">
        <div className="text-xs text-gray-500">{t("statsAreaLabel")}</div>
        <div className="text-lg font-bold text-gray-900">{areaKm2.toFixed(1)} km²</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500">{t("statsFocusLabel")}</div>
        <div className="text-lg font-bold text-gray-900">
          {t("hoursUnit", { value: hours.toFixed(1) })}
        </div>
      </div>
    </div>
  );
}
