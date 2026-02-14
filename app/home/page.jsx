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
  const [openComments, setOpenComments] = useState(null);
  const [openLike, setOpenLike] = useState(null);
  const [comments, setComments] = useState([]);
  const [postComment, setPostComment] = useState("");
  const [profilesOnPost, setProfilesOnPost] = useState([]); 
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

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
          .select("id, username, avatar_url");

        if (profilesError) {
          setFetchError(profilesError.message);
        }

        const { data: likes, error: likesError } = await supabase
          .from("likes")
          .select("post_id, user_id");

        if (likesError) {
          setFetchError(likesError.message);
        }

        const { data: comments, error: commentsError } = await supabase
          .from("comments")
          .select("post_id")

        if (commentsError) {
          setFetchError(commentsError.message);
        }
        
        const postsWithLikeAndCommentData = posts.map((post) => {
          return {
            ...post,

            username: profiles.find((profile) =>
              post.user_id === profile.id
            )?.username,

            avatar_url: profiles.find((profile) =>
              post.user_id === profile.id
            )?.avatar_url,

            likeCount: likes.filter((like) =>
              like.post_id === post.id
            ).length,
            
            hasLiked: likes.some((like) => 
              like.user_id === currentUserId && like.post_id === post.id
            ),

            commentCount: comments.filter((comment) => 
              comment.post_id === post.id
            ).length
          };
        });

        setPosts(postsWithLikeAndCommentData);
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
    setOpenLike(post.id);
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

    setOpenLike(null);
    setLoadingLike(false);
  };

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
      username: profilesOnPost.find((p) => p.id === newComment.user_id)?.username,
      avatar_url: profilesOnPost.find((p) => p.id === newComment.user_id)?.avatar_url,
    };

    setComments((prevComments) => [...prevComments, enrichedComment]);

    setPostComment("");
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-4 gap-x-2 bg-background text-foreground">
      { loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background text-gray-900">Checking authentication...</div>
      ) : fetchingPosts ? (
        <div className="min-h-screen flex items-center justify-center bg-background text-gray-900">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : fetchError ? (
        <p className="text-red-500">Error fetching posts: {fetchError}</p>
      ) : posts.length === 0 ? (
        <>
          <Sidebar />
          <p className="text-gray-400 max-w-md w-full text-center">No posts yet.</p>
        </>
      ) : (
        <>
          <Sidebar />
          <div className="flex flex-col space-y-4 mb-14 md:mb-0">
            { posts.map((post) => (
              <div key={post.id} className="border border-line w-full max-w-md bg-white">
                <a href={`/${post.username}`} className="flex flex-row items-center space-x-2 px-2 hover:underline w-fit">
                  <img className="w-6 h-6 object-cover object-top-right rounded-full" src={post.avatar_url} alt="user avatar"/>
                  <div className="py-3 font-semibold text-sm">{post.username}</div>
                </a>

                <img src={post.image_url} alt={post.caption} className="w-full object-cover"/>

                <div className="px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => toggleLike(post)}>
                        { loadingLike && openLike === post.id ? (
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        ) : (
                          <Heart size={24} className={`transition cursor-pointer ${ post.hasLiked ? "fill-red-500 text-red-500" : "text-lightforeground hover:text-red-500" }`}/>
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
                    </div>

                    <span className="text-xs text-lightforeground">{new Date(post.created_at).toLocaleDateString("en-GB")}</span>
                  </div>

                  { openComments === post.id && (
                    <>
                      <div className="w-full max-h-64 overflow-auto overflow-x-hidden p-4">
                        { loadingComments ? (
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
                      <form onSubmit={(e) => handleCommentPost(e, post.id)} className="w-full flex items-center space-x-2">
                        <input type="text" placeholder="Write a comment..." value={postComment} onChange={(e) => setPostComment(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-line rounded-full focus:border-transparent outline-none focus:outline-none focus:ring-1 focus:ring-black/10"/>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-zinc-800 cursor-pointer transition active:scale-95">Send</button>
                      </form>
                    </>
                  )}

                  <p className="mt-2 text-sm text-gray-800">{post.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}