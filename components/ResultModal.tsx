interface ResultModalProps {
  headline: string;
  cellsEarnedText: string;
  cellsEarnedNote: string;
  revealing: boolean;
  revealingLabel: string;
  closeLabel: string;
  exhaustedNote?: string;
  celebrate?: boolean;
  conqueredLabel?: string;
  onClose: () => void;
}

const CONFETTI = [
  { left: "10%", color: "#10B981", shape: "rect", duration: 2.6, delay: 0 },
  { left: "22%", color: "#3B82F6", shape: "circle", duration: 3.1, delay: 0.4 },
  { left: "35%", color: "#F59E0B", shape: "rect", duration: 2.3, delay: 0.8 },
  { left: "48%", color: "#EF4444", shape: "circle", duration: 2.9, delay: 0.2 },
  { left: "60%", color: "#8B5CF6", shape: "rect", duration: 2.5, delay: 1.1 },
  { left: "72%", color: "#3B82F6", shape: "circle", duration: 3.3, delay: 0.6 },
  { left: "84%", color: "#10B981", shape: "rect", duration: 2.7, delay: 0.9 },
  { left: "92%", color: "#F59E0B", shape: "circle", duration: 2.4, delay: 1.3 },
];

export default function ResultModal({
  headline,
  cellsEarnedText,
  cellsEarnedNote,
  revealing,
  revealingLabel,
  closeLabel,
  exhaustedNote,
  celebrate,
  conqueredLabel,
  onClose,
}: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-6">
      {celebrate && (
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-40px) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translateY(180px) translateX(14px) rotate(180deg); }
            90% { opacity: 1; }
            100% { transform: translateY(380px) translateX(-10px) rotate(360deg); opacity: 0; }
          }
        `}</style>
      )}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-7 text-center shadow-xl">
        {celebrate &&
          CONFETTI.map((c, i) => (
            <span
              key={i}
              className="pointer-events-none absolute top-0"
              style={{
                left: c.left,
                width: c.shape === "rect" ? 8 : 7,
                height: c.shape === "rect" ? 14 : 7,
                background: c.color,
                borderRadius: c.shape === "rect" ? 2 : "50%",
                animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
              }}
            />
          ))}

        {celebrate && conqueredLabel && (
          <p className="text-xs font-semibold tracking-wide text-green-600">{conqueredLabel}</p>
        )}
        <p className={celebrate ? "mt-1 text-xl font-bold text-gray-900" : "text-lg font-semibold text-gray-900"}>
          {headline}
        </p>
        <p
          className={
            celebrate
              ? "mt-2 text-5xl font-bold leading-none text-green-600"
              : "mt-2 text-3xl font-bold text-blue-600"
          }
        >
          {cellsEarnedText}
        </p>
        <p className="text-sm text-gray-500">{cellsEarnedNote}</p>
        {exhaustedNote && (
          <p className="mt-3 text-sm font-medium text-amber-600">{exhaustedNote}</p>
        )}
        <button
          onClick={onClose}
          disabled={revealing}
          className={
            celebrate
              ? "relative mt-6 w-full rounded-full bg-green-600 px-6 py-3.5 font-semibold text-white disabled:opacity-50"
              : "relative mt-6 w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          }
        >
          {revealing ? revealingLabel : closeLabel}
        </button>
      </div>
    </div>
  );
}
