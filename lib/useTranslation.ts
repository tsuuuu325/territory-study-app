import { AppData } from "./types";
import { Lang, t as translate } from "./i18n";

export function useTranslation(data: AppData | null) {
  const lang: Lang = data?.settings.language ?? "ja";
  return (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
}
