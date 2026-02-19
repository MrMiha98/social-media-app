"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Forward, Heart, MessageCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function PostClient({ post, profile }) {
  // loading animations
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // comments opened or not
  const [openComments, setOpenComments] = useState(null);

  // currently logged in users id
  const [currentUserId, setCurrentUserId] = useState(null);

  // save the receives post from the props locally
  const [localPost, setLocalPost] = useState(post);

  // hold the text for the comment about to be posted
  const [postComment, setPostComment] = useState("");

  // hold all the comments on this specific post
  const [comments, setComments] = useState([]);

  // get all the profiles
  const [posts, setPosts] = useState([]); 

  // get the currently logged in users id
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }
    };

    checkUser();
  }, []);

  // check if the currently logged in user has already liked the post
  useEffect(() => {
    const checkHasLiked = async () => {
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
        setLocalPost(prev => ({
          ...prev,
          hasLiked: true,
        }));
      }
    };

    checkHasLiked();
  }, [currentUserId, post.id]);

  // handle liking
  const toggleLike = async (post) => {
    setLoadingLike(true);

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

      setLocalPost(prev => ({
        ...prev,
        likeCount: prev.likeCount - 1,
        hasLiked: false,
      }));
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      });

      setLocalPost(prev => ({
        ...prev,
        likeCount: prev.likeCount + 1,
        hasLiked: true,
      }));
    }

    setLoadingLike(false);
  };

  // handle getting the comments on this specific post
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

    setPosts(profilesData);

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
      .insert({ post_id: postId, user_id: currentUserId, content: postComment })
      .select()
      .single()

    if (error) {
      console.log(error);
      return;
    }

    const enrichedComment = {
      ...newComment,

      username: posts.find((p) => 
        p.id === newComment.user_id
      )?.username,
      
      avatar_url: posts.find((p) => 
        p.id === newComment.user_id
      )?.avatar_url,
    };

    setComments((prevComments) => [...prevComments, enrichedComment]);

    setPostComment("");
  };

  return (
    <>
      <Sidebar />
      <div className={`flex flex-col w-full md:max-w-md mb-14 md:mb-0`}>
        <div key={localPost.id} className="border-l border-b border-r border-line w-full bg-body">
          <Link href={`/user/${profile.username}`} className="flex flex-row items-center space-x-2 px-4 hover:underline">
            <img className="w-6 h-6 object-cover object-top-right rounded-full" src={`${profile.avatar_url}?t=${Date.now()}`} alt="user avatar"/>
            <div className="py-3 font-bold text-sm text-lead">{profile.username}</div>
          </Link>

          <div className="w-full flex justify-center items-center px-4">
            <img src={localPost.image_url} alt={localPost.caption} className="w-full object-cover rounded-lg"/>
          </div>

          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleLike(localPost)}>
                  {loadingLike ? (
                    <div className="w-6 h-6 border-2 border-line border-t-lead rounded-full animate-spin"></div>
                  ) : (
                    <Heart size={24} strokeWidth={2} className={`transition cursor-pointer ${localPost.hasLiked ? "fill-red-500 text-red-500" : "text-subs hover:text-red-500"}`}/>
                  )}
                </button>

                <span className="text-sm font-bold text-subs">{localPost.likeCount}</span>

                <span className="text-xl text-text px-1">·</span>

                <MessageCircle size={24} className="cursor-pointer text-subs hover:text-lead transition" onClick={() => {
                  if (openComments === localPost.id) {
                    setOpenComments(null);
                  } else {
                    setOpenComments(localPost.id);
                    fetchComments(localPost.id);
                  }}}/>
                <span className="text-sm font-bold text-subs">{localPost.commentCount}</span>
                <span className="text-xl text-text px-1">·</span>
                <Forward size={24} onClick={() => handleCopyLink(localPost.id)} className="cursor-pointer text-subs hover:text-lead transition" />
              </div>

              <span className="text-xs text-text font-medium">{new Date(localPost.created_at).toLocaleDateString("en-GB")}</span>
            </div>

            {openComments === localPost.id && (
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
                <form onSubmit={(e) => handleCommentPost(e, localPost.id)} className="w-full flex flex-col items-center space-y-2">
                  <input type="text" placeholder="Write a comment..." value={postComment} onChange={(e) => setPostComment(e.target.value)} className="w-full px-3 py-2 text-sm text-text rounded-md border border-line outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                  <button type="submit" className="w-full py-2 text-sm rounded-md active:scale-95 p-3 font-semibold text-body bg-main hover:bg-main/90 cursor-pointer transition">Send</button>
                </form>
              </>
            )}

            <p className="mt-4 text-sm text-lead">{localPost.caption}</p>
          </div>
        </div>
      </div>
    </>
  );
}