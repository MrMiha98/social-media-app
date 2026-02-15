"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAuth,setLoadingAuth] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace("/home");
        return;
      }

      setLoadingAuth(false);
    }

    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/home");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      {loadingAuth ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      ) : (
        <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white border border-line p-8">
          <h1 className="text-center text-2xl font-bold text-foreground">Login</h1>

          <form onSubmit={handleLogin} className="space-y-4 text-foreground">
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
            <button type="submit" disabled={loading} className="w-full rounded-md p-3 font-semibold text-white bg-black hover:bg-zinc-800 cursor-pointer transition">{loading ? "Loading..." : "Login"}</button>
          </form>

          <p className="text-center text-sm text-lightforeground">
            Don’t have an account?{" "}<a href="/register" className="font-semibold text-zinc-800 hover:underline">Sign up</a>
          </p>

          {message ? ( <p className="text-center text-sm text-red-500">{message}</p> ) : null}
        </div>
      )}
    </main>
  );
}