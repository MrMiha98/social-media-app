"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase";
import { Forward, Heart, MessageCircle } from "lucide-react";
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
    <div className="min-h-screen flex justify-center items-start space-x-2 bg-mute">
      <Sidebar />
      <div className={`flex flex-col w-full md:max-w-md ${!posts.length && "justify-center items-center"} mb-14 md:mb-0`}>
        <div ref={ref} className={`sticky top-0 w-full flex space-x-1 overflow-hidden bg-body md:border-l md:border-r border-b border-line p-2`}>
          {activeStoryProfiles && activeStoryProfiles.length > 0 ? (
            activeStoryProfiles.map((profile) => (
              <img key={profile.id} src={`${profile.avatar_url}?t=${Date.now()}`} onClick={() => router.push(`/stories/${profile.username}`)} className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right border-2 border-pink-500 cursor-pointer" alt="story avatar"/>
            ))
          ) : (
            <p className="h-10 text-sm text-text flex items-center mx-auto">No active stories.</p>
          )}
        </div>
        {!posts.length && (
          <p className="text-sm text-text p-4">No posts yet.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="md:border-l border-b md:border-r border-line w-full bg-body">
            <Link href={`/user/${post.username}`} className="flex flex-row items-center space-x-2 px-4">
              <img className="w-6 h-6 object-cover object-top-right rounded-full" src={`${post.avatar_url}?t=${Date.now()}`} alt="user avatar"/>
              <div className="py-3 font-bold text-sm text-lead hover:underline">{post.username}</div>
            </Link>

            <div className="w-full flex justify-center items-center px-4">
              <img src={post.image_url} alt={post.caption} className="w-full object-cover rounded-lg"/>
            </div>

            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleLike(post)}>
                    {loadingLike && openLike === post.id ? (
                      <div className="w-6 h-6 border-2 border-line border-t-lead rounded-full animate-spin"></div>
                    ) : (
                      <Heart size={24} strokeWidth={2} className={`transition cursor-pointer ${post.hasLiked ? "fill-red-500 text-red-500" : "text-subs hover:text-red-500"}`}/>
                    )}
                  </button>

                  <span className="text-sm font-bold text-subs">{post.likeCount}</span>

                  <span className="text-xl text-text px-1">·</span>

                  <MessageCircle size={24} className="cursor-pointer text-subs hover:text-lead transition" onClick={() => {
                    if (openComments === post.id) {
                      setOpenComments(null);
                    } else {
                      setOpenComments(post.id);
                      fetchComments(post.id);
                    }}}/>
                  <span className="text-sm font-bold text-subs">{post.commentCount}</span>
                  <span className="text-xl text-text px-1">·</span>
                  <Forward size={24} onClick={() => handleCopyLink(post.id)} className="cursor-pointer text-subs hover:text-lead transition" />
                </div>

                <span className="text-xs text-text font-medium">{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
              </div>

              {openComments === post.id && (
                <>
                  <div className="w-full px-2 py-4 space-y-2">
                    {loadingComments ? (
                      <div className="w-6 h-6 border-2 border-line border-t-lead rounded-full animate-spin"></div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-2">
                          <img src={`${comment.avatar_url}?t=${Date.now()}`} className="w-6 h-6 object-cover object-top-right rounded-full"/>
                          <div className="-mt-0.5">
                            <span className="font-semibold text-sm text-lead">{comment.username}</span>
                            <p className="text-xs text-subs font-medium">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="font-semibold text-xs text-subs">No comments yet.</p>
                    )}
                  </div>
                  <form onSubmit={(e) => handleCommentPost(e, post.id)} className="w-full flex flex-col items-center space-y-2">
                    <input type="text" placeholder="Write a comment..." value={postComment} onChange={(e) => setPostComment(e.target.value)} className="w-full px-3 py-2 text-sm text-text rounded-md border border-line outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                    <button type="submit" className="w-full py-2 text-sm rounded-md active:scale-95 p-3 font-semibold text-body bg-main hover:bg-main/90 cursor-pointer transition">Send</button>
                  </form>
                </>
              )}

              <p className="mt-4 text-sm text-lead">{post.caption}</p>
            </div>
          </div>
        ))}
        {posts.length !== 0 && (
          <p className="py-8 text-sm text-text mx-auto">You're all caught up.</p>
        )}
      </div>
    </div>
  );
}