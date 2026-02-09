"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Heart, MessageCircle, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // auth
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        setCurrentUserId(user.id);
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // fetch posts and likes
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const fetchPosts = async () => {
      setFetchingPosts(true);
      setFetchError("");

      try {
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("id, image_url, user_id, caption, created_at")
          .order("created_at", { ascending: false });

        if (postsError) {
          setFetchError(postsError.message);
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username");

        if (profilesError) {
          setFetchError(profilesError.message);
        }

        const { data: likes, error: likesError } = await supabase
          .from("likes")
          .select("post_id, user_id");

        if (likesError) {
          setFetchError(likesError.message);
        }
        
        const postsWithLikeData = posts.map((post) => {
          return {
            ...post,

            username: profiles.find((profile) =>
              post.user_id === profile.id
            )?.username,

            likeCount: likes.filter((like) =>
              like.post_id === post.id
            ).length,
            
            hasLiked: likes.some((like) => 
              like.user_id === currentUserId && like.post_id === post.id
            )
          };
        });

        setPosts(postsWithLikeData);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setFetchingPosts(false);
      }
    };

    fetchPosts();
  }, [currentUserId]);

  // handle like
  const toggleLike = async (post) => {
    if (!currentUserId) {
      return;
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", currentUserId)
      .single();

    if (existingLike) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id ? {
            ...p,
            likeCount: p.likeCount - 1,
            hasLiked: false,
          } : p
        )
      );
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id ? {
            ...p,
            likeCount: p.likeCount + 1,
            hasLiked: true,
          } : p
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-4 gap-x-2 bg-background text-foreground">
      { loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">Checking authentication...</div>
      ) : (
        <>
          { fetchingPosts ? (
            <p>Loading posts...</p>
          ) : fetchError ? (
            <p className="text-red-500">Error fetching posts: {fetchError}</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-400">No posts yet.</p>
          ) : (
            <>
              <Sidebar />
              <div className="flex flex-col space-y-4 mb-14 md:mb-0">
                { posts.map((post) => (
                  <div key={post.id} className="border border-line w-full max-w-md bg-white">
                    <div className="px-4 py-3 font-semibold text-sm">{post.username}</div>

                    <img src={post.image_url} alt={post.caption} className="w-full object-cover"/>

                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => toggleLike(post)}>
                            <Heart size={24} className={`transition cursor-pointer ${ post.hasLiked ? "fill-red-500 text-red-500" : "text-lightforeground hover:text-red-500" }`}/>
                          </button>

                          <span className="text-sm font-bold text-gray-700">{post.likeCount}</span>

                          <MessageCircle size={24} className="cursor-pointer text-lightforeground hover:text-pink-500 ml-2"/>
                        </div>

                        <span className="text-xs text-lightforeground">{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
                      </div>

                      <p className="mt-2 text-sm text-gray-800">{post.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}