"use client";

import { House, Upload, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter(); // spremeni url
  const pathname = usePathname(); // prebere url

  const [uploadModalToggle, setUploadModalToggle] = useState(false);

    const handleUploadModalToggle = () => {
    if (uploadModalToggle) {
      setUploadModalToggle(false);
    } else {
      setUploadModalToggle(true);
    }
  };

  return (
    <>
      <nav className="hidden md:sticky md:top-4 md:flex flex-col gap-y-2 bg-background text-foreground">
        <button onClick={() => router.push("/home")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/home" ? "bg-gray-100" : "hover:bg-gray-100" } cursor-pointer`}>
          <House size={20} />
          <span className="text-sm">Home</span>
        </button>

        <button onClick={handleUploadModalToggle} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/upload" ? "bg-gray-100" : "hover:bg-gray-100" } cursor-pointer`}>
          <Upload size={20} />
          <span className="text-sm">Upload</span>
        </button>

        <button onClick={() => router.push("/profile")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/profile" ? "bg-gray-100" : "hover:bg-gray-100"} cursor-pointer`}>
          <User size={20} />
          <span className="text-sm">Profile</span>
        </button>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden justify-center border-t border-line bg-white py-2 space-x-10 text-foreground ">
        <button onClick={() => router.push("/home")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/home" ? "bg-gray-100" : "hover:bg-gray-100" } cursor-pointer`}>
          <House size={24} />
        </button>

        <button onClick={() => router.push("/upload")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/upload" ? "bg-gray-100" : "hover:bg-gray-100" } cursor-pointer`}>
          <Upload size={24} />
        </button>

        <button onClick={() => router.push("/profile")} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${ pathname === "/profile" ? "bg-gray-100" : "hover:bg-gray-100" } cursor-pointer`}>
          <User size={24} />
        </button>
      </nav>
    </>
  );
}