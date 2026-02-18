"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Heart, MessageCircle } from "lucide-react";
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
      <div key={localPost.id} className="w-full max-w-md border border-line bg-white text-foreground mb-14 md:mb-0">
        <Link href={`/user/${profile.username}`} className="flex flex-row items-center space-x-2 px-2 hover:underline w-fit">
          <img className="w-6 h-6 object-cover object-top-right rounded-full" src={profile.avatar_url} alt="user avatar"/>
          <div className="py-3 font-semibold text-sm">{profile.username}</div>
        </Link>

        <img src={localPost.image_url} alt={localPost.caption} className="w-full object-cover"/>

        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button onClick={() => toggleLike(localPost)}>
                { loadingLike ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <Heart size={24} className={`transition cursor-pointer ${ localPost.hasLiked ? "fill-red-500 text-red-500" : "text-lightforeground hover:text-red-500" }`}/>
                )}
              </button>

              <span className="text-sm font-bold text-gray-700">{localPost.likeCount}</span>

              <MessageCircle size={24} className="cursor-pointer text-lightforeground hover:text-pink-500 ml-2" onClick={() => {
                if (openComments) {
                  setOpenComments(false);
                } else {
                  setOpenComments(true);
                  fetchComments(localPost.id);
                }}}/>
              <span className="text-sm font-bold text-gray-700">{localPost.commentCount}</span>
            </div>

            <span className="text-xs text-lightforeground">{new Date(localPost.created_at).toLocaleDateString("en-GB")}</span>
          </div>

          {openComments && (
            <>
              <div className="w-full max-h-64 overflow-auto overflow-x-hidden p-4">
                {loadingComments ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-2">
                      <img src={comment.avatar_url} className="w-6 h-6 object-cover object-top-right rounded-full"/>
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
              <form onSubmit={(e) => handleCommentPost(e, localPost.id)} className="w-full flex items-center space-x-2">
                <input type="text" placeholder="Write a comment..." value={postComment} onChange={(e) => setPostComment(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-line rounded-full focus:border-transparent outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-zinc-800 cursor-pointer transition active:scale-95">Send</button>
              </form>
            </>
          )}

          <p className="mt-4 text-sm text-gray-800">{localPost.caption}</p>
        </div>
      </div>
    </>
  );
}