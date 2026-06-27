"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/lib/useAppData";
import { isNicknameTaken } from "@/lib/supabase";
import { useTranslation } from "@/lib/useTranslation";
import { LANGUAGES, Lang } from "@/lib/i18n";

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
  const t = useTranslation(data);
  const [nickname, setNickname] = useState("");
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (data && !initialized.current) {
      setNickname(data.settings.nickname);
      initialized.current = true;
    }
  }, [data]);

  if (!data) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  const locked = data.settings.nicknameLocked;

  async function handleSave() {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    setError(null);
    setChecking(true);
    const taken = await isNicknameTaken(trimmed, data!.playerId);
    setChecking(false);

    if (taken) {
      setError(t("nicknameTakenError"));
      return;
    }

    updateSettings({ nickname: trimmed, nicknameLocked: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex h-dvh flex-col bg-gray-50 px-6 py-8">
      <Link href="/" className="mb-6 text-sm text-blue-600">
        {t("backToMap")}
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">{t("settingsTitle")}</h1>

      <label className="mb-2 text-sm font-medium text-gray-700">{t("nicknameLabel")}</label>
      {locked ? (
        <p className="mb-6 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-700">
          {data.settings.nickname}
          {t("nicknameLockedSuffix")}
        </p>
      ) : (
        <>
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError(null);
            }}
            maxLength={20}
            className="mb-2 rounded-lg border border-gray-300 px-4 py-3 text-base"
            placeholder={t("nicknamePlaceholder")}
          />
          <p className="mb-2 text-xs text-gray-500">{t("nicknameLockNotice")}</p>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {!error && <div className="mb-4" />}
        </>
      )}

      <label className="mb-2 text-sm font-medium text-gray-700">{t("colorLabel")}</label>
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

      <label className="mb-2 text-sm font-medium text-gray-700">{t("languageLabel")}</label>
      <select
        value={data.settings.language}
        onChange={(e) => updateSettings({ language: e.target.value as Lang })}
        className="mb-8 rounded-lg border border-gray-300 px-4 py-3 text-base"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      {!locked && (
        <button
          onClick={handleSave}
          disabled={!nickname.trim() || checking}
          className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-40"
        >
          {checking ? t("checkingButton") : saved ? t("savedButton") : t("saveNicknameButton")}
        </button>
      )}
    </div>
  );
}
