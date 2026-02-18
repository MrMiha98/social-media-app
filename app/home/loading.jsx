import Skeleton from "@/components/Skeleton";
import Sidebar from "@/components/Sidebar";

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-start px-4 space-x-2 bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col w-full max-w-md mb-14 md:mb-0">
        <div className="sticky top-0 w-full max-w-md flex space-x-1 overflow-hidden bg-white border-l border-r border-b border-line p-2">
          <Skeleton className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right cursor-pointer"/>
          <Skeleton className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right cursor-pointer"/>
          <Skeleton className="w-10 h-10 shrink-0 rounded-full object-cover object-top-right cursor-pointer"/>
        </div>
        <div className="border-l border-b border-r border-line w-full max-w-md bg-white">
          <div className="flex flex-row items-center space-x-2 px-2 py-2 hover:underline">
            <Skeleton className="w-6 h-6 object-cover object-top-right rounded-full"/>
            <Skeleton className="py-2 font-semibold text-sm w-10 rounded-full"/>
          </div>

          <Skeleton className="w-full h-128"/>

          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button>
                  <Skeleton className="cursor-pointer"/>
                </button>

                <Skeleton className="text-sm font-bold text-gray-700 py-2 w-6 aspect-square rounded-full"/>

                <Skeleton className="cursor-pointer text-lightforeground ml-2 py-2 w-8 rounded-full"/>
                <Skeleton className="text-sm font-bold text-gray-700  w-6 aspect-square rounded-full py-2"/>
                <Skeleton className="cursor-pointer text-lightforeground py-2 w-8 transition ml-2 rounded-full"/>
              </div>

              <Skeleton className="text-xs text-lightforeground py-2 w-10 rounded-full"/>
            </div>

            <Skeleton className="mt-4 text-sm text-gray-800 py-2 w-10 rounded-full"/>
          </div>
        </div>
      </div>
    </div>
  );
}