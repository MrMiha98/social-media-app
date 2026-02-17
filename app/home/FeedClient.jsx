"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase";
import { Heart, MessageCircle, SendHorizonal } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedClient({ initialPosts, likes, activeStoryProfiles }) {
  const router = useRouter();
  const ref = useRef(null);

  // hold the sticky status of the stories container
  const [isStickyActive, setIsStickyActive] = useState(false);

  // prevent vertical scroll when trying to scroll the stories bar
  useEffect(() => {
    const el = ref.current;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // hold post and current logged in user
  const [posts, setPosts] = useState(initialPosts);
  const [user, setUser] = useState(null);

  // hold which post we are opening the comments of or liking it
  const [openComments, setOpenComments] = useState(null);
  const [openLike, setOpenLike] = useState(null);

  // hold comments of the selected post
  const [comments, setComments] = useState([]);

  // hold the value of the comment going to be posted
  const [postComment, setPostComment] = useState("");

  // hold all profiles in the comment section of a selected post
  const [profilesOnPost, setProfilesOnPost] = useState([]); 

  // openning comments and liking loading animation
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // get the current logged in user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
      } else {
        router.replace("/login");
      }
    }

    checkUser();
  }, []);

  // for each post check if the currently logged in user has liked it or not
  useEffect(() => {
    if (!user) {
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => ({
        ...post,
        hasLiked: likes.some((like) => 
              like.user_id === user.id && like.post_id === post.id
        )
      }))
    );
  }, [user]);

  // handle liking
  const toggleLike = async (post) => {
    setOpenLike(post.id);
    setLoadingLike(true);

    if (!user.id) {
      return;
    }

    if (post.hasLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

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
      await supabase
        .from("likes")
        .insert({
          post_id: post.id,
          user_id: user.id,
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

    setOpenLike(null);
    setLoadingLike(false);
  };

  // handle fetching comment on a selected post
  const fetchComments = async (postId) => {
    setLoadingComments(true);
    setComments([]);

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("id, content, user_id")
      .eq("post_id", postId)

    if (commentsError) {
      console.log(commentsError);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")

    if (profilesError) {
      console.log(profilesError);
      return;
    }

    setProfilesOnPost(profilesData);

    const commentsData = comments.map((comment) => {
      return {
        ...comment,

        username: profilesData.find((profile) =>
              profile.id === comment.user_id
        )?.username,
        avatar_url: profilesData.find((profile) =>
              profile.id === comment.user_id
        )?.avatar_url
      }
    })

    setComments(commentsData);
    setLoadingComments(false);
  };


  // handle posting a comment
  const handleCommentPost = async (e, postId) => {
    e.preventDefault();

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, content: postComment })
      .select()
      .single()

    if (error) {
      console.log(error);
      return;
    }

    const enrichedComment = {
      ...newComment,
      username: profilesOnPost.find((p) => p.id === newComment.user_id)?.username,
      avatar_url: profilesOnPost.find((p) => p.id === newComment.user_id)?.avatar_url,
    };

    setComments((prevComments) => [...prevComments, enrichedComment]);

    setPostComment("");
  };

  // handle copying the link of a selected post
  const handleCopyLink = async (postId) => {
    const url = "http://localhost:3000/post/" + postId;

    await navigator.clipboard.writeText(url);

    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex justify-center items-start px-4 pb-2 space-x-2 bg-background text-foreground">
      <Sidebar />
      <div className={`flex flex-col ${!posts.length && "w-full max-w-md justify-center items-center"} mb-14 md:mb-0`}>
        <div ref={ref} className={`sticky top-0 w-full max-w-md flex space-x-1 overflow-hidden bg-white border-l border-r border-b border-line p-2`}>
          {activeStoryProfiles && activeStoryProfiles.length > 0 ? (
            activeStoryProfiles.map((profile) => (
              <img key={profile.id} src={`${profile.avatar_url}?t=${Date.now()}`} onClick={() => router.push(`/stories/${profile.username}`)} className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right border-2 border-pink-500 cursor-pointer" alt="story avatar"/>
            ))
          ) : (
            <p className="text-sm text-gray-500">No active stories.</p>
          )}
        </div>
        {!posts.length && (
          <p className="text-gray-700">No posts yet.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="border-l border-b border-r border-line w-full max-w-md bg-white">
            <Link href={`/user/${post.username}`} className="flex flex-row items-center space-x-2 px-2 hover:underline">
              <img className="w-6 h-6 object-cover object-top-right rounded-full" src={`${post.avatar_url}?t=${Date.now()}`} alt="user avatar"/>
              <div className="py-3 font-semibold text-sm">{post.username}</div>
            </Link>

            <img src={post.image_url} alt={post.caption} className="w-full object-cover"/>

            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleLike(post)}>
                    {loadingLike && openLike === post.id ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <Heart size={24} className={`transition cursor-pointer ${post.hasLiked ? "fill-red-500 text-red-500" : "text-lightforeground hover:text-red-500"}`}/>
                    )}
                  </button>

                  <span className="text-sm font-bold text-gray-700">{post.likeCount}</span>

                  <MessageCircle size={24} className="cursor-pointer text-lightforeground hover:text-pink-500 ml-2" onClick={() => {
                    if (openComments === post.id) {
                      setOpenComments(null);
                    } else {
                      setOpenComments(post.id);
                      fetchComments(post.id);
                    }}}/>
                  <span className="text-sm font-bold text-gray-700">{post.commentCount}</span>
                  <SendHorizonal size={24} onClick={() => handleCopyLink(post.id)} className="cursor-pointer text-lightforeground hover:text-black transition ml-2" />
                </div>

                <span className="text-xs text-lightforeground">{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
              </div>

              {openComments === post.id && (
                <>
                  <div className="w-full max-h-64 overflow-auto overflow-x-hidden px-2 py-4 space-y-1">
                    {loadingComments ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-2">
                          <img src={`${comment.avatar_url}?t=${Date.now()}`} className="w-6 h-6 object-cover object-top-right rounded-full"/>
                          <div>
                            <span className="font-semibold text-xs">{comment.username}</span>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="font-semibold text-xs">No comments yet.</p>
                    )}
                  </div>
                  <form onSubmit={(e) => handleCommentPost(e, post.id)} className="w-full flex items-center space-x-2">
                    <input type="text" placeholder="Write a comment..." value={postComment} onChange={(e) => setPostComment(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-line rounded-full focus:border-transparent outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                    <button type="submit" className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-zinc-800 cursor-pointer transition active:scale-95">Send</button>
                  </form>
                </>
              )}

              <p className="mt-4 text-sm text-gray-800">{post.caption}</p>
            </div>
          </div>
        ))}
        <p className="py-8 text-gray-500 mx-auto">You're all caught up.</p>
      </div>
    </div>
  );
}