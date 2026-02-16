export const dynamic = "force-dynamic";
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

  // calculate 24 hours ago
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // fetch active stories (last 24h)
  const { data: activeStories, error: storiesError } = await supabase
    .from("stories")
    .select("user_id")
    .gte("created_at", twentyFourHoursAgo.toISOString());

  // check for errors
  if (postsError || profilesError || likesError || commentsError || storiesError) {
    console.log("Error fetching data:", {
      postsError,
      profilesError,
      likesError,
      commentsError,
    });

    return <div>Something went wrong loading the feed.</div>;
  }

  // get unique user ids that have active stories
  const activeUserIds = [...new Set(activeStories.map(story => story.user_id))];

  // get all the data for a user with an active story
  const activeStoryProfiles = profiles.filter(profile =>
    activeUserIds.includes(profile.id)
  );

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
    <FeedClient initialPosts={postsWithLikeAndCommentData} likes={likes} activeStoryProfiles={activeStoryProfiles} />
  );
}