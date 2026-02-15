import FeedClient from "./FeedClient";
import supabase from "@/lib/supabase";

export default async function Page() {
  // fetch all posts
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  // fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url");

  // fetch all the likes
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select("post_id, user_id");

  // fetch all the comments so we can count how many comments each post has
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("post_id")

  // check for errors
  if (postsError || profilesError || likesError || commentsError) {
    console.log("Error fetching data:", {
      postsError,
      profilesError,
      likesError,
      commentsError,
    });

    return <div>Something went wrong loading the feed.</div>;
  }

  // for each post add additional variables
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
            
      commentCount: comments.filter((comment) => 
        comment.post_id === post.id
      ).length
    };
  });

  return (
    <FeedClient initialPosts={postsWithLikeAndCommentData} likes={likes} />
  );
}