"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMsg(error.message);
  };

  const clearSupabaseStorage = () => {
    // Supabase auth tokenları genelde localStorage'da "sb-..." anahtarlarıyla tutulur
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("sb-") || k.includes("supabase")) localStorage.removeItem(k);
    }
    for (const k of Object.keys(sessionStorage)) {
      if (k.startsWith("sb-") || k.includes("supabase")) sessionStorage.removeItem(k);
    }
  };

  const handleLogout = async () => {
    setMsg(null);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setMsg(error.message);
      return;
    }

    // UI'yi kesin temizle
    setEmail(null);

    // Tarayıcı tokenlarını da temizle (prod'da takılmayı bitirir)
    clearSupabaseStorage();

    // Kesin yenile
    window.location.href = window.location.origin;
  };

  if (loading) return <div style={{ padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 40 }}>
      {msg && <div style={{ marginBottom: 12 }}>Hata: {msg}</div>}

      {email ? (
        <>
          <h1>Giriş yapıldı: {email}</h1>
          <button type="button" onClick={handleLogout}>
            Çıkış yap
          </button>
        </>
      ) : (
        <>
          <h1>Giriş yapılmadı</h1>
          <button type="button" onClick={handleLogin}>
            Google ile Giriş Yap
          </button>
        </>
      )}
    </div>
  );
}