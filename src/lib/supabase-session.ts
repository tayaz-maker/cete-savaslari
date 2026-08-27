import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isVerified, supabase } from "@/lib/supabase";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let live = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!live) return;
      setUser(data.session?.user ?? null);
      setPending(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setPending(false);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    pending,
    verified: isVerified(user),
    username:
      (typeof user?.user_metadata?.display_username === "string" &&
        user.user_metadata.display_username) ||
      (typeof user?.user_metadata?.username === "string" &&
        user.user_metadata.username) ||
      user?.email ||
      null,
  };
}
