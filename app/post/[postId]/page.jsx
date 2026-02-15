import supabase from "@/lib/supabase";
import PostClient from "./PostClient";

export default async function PostPage({ params }) {
  // get the dynamic postId url
  const { postId } = await params;

  // get all the data for this specific post
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

  // get the data of the posts user
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

  // get all the likes for this post
  const { data: likes } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", post.id);

  // get all the comments for this post
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post.id);


  // enrich the final post data
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