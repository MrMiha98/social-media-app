"use client";

import { House, Upload, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // hold the currently logged in users username
  const [username, setUsername] = useState("");

  // retrieve the currently logged in users username
  useEffect(() => {
    const goToProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setUsername(profile.username)
    };

    goToProfile();
  }, []);

  return (
    <>
      <nav className="hidden md:sticky md:top-4 md:flex flex-col gap-y-2 bg-background text-black">
        <button onClick={() => router.push("/home")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/home" ? "bg-black/7" : "hover:bg-black/7" } cursor-pointer`}>
          <House size={20} />
          <span className="text-sm">Home</span>
        </button>

        <button onClick={() => router.push("/upload")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/upload" ? "bg-black/7" : "hover:bg-black/7" } cursor-pointer`}>
          <Upload size={20} />
          <span className="text-sm">Upload</span>
        </button>

        <button onClick={() => router.push(`/user/${username}`)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === `/user/${username}` ? "bg-black/7" : "hover:bg-black/7"} cursor-pointer`}>
          <User size={20} />
          <span className="text-sm">Profile</span>
        </button>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden justify-center border-t border-line bg-white py-2 space-x-10 text-foreground ">
        <button onClick={() => router.push("/home")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/home" ? "bg-black/7" : "hover:bg-black/7" } cursor-pointer`}>
          <House size={24} />
        </button>

        <button onClick={() => router.push("/upload")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/upload" ? "bg-black/7" : "hover:bg-black/7" } cursor-pointer`}>
          <Upload size={24} />
        </button>

        <button onClick={() => router.push(`/user/${username}`)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === `/user/${username}` ? "bg-black/7" : "hover:bg-black/7" } cursor-pointer`}>
          <User size={24} />
        </button>
      </nav>
    </>
  );
}