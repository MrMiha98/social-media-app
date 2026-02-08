"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";
import { CloudUpload } from "lucide-react";

export default function FileUploadModal() {
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setMessage("Please select an image");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in to upload a post");
        setLoading(false);
        return;
      }

      const sanitizedFileName = imageFile.name.replace(/\s+/g, "_");
      const fileName = `${user.id}_${Date.now()}_${sanitizedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) {
        setMessage("Upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      if (!uploadData.path) {
        setMessage("Upload succeeded but returned no path. Check bucket name and RLS.");
        setLoading(false);
        return;
      }

      const uploadedPath = uploadData.path;

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadedPath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        setMessage("Failed to get public URL. Check bucket name and RLS.");
        setLoading(false);
        return;
      }

      const { error: postError } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          image_url: publicUrl,
          caption,
        },
      ]);

      if (postError) {
        setMessage("Failed to save post: " + postError.message);
        setLoading(false);
        return;
      }

      setCaption("");
      setImageFile(null);
      setMessage("");
      window.location.reload();
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="z-50 fixed bottom-18 left-1/2 -translate-x-1/2 flex flex-col rounded-2xl overflow-hidden space-y-6 bg-white border border-line p-8 w-sm">
        <h1 className="text-center text-2xl font-bold text-lightforeground">Upload Post</h1>

        <form onSubmit={handleUpload} className="flex flex-col space-y-4">
          <label className="cursor-pointer rounded-md border border-line bg-white p-3 text-sm text-lightforeground hover:bg-gray-100 transition">
            <span>{ imageFile ? imageFile.name : "Browse images…" }</span>
            <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
          </label>
          <textarea placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="text-black resize-none w-full rounded-md border border-line p-3 outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-x-2 rounded-md p-3 cursor-pointer font-semibold transition text-white bg-sky-500 hover:bg-sky-600">{loading ? "Uploading..." : "Upload"} <CloudUpload size={24} /></button>
          {message ? ( <p className="text-sm text-center text-red-500">{message}</p> ) : null}
        </form>
    </main>
  );
}