"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);                 // 🔥 kritik satır
    window.location.reload();       // 🔥 garanti temizlik
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: 40 }}>
      {email ? (
        <>
          <h1>Giriş yapıldı: {email}</h1>
          <button onClick={handleLogout}>Çıkış yap</button>
        </>
      ) : (
        <>
          <h1>Giriş yapılmadı</h1>
          <button onClick={handleLogin}>Google ile Giriş Yap</button>
        </>
      )}
    </div>
  );
}