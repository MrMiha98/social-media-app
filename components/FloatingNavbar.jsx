"use client";

import { House, Upload, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import FileUploadModal from "./FileUploadModal";

export default function FloatingNavbar() {
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
      { uploadModalToggle && (
        <FileUploadModal />
      )}

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-white border border-line px-3 py-2 text-foreground">
        <button onClick={() => router.push("/home")} className={`p-2 cursor-pointer rounded-lg transition ${ pathname === "/home" ? "bg-gray-100" : "hover:bg-gray-100" }`}>
          <House size={20} />
        </button>

        <button onClick={handleUploadModalToggle} className={`p-2 cursor-pointer rounded-lg transition ${ pathname === "/upload" ? "bg-gray-100" : "hover:bg-gray-100" }`}>
          <Upload size={20} />
        </button>

        <button onClick={() => router.push("/profile")} className={`p-2 cursor-pointer rounded-lg transition ${ pathname === "/profile" ? "bg-gray-100" : "hover:bg-gray-100" }`}>
          <User size={20} />
        </button>
      </nav>
    </>
  );
}