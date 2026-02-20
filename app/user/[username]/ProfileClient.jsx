"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Image, Plus } from 'lucide-react';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function ProfileClient({ profile, posts }) {
  const router = useRouter();

  // hold the currently logged in user
  const [user, setUser] = useState(null);

  // status
  const [editing, setEditing] = useState(false);

  // hold the bio input text if the user is on his own profile
  const [bioInput, setBioInput] = useState(profile.bio || '');

  // get the currently logged in user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      setUser(user);
    };

    checkUser();
  }, []);

  const isCurrentUser = user?.id === profile.id;

  // handle bio change
  const handleSaveBio = async () => {
    await supabase
      .from("profiles")
      .update({ bio: bioInput })
      .eq("id", user.id);

    setEditing(false);
    location.reload();
  };

  // handle uploading of a new avatar
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

  // handle logging out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-body md:border-l md:border-r border-line p-6 w-full md:max-w-md relative">
      <div className="absolute left-0 top-0 right-0 w-full h-20 z-0 bg-[url('https://images6.alphacoders.com/325/thumb-1920-325041.jpg')]"></div>
          
      <div className="flex items-start space-x-5 relative">
        {isCurrentUser ? (
          profile.avatar_url ? (
            <label className="w-28 h-28 rounded-full overflow-hidden shrink-0 cursor-pointer group relative">
              <img src={`${profile.avatar_url}?t=${Date.now()}`} alt="pfp" />
              <input type="file" className="h-full w-full" hidden onChange={(e) => handleAvatarUpload(e)} />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Image size={24} color="white"/>
                <Plus size={24} color="white"/>
              </div>
            </label>
          ) : (
            <label className="w-28 h-28 rounded-full overflow-hidden shrink-0 cursor-pointer group relative">
              <div className="h-full w-full bg-black text-white text-xs flex justify-center items-center group-hover:text-black">Upload avatar</div>
              <input type="file" className="h-full w-full" hidden onChange={(e) => handleAvatarUpload(e)} />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Image size={24} color="white"/>
                <Plus size={24} color="white"/>
              </div>
            </label>
          )
        ) : (
          profile.avatar_url ? (
            <div className="w-28 h-28 rounded-full overflow-hidden">
              <img src={`${profile.avatar_url}?t=${Date.now()}`} alt="pfp" />
            </div>
          ) : (
            <div className="w-28 h-28 bg-black text-white text-xs flex justify-center items-center rounded-full overflow-hidden">No avatar yet</div>
          )
        )}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
            {isCurrentUser && (
              <button onClick={handleLogout} className="text-sm text-text font-semibold hover:underline cursor-pointer">Log out</button>
            )}
          </div>
          {isCurrentUser ? (
            <p className="text-gray-300 text-xs">{user.email}</p>
          ) : (
            <p className="text-gray-300 text-xs">{profile.bio}</p>
          )}
          {isCurrentUser && (
            <div className="mt-4">
              {editing ? (
                <div className="flex space-x-2">
                  <input type="text" value={bioInput} onChange={(e) => setBioInput(e.target.value)} className="flex-1 rounded-md border border-line px-2 py-1.5 text-xs text-subs outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                  <button onClick={handleSaveBio} className="px-3 text-body font-bold rounded-md bg-main hover:bg-main/90 text-xs cursor-pointer">Save</button>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-3">
                  <p className="text-subs text-sm">{profile.bio || "No bio yet"}</p>
                  <button onClick={() => setEditing(true)} className="text-main font-medium hover:underline text-xs cursor-pointer">Edit</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mt-4 bg-body">
        {posts.length === 0 ? (
          <p className="col-span-3 text-center text-sm text-subs py-6">The user has made no posts so far.</p>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="aspect-square overflow-hidden rounded-sm cursor-pointer relative">
                <div className="absolute bottom-0 left-0 w-full h-full bg-transparent hover:bg-black/10 transition"></div>
                <img src={post.image_url} alt="" className="w-full h-full object-cover"/>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}