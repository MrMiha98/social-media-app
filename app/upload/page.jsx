"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";
import { CloudUpload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  // hold the file and caption text for the post about to be created
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");

  // loading animations
  const [loading, setLoading] = useState(false);

  // hold potential errors
  const [message, setMessage] = useState("");

  // hold what type of upload it is going to be
  const [uploadType, setUploadType] = useState("post");

  // handle the file select
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // handle post upload
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

      const bucket = uploadType === "post" ? "posts" : "stories";
      const table = uploadType === "post" ? "posts" : "stories";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
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
        .from(bucket)
        .getPublicUrl(uploadedPath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        setMessage("Failed to get public URL. Check bucket name and RLS.");
        setLoading(false);
        return;
      }

      const insertPayload = uploadType === "post" ? {
        user_id: user.id,
        image_url: publicUrl,
        caption,
      } : {
        user_id: user.id,
        image_url: publicUrl,
      };

      const { error: postError } = await supabase.from(table).insert([insertPayload]);

      if (postError) {
        setMessage("Failed to save post: " + postError.message);
        setLoading(false);
        return;
      }

      setCaption("");
      setImageFile(null);
      setMessage("");
      router.push("/home");
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start space-x-2 bg-mute">
      <Sidebar />
      <div className="w-full md:max-w-md h-screen flex flex-col px-8 py-2 bg-body md:border-l md:border-r border-line">
        <h1 className="text-center text-xl font-semibold text-lead mt-4">Upload a <span className="text-fire underline">Post</span> or a <span className="text-gold underline">Story</span></h1>

        <div className="flex w-full mt-8 mb-2 border border-line rounded-md overflow-hidden">
          <button type="button" onClick={() => setUploadType("post")} className={`flex-1 p-2 text-sm font-semibold cursor-pointer transition ${uploadType === "post" ? "bg-main text-body" : "bg-mute text-text hover:bg-text/10"}`}>Post</button>
          <button type="button" onClick={() => setUploadType("story")} className={`flex-1 p-2 text-sm font-semibold cursor-pointer transition ${uploadType === "story"  ? "bg-main text-body" : "bg-mute text-text hover:bg-text/10"}`}>Story</button>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col space-y-4 mt-8 mb-4">
          <label className="cursor-pointer rounded-md border border-line bg-mute p-3 text-sm text-text hover:bg-text/10 transition">
            <span>{ imageFile ? imageFile.name : "Browse images…" }</span>
            <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
          </label>
          {uploadType === "post" && (
            <textarea placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="text-lead min-h-32 bg-mute resize-none w-full rounded-md border border-line p-3 text-sm outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
          )}
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-x-2 cursor-pointer rounded-md p-3 font-semibold text-body bg-main hover:bg-main/90 transition">{loading ? "Uploading..." : "Upload"} <CloudUpload size={24} /></button>
          {message ? ( <p className="text-sm text-center text-red-500">{message}</p> ) : null}
        </form>
      </div>
    </div>
  );
}
