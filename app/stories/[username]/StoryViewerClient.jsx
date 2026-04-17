"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CircleChevronRight, CircleChevronLeft, X } from "lucide-react";

export default function StoryViewerClient({ profile, stories }) {
  const router = useRouter();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const formatStoryTime = (createdAt) => {
    const now = new Date();
    const storyDate = new Date(createdAt);

    const differenceInMs = now.getTime() - storyDate.getTime();

    const differenceInMinutes = differenceInMs / (1000 * 60);

    if (differenceInMinutes < 60) {
      const minutes = Math.floor(differenceInMinutes);
      return minutes + (minutes === 1 ? " min ago" : " mins ago");
    }

    const differenceInHours = differenceInMinutes / 60;
    const hours = Math.floor(differenceInHours);

    return hours + (hours === 1 ? " h ago" : " h ago");
  };

  return (
    <div className="h-screen flex justify-center items-center md:p-4 bg-[rgb(016,016,019)]">
      <X size={40} strokeWidth={2} className="hidden md:block absolute right-4 top-4 md:text-text hover:text-white transition cursor-pointer" onClick={() => router.back()}/>
      <div className="h-full w-full md:w-auto md:aspect-9/16 relative flex items-center rounded-2xl bg-[rgb(024,024,027)] md:border md:border-[rgb(047,047,052)]">
        <div className="absolute inset-0 w-full h-fit p-4 space-y-4">
          <div className="flex space-x-1 px-2">
            {stories.map((_, index) => (
              <div key={index} className={`flex-1 h-1 rounded-full transition ${
                index <= currentStoryIndex
                  ? "bg-white/80"
                  : "bg-[rgb(244,244,245)]/10"
                }`}
              />
            ))}
          </div>
          <div className="h-fit flex flex-row justify-between">
            <div className="w-full flex flex-row items-center justify-between space-x-2 text-sm font-bold select-none">
              <Link href={`/user/${profile.username}`}>
                <div className="flex flex-row items-center">
                  <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover object-top-right" alt="User Avatar" />
                  <span className="pl-3 text-white hover:underline">{profile.username}</span>
                </div>
              </Link>
              <div className="text-text">{formatStoryTime(stories[currentStoryIndex].created_at)}</div>
            </div>
            <X strokeWidth={2} size={40} className="md:hidden -mr-2 text-white/80" onClick={() => router.back()}/>
          </div>
        </div>
        <div className="h-full w-full md:rounded-2xl overflow-hidden select-none">
          <img src={stories[currentStoryIndex].image_url} className="h-full w-full object-contain" alt="Story Image" />
        </div>
        <CircleChevronLeft size={40} strokeWidth={2} className="absolute left-2 md:-left-18 text-white/80 md:text-text md:hover:text-white transition cursor-pointer" onClick={goToPreviousStory}/>
        <CircleChevronRight size={40} strokeWidth={2} className="absolute right-2 md:-right-18 text-white/80 md:text-text md:hover:text-white transition cursor-pointer" onClick={goToNextStory}/>
      </div>
    </div>
  );
}