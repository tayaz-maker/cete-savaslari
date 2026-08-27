import { isVerified, mapSbError, supabase } from "@/lib/supabase";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type SaveState = { [key: string]: Json };
export type CloudSave = { state: SaveState; progress: number };

const MAX_STATE_BYTES = 512 * 1024;

export async function loadSave(): Promise<CloudSave | null> {
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) return null;
  const { data, error } = await supabase
    .from("saves")
    .select("state, progress")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw new Error(mapSbError(error.message));
  if (!data) return null;
  return { state: data.state as SaveState, progress: Number(data.progress) };
}

export async function putSave(input: {
  state: SaveState;
  progress: number;
}): Promise<CloudSave | null> {
  const { data: session } = await supabase.auth.getUser();
  const user = session.user;
  if (!user) return null;
  if (!isVerified(user)) throw new Error("EMAIL_NOT_VERIFIED");
  const raw = JSON.stringify(input.state);
  if (raw.length > MAX_STATE_BYTES) throw new Error("Kayıt çok büyük.");

  const { data, error } = await supabase.rpc("upsert_save", {
    p_state: input.state,
    p_progress: input.progress,
  });
  if (error) throw new Error(mapSbError(error.message));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { state: row.state as SaveState, progress: Number(row.progress) };
}

export async function dropSave(): Promise<{ ok: true }> {
  const { error } = await supabase.rpc("delete_own_save");
  if (error) throw new Error(mapSbError(error.message));
  return { ok: true };
}
