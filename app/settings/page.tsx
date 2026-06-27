"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppData } from "@/lib/useAppData";

const COLOR_OPTIONS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

export default function SettingsPage() {
  const { data, updateSettings } = useAppData();
  const [nickname, setNickname] = useState("");
  const [saved, setSaved] = useState(false);

  if (!data) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">読み込み中...</div>;
  }

  const currentNickname = nickname || data.settings.nickname;

  function handleSave() {
    const trimmed = currentNickname.trim();
    if (!trimmed) return;
    updateSettings({ nickname: trimmed });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex h-dvh flex-col bg-gray-50 px-6 py-8">
      <Link href="/" className="mb-6 text-sm text-blue-600">
        ← マップに戻る
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">設定</h1>

      <label className="mb-2 text-sm font-medium text-gray-700">ニックネーム</label>
      <input
        value={currentNickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
        className="mb-6 rounded-lg border border-gray-300 px-4 py-3 text-base"
        placeholder="ニックネームを入力"
      />

      <label className="mb-2 text-sm font-medium text-gray-700">領土の色</label>
      <div className="mb-8 flex gap-3">
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color}
            onClick={() => updateSettings({ color })}
            className="h-10 w-10 rounded-full border-2"
            style={{
              backgroundColor: color,
              borderColor: data.settings.color === color ? "#111827" : "transparent",
            }}
            aria-label={color}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white"
      >
        {saved ? "保存しました！" : "ニックネームを保存"}
      </button>
    </div>
  );
}
