import Sidebar from '@/components/Sidebar';
import ProfileClient from './ProfileClient';
import supabase from '@/lib/supabase';

export default async function UserProfilePage({ params }) {
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background text-foreground">User not found!</div>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, image_url")
    .eq("user_id", profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex justify-center items-start p-4 gap-x-2 bg-background">
      <Sidebar />
      <ProfileClient profile={profile} posts={posts || []} />
    </div>
  );
}