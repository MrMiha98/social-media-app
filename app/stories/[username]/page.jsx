import supabase from "@/lib/supabase";
import StoryViewerClient from "./StoryViewerClient";

export default async function StoryPage({ params }) {
  const { username } = await params;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("username", username)
    .single()

  if (profileError) {
    console.log("Unable to retrieve user: ", profileError);
    return;
  }

  // fetch the stories of a selected user
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: storiesData, error: storiesError } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", profileData.id)
    .gte("created_at", twentyFourHoursAgo.toISOString())
    .order("created_at", { ascending: true });

  if (storiesError) {
    console.log("Error fetching stories:", storiesError);
    return;
  }

  return (
    !storiesData || storiesData.length === 0 ? (
      <div className="min-h-screen p-4 flex justify-center bg-background text-gray-500">User doesn't have any active stories.</div>
    ) : (
      <StoryViewerClient profile={profileData} stories={storiesData}/>
    )
  );
}