import Skeleton from "@/components/Skeleton";
import { X } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen flex justify-center items-center md:p-4 bg-[rgb(016,016,019)]">
      <X size={40} strokeWidth={2} className="hidden md:block absolute right-4 top-4 md:text-text hover:text-white transition cursor-pointer"/>
      <div className="h-full w-full md:w-auto md:aspect-9/16 relative flex items-center rounded-2xl bg-[rgb(024,024,027)] md:border md:border-[rgb(047,047,052)]">
        <div className="absolute inset-0 w-full h-fit p-4 space-y-4">
          <div className="flex space-x-1 px-2">
              <Skeleton className="flex-1 h-1 rounded-full transition"/>
              <Skeleton className="flex-1 h-1 rounded-full transition"/>
              <Skeleton className="flex-1 h-1 rounded-full transition"/>
          </div>
          <div className="h-fit flex flex-row justify-between">
            <div className="flex flex-row items-center space-x-2 text-sm text-white font-bold hover:underline">
              <Skeleton className="h-10 w-10 rounded-full object-cover object-top-right" alt="User Avatar" />
              <Skeleton className="py-2 w-10 rounded-full" />
            </div>
            <X strokeWidth={2} size={40} className="md:hidden -mr-2 text-white/80"/>
          </div>
        </div>
        <div className="h-full w-full flex justify-center items-center md:rounded-2xl overflow-hidden select-none">
          <Skeleton className="h-128 w-full object-contain" alt="Story Image" />
        </div>
        <div size={40} strokeWidth={2} className="absolute left-2 md:-left-18 text-white/80 md:text-text md:hover:text-white transition cursor-pointer" />
        <div size={40} strokeWidth={2} className="absolute right-2 md:-right-18 text-white/80 md:text-text md:hover:text-white transition cursor-pointer" />
      </div>
    </div>
  );
}