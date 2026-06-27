import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = url && anonKey ? createClient(url, anonKey) : null;

export async function isNicknameTaken(
  nickname: string,
  excludePlayerId: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data } = await supabase
      .from("rankings")
      .select("player_id")
      .eq("nickname", nickname.trim())
      .neq("player_id", excludePlayerId)
      .limit(1);
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function upsertRanking(
  playerId: string,
  nickname: string,
  totalAreaKm2: number
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("rankings").upsert({
      player_id: playerId,
      nickname,
      total_area_km2: totalAreaKm2,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // ranking sync is best-effort; failures should never block the app
  }
}
