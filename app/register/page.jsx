"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        username,
      },
    ]);

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      {loadingAuth ? (
        <div className="text-foreground">Loading...</div>
      ) : (
          <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white border border-line p-8">
            <h1 className="text-center text-2xl font-bold text-foreground">Register</h1>

            <form onSubmit={handleRegister} className="space-y-4 text-foreground">
              <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-pink-500"/>
              <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-pink-500"/>
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-pink-500"/>
              <button type="submit" disabled={loading} className="w-full rounded-md bg-pink-500 p-3 font-semibold text-white hover:bg-pink-600 cursor-pointer transition">{loading ? "Loading..." : "Register"}</button>
            </form>

            <p className="text-center text-sm text-lightforeground">
              Already have an account?{" "}
              <a href="/login" className="text-pink-500 hover:underline">Login</a>
            </p>
            
            {message ? ( <p className="text-center text-sm text-red-500">{message}</p> ) : null}
          </div>
        )
      };
    </main>
  )
}
