import supabase from "@/lib/supabase";
import PostClient from "./PostClient";

export default async function PostPage({ params }) {
  const { postId } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen flex justify-center items-center">Post not found!</div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", post.user_id)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center">User not found!</div>
    );
  }

  const { data: likes } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", post.id);

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post.id);

  const enrichedPost = {
    ...post,
    likeCount: likes.length,
    commentCount: comments.length,
    hasLiked: false,
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-4 gap-x-2 bg-background">
      <PostClient post={enrichedPost} profile={profile} />
    </div>
  );
}