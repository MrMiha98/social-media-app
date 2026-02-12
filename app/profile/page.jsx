"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { Image, Plus } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      } else {
        setUser(user);
      }

      const { data: profileInfo } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileInfo) {
        setProfile(profileInfo || "");
        setBioInput(profileInfo.bio || "");
      }

      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPosts(userPosts || []);
      setLoading(false);
    };

    fetchProfileAndPosts();
  }, []);

  const handleSaveBio = async () => {
    await supabase
      .from("profiles")
      .update({ bio: bioInput })
      .eq("id", user.id);

    setProfile((prev) => ({ ...prev, bio: bioInput }));
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

   const { error: uploadError } = await supabase
    .storage
    .from("avatars")
    .update(fileName, file, { upsert: true })

    if (uploadError) {
      console.log(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from("avatars")
      .getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    location.reload();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start p-4 gap-x-2 bg-background">
      <Sidebar />
      <div className="bg-white border border-line p-6 w-full max-w-md">
          
        <div className="flex items-start space-x-5">
          <label className="w-28 h-28 rounded-full overflow-hidden shrink-0 cursor-pointer group relative">
            <img src={`${profile.avatar_url}?t=${Date.now()}`} alt="pfp" />
            <input type="file" className="h-full w-full" hidden onChange={(e) => handleAvatarUpload(e)} />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Image size={24} />
                <Plus size={24} />
              </div>
          </label>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{profile.username}</h2>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition cursor-pointer">Log out</button>
            </div>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="mt-3">
              { editing ? (
                <div className="flex space-x-2">
                  <input type="text" value={bioInput} onChange={(e) => setBioInput(e.target.value)} className="flex-1 p-2 rounded-md border border-line focus:ring-1 focus:ring-black/10 text-black outline-none text-sm"/>
                  <button onClick={handleSaveBio} className="px-3 py-2 text-white rounded-md bg-black hover:bg-zinc-800 text-sm cursor-pointer">Save</button>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-3">
                  <p className="text-gray-800 text-sm">{profile.bio || "No bio yet"}</p>
                  <button onClick={() => setEditing(true)} className="text-pink-800 hover:underline text-xs cursor-pointer">Edit</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-4">
          { posts.length === 0 ? (
            <p className="col-span-3 text-center text-gray-400 py-6">No posts yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="aspect-square overflow-hidden rounded-sm">
                <img src={post.image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition"/>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}