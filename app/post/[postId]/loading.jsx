import Sidebar from "@/components/Sidebar";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-start px-4 space-x-2 bg-background">
      <Sidebar />
      <div className="w-full max-w-md border border-line bg-white text-foreground mb-14 md:mb-0">
        <div className="flex flex-row items-center space-x-2 px-2 py-2 w-fit">
          <Skeleton className="w-6 h-6 object-cover object-top-right rounded-full"/>
          <Skeleton className="py-2 font-semibold text-sm w-10 rounded-full"/>
        </div>
        <Skeleton className="w-full h-128"/>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button>
                <Skeleton className="h-8 aspect-square rounded-full"/>
              </button>
              <span className="text-sm font-bold text-gray-700"></span>
              <Skeleton className="h-8 aspect-square rounded-full"/>
              <span className="text-sm font-bold text-gray-700"></span>
            </div>
            <Skeleton className="text-xs text-lightforeground w-10 py-2 rounded-full"/>
          </div>
          <Skeleton className="mt-4 text-sm text-gray-800 w-10 py-2 rounded-full"/>
        </div>
      </div>
    </div>
  );
}