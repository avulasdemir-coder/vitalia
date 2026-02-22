"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }

    // Supabase auth tokenlarını kesin temizle
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("sb-")) localStorage.removeItem(k);
    }

    setEmail(null);
    window.location.href = window.location.origin;
  };

  if (loading) return <div style={{ padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 40 }}>
      {email ? (
        <>
          <h1>Giriş yapıldı: {email}</h1>
          <button type="button" onClick={logout}>
            Çıkış yap
          </button>
        </>
      ) : (
        <>
          <h1>Giriş yapılmadı</h1>
          <button type="button" onClick={login}>
            Google ile giriş yap
          </button>
        </>
      )}
    </div>
  );
}