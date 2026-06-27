interface ResultModalProps {
  headline: string;
  cellsEarnedText: string;
  cellsEarnedNote: string;
  revealing: boolean;
  revealingLabel: string;
  closeLabel: string;
  exhaustedNote?: string;
  onClose: () => void;
}

export default function ResultModal({
  headline,
  cellsEarnedText,
  cellsEarnedNote,
  revealing,
  revealingLabel,
  closeLabel,
  exhaustedNote,
  onClose,
}: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <p className="text-lg font-semibold text-gray-900">{headline}</p>
        <p className="mt-2 text-3xl font-bold text-blue-600">{cellsEarnedText}</p>
        <p className="text-sm text-gray-500">{cellsEarnedNote}</p>
        {exhaustedNote && (
          <p className="mt-3 text-sm font-medium text-amber-600">{exhaustedNote}</p>
        )}
        <button
          onClick={onClose}
          disabled={revealing}
          className="mt-6 w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {revealing ? revealingLabel : closeLabel}
        </button>
      </div>
    </div>
  );
}
