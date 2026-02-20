"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CircleChevronRight, CircleChevronLeft, X } from "lucide-react";

export default function StoryViewerClient({ profile, stories }) {
  const router = useRouter();

  // story states
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
            <Link href={`/user/${profile.username}`} className="flex flex-row items-center space-x-2 text-sm text-white font-bold hover:underline">
              <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover object-top-right" alt="User Avatar" />
              <span>{profile.username}</span>
            </Link>
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