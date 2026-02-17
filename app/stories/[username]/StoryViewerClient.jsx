"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="h-screen fixed inset-0 flex flex-col items-center bg-white">
      <div className="w-full flex justify-center border-b border-line">
        <div className="w-full max-w-md flex flex-row">
          <div className="flex-1">
            <div className="w-full flex justify-between items-center">
              <div className="w-fit flex items-center p-2 space-x-2">
                <img src={profile.avatar_url} className="h-6 w-6 rounded-full object-cover object-top-right"/>
                <span className="font-semibold text-sm text-foreground">{profile.username}</span>
              </div>
            </div>
            <div className="flex space-x-1 px-2 pb-2  border-b border-line">
              {stories.map((_, index) => (
                <div key={index} className={`flex-1 h-0.5 rounded-full transition ${
                  index <= currentStoryIndex
                    ? "bg-black"
                    : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="h-full aspect-square flex justify-center items-center border-b border-line cursor-pointer">
            <X className={`${currentStoryIndex === stories.length - 1 ? "text-black" : "text-gray-200"} transition`} size={32} strokeWidth={2} onClick={() => router.back()}/>
          </div>
        </div>
      </div>
      <div className="h-full w-full flex justify-center items-center relative bg-background overflow-x-hidden select-none">
        <img src={stories[currentStoryIndex].image_url} className="h-full w-full object-contain absolute" alt="story"/>
        <div className="absolute left-0 top-0 w-1/2 h-full" onClick={goToPreviousStory}/>
        <div className="absolute right-0 top-0 w-1/2 h-full" onClick={goToNextStory}/>
      </div>
    </div>
  );
}