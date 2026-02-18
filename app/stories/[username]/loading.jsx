import Skeleton from "@/components/Skeleton";
import { X } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen fixed inset-0 flex flex-col items-center bg-white">
      <div className="w-full flex justify-center border-b border-line">
        <div className="w-full max-w-md flex flex-row">
          <div className="flex-1">
            <div className="w-full flex justify-between items-center">
              <div className="w-fit flex items-center p-2 space-x-2">
                <Skeleton className="h-6 w-6 rounded-full"/>
                <Skeleton className="w-10 py-2 rounded-full"/>
              </div>
            </div>
            <div className="flex space-x-1 px-2 pb-2  border-b border-line">
              <Skeleton className="flex-1 h-0.5 rounded-full"/>
              <Skeleton className="flex-1 h-0.5 rounded-full"/>
              <Skeleton className="flex-1 h-0.5 rounded-full"/>
              <Skeleton className="flex-1 h-0.5 rounded-full"/>
            </div>
          </div>
          <div className="h-full aspect-square flex justify-center items-center border-b border-line">
            <X className="text-gray-200" size={32} strokeWidth={2}/>
          </div>
        </div>
      </div>
      <div className="h-full w-full flex justify-center items-center relative bg-background overflow-x-hidden select-none">
        <Skeleton className="h-full w-md absolute"/>
        <div className="absolute left-0 top-0 w-1/2 h-full"/>
        <div className="absolute right-0 top-0 w-1/2 h-full"/>
      </div>
    </div>
  );
}