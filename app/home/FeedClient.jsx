"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase";
import { Heart, MessageCircle, SendHorizonal, ChevronLeft, ChevronRight, X } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const isAtTop = ref.current.getBoundingClientRect().top <= 0;

      setIsStickyActive(prev => {
        if (prev !== isAtTop) return isAtTop;
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  // story states
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [selectedStoryUser, setSelectedStoryUser] = useState(null);
  const [loadingStories, setLoadingStories] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

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

  // fetch the stories of a selected user
  const fetchStoriesForUser = async (profile) => {
    setSelectedStoryUser(profile);
    setLoadingStories(true);
    setSelectedUserStories([]);
    setIsStoryViewerOpen(true);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", profile.id)
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Error fetching stories:", error);
      setLoadingStories(false);
      return;
    }

    setSelectedUserStories(data);
    setCurrentStoryIndex(0);
    setLoadingStories(false);
  };

  const goToNextStory = () => {
    if (currentStoryIndex < selectedUserStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setIsStoryViewerOpen(false);
      setSelectedStoryUser(null);
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-4 space-x-2 bg-background text-foreground">
      <Sidebar />
      <div className={`flex flex-col space-y-4 ${!posts.length && "w-full max-w-md justify-center items-center"} mb-14 md:mb-0`}>
        {!posts.length && (
          <p className="text-gray-700">No posts yet.</p>
        )}
        <div ref={ref} className={`sticky top-0 w-full max-w-md flex space-x-1 overflow-hidden bg-white border border-line p-2 overscroll-x-contain rounded-md ${isStickyActive ? "rounded-none" : "rounded-md"}`}>
          {activeStoryProfiles && activeStoryProfiles.length > 0 ? (
            activeStoryProfiles.map((profile) => (
              <img key={profile.id} src={`${profile.avatar_url}?t=${Date.now()}`} onClick={() => fetchStoriesForUser(profile)} className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right border-2 border-pink-500 cursor-pointer" alt="story avatar"/>
            ))
          ) : (
            <p className="text-sm text-gray-500">No active stories.</p>
          )}
        </div>
        {posts.map((post) => (
          <div key={post.id} className="border border-line w-full max-w-md bg-white rounded-md">
            <Link href={`/user/${post.username}`} className="flex flex-row items-center space-x-2 px-2 hover:underline w-fit">
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
                  <div className="w-full max-h-64 overflow-auto overflow-x-hidden p-4">
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

              <p className="mt-2 text-sm text-gray-800">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
      {isStoryViewerOpen && (
        <div className="h-screen fixed inset-0 flex flex-col">
          {loadingStories ? (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
              <div className="w-6 h-6 border-2 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="w-full flex justify-between items-center bg-white">
                <div className="w-fit flex items-center p-2 space-x-2">
                  <img src={selectedStoryUser.avatar_url} className="h-6 w-6 rounded-full object-cover object-top-right"/>
                  <span className="font-semibold text-sm">{selectedStoryUser.username}</span>
                </div>
                <X className="cursor-pointer mr-2" strokeWidth={3} onClick={() => {setIsStoryViewerOpen(null); setSelectedStoryUser(null)}}/>
              </div>
              <div className="flex space-x-1 px-2 pb-2 bg-white border-b border-line">
                {selectedUserStories.map((_, index) => (
                  <div key={index} className={`flex-1 h-1 rounded-full ${
                    index <= currentStoryIndex
                      ? "bg-black"
                      : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="h-full w-full flex justify-center items-center relative bg-background overflow-x-hidden select-none">
                <img src={selectedUserStories[currentStoryIndex].image_url} className="h-full w-full object-contain absolute" alt="story"/>
                <div className="absolute left-0 top-0 w-1/2 h-full" onClick={goToPreviousStory}/>
                <div className="absolute right-0 top-0 w-1/2 h-full" onClick={goToNextStory}/>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}