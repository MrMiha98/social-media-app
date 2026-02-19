"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // hold email, username and password values from the inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // loading animations
  const [loading, setLoading] = useState(false);
  const [loadingAuth,setLoadingAuth] = useState(true);

  // holds potential errors
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

  // handle registering in
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
    <main className="flex min-h-screen items-center justify-center bg-mute">
      {loadingAuth ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      ) : (
          <div className="w-full max-w-sm space-y-6 rounded-xl bg-body border border-line p-8">
            <h1 className="text-center text-lg font-semibold text-lead">Create a new account</h1>

            <form onSubmit={handleRegister} className="text-text text-sm space-y-4">
              <div className="space-y-1">
                <p>Username</p>
                <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border border-line p-2 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
              </div>
              <div className="space-y-1">
                <p>Email</p>
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-line p-2 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
              </div>
              <div className="space-y-1">
                <p>Password</p>
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-line p-2 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-md p-3 font-semibold text-body bg-main hover:bg-main/90 cursor-pointer transition">{loading ? "Loading..." : "Register"}</button>
            </form>

            <p className="text-center text-sm text-text">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-main hover:underline">Login</a>
            </p>
            
            {message ? ( <p className="text-center text-sm text-red-500">{message}</p> ) : null}
          </div>
        )
      }
    </main>
  )
}
