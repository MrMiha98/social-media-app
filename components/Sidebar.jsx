"use client";

import { House, Upload, User, Sun, Moon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // hold the currently logged in users username
  const [username, setUsername] = useState("");

  const [darkmode, setDarkmode] = useState(false);

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

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkmode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkmode((prev) => {
      const newMode = !prev;

      // toggle the class in one line
      document.documentElement.classList.toggle("dark", newMode);

      // persist preference
      localStorage.setItem("theme", newMode ? "dark" : "light");

      return newMode;
    });
  };

  return (
    <>
      <nav className="hidden md:sticky md:top-4 md:flex flex-col gap-y-2 bg-mute">
        <div className="px-3 py-4 text-xl font-semibold text-text select-none">socy.<span className="text-main italic">app</span></div>

        <button onClick={() => router.push("/home")} className={`w-48 flex items-center justify-start space-x-3 py-2 rounded-full transition ${ pathname === "/home" ? "bg-main/10 text-main" : "hover:bg-grey hover:text-lead text-subs" } cursor-pointer text-sm font-medium`}>
          <House size={20} className="ml-4"/>
          <span>Home</span>
        </button>

        <button onClick={() => router.push("/upload")} className={`w-48 flex items-center justify-start space-x-3 py-2 rounded-full transition ${ pathname === "/upload" ? "bg-main/10 text-main" : "hover:bg-grey hover:text-lead text-subs" } cursor-pointer text-sm font-medium`}>
          <Upload size={20} className="ml-4"/>
          <span className="text-sm">Upload</span>
        </button>

        <button onClick={() => router.push(`/user/${username}`)} className={`w-48 flex items-center justify-start space-x-3 py-2 rounded-full transition ${ pathname === `/user/${username}` ? "bg-main/10 text-main" : "hover:bg-grey hover:text-lead text-subs"} cursor-pointer text-sm font-medium`}>
          <User size={20} className="ml-4"/>
          <span className="text-sm">Profile</span>
        </button>

        <button onClick={toggleDarkMode} className="w-48 flex items-center justify-start space-x-3 py-2 rounded-full transition hover:bg-grey hover:text-lead text-subs cursor-pointer text-sm font-medium">
          {darkmode ? <Sun size={20} className="text-yellow-500 ml-4" /> : <Moon size={20} className="text-subs ml-4" />}
          <span className="text-sm">{darkmode ? "Light Theme" : "Dark Theme"}</span>
        </button>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden justify-center border-t border-line py-2 bg-mute z-10">
        <button onClick={() => router.push("/home")} className={`flex items-start space-x-3 px-8 py-2 rounded-xl ${ pathname === "/home" ? "bg-main/10 text-main" : "text-subs" }`}>
          <House size={24}/>
        </button>

        <button onClick={() => router.push("/upload")} className={`flex items-start space-x-3 px-8 py-2 rounded-xl ${ pathname === "/upload" ? "bg-main/10 text-main" : "text-subs" }`}>
          <Upload size={24}/>
        </button>

        <button onClick={() => router.push(`/user/${username}`)} className={`flex items-start space-x-3 px-8 py-2 rounded-xl ${ pathname === `/user/${username}` ? "bg-main/10 text-main" : "text-subs" }`}>
          <User size={24}/>
        </button>

        <button onClick={toggleDarkMode} className="flex items-center space-x-3 px-8 py-2 text-subs">
          {darkmode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-subs" />}
        </button>
      </nav>
    </>
  );
}