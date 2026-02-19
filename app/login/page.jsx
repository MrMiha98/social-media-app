"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // hold email and password values from the inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // loading animations
  const [loading, setLoading] = useState(false);
  const [loadingAuth,setLoadingAuth] = useState(true);

  // hold potential errors
  const [message, setMessage] = useState("");

  // check if a user is logged in already, if yes, then redirect to /home
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

  // handle loggin in
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
    <main className="flex min-h-screen items-center justify-center bg-mute">
      {loadingAuth ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      ) : (
        <div className="w-full max-w-sm space-y-6 rounded-xl bg-body border border-line p-8">
          <h1 className="text-center text-lg font-semibold text-lead">Log in to your account</h1>

          <form onSubmit={handleLogin} className="text-text text-sm space-y-4">
            <div className="space-y-1">
              <p>Email</p>
              <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-line p-2 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
            </div>
            <div className="space-y-1">
              <p>Password</p>
              <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-line p-2 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-md p-3 font-semibold text-body bg-main hover:bg-main/90 cursor-pointer transition">{loading ? "Loading..." : "Login"}</button>
          </form>

          <p className="text-center text-sm text-text">
            Don’t have an account?{" "}<a href="/register" className="font-semibold text-main hover:underline">Sign up</a>
          </p>

          {message ? ( <p className="text-center text-sm text-red-500">{message}</p> ) : null}
        </div>
      )}
    </main>
  );
}