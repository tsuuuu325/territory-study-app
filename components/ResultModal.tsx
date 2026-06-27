interface ResultModalProps {
  durationMinutes: number;
  cellsEarned: number;
  revealing: boolean;
  onClose: () => void;
}

export default function ResultModal({
  durationMinutes,
  cellsEarned,
  revealing,
  onClose,
}: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <p className="text-lg font-semibold text-gray-900">
          {durationMinutes}分集中しました！
        </p>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          +{cellsEarned}セル
        </p>
        <p className="text-sm text-gray-500">の領土を獲得！</p>
        <button
          onClick={onClose}
          disabled={revealing}
          className="mt-6 w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {revealing ? "領土を広げています..." : "マップに戻る"}
        </button>
      </div>
    </div>
  );
}
