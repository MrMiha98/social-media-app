import Skeleton from "@/components/Skeleton";
import Sidebar from "@/components/Sidebar";

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-start space-x-2 bg-mute">
      <Sidebar />
      <div className="flex flex-col w-full md:max-w-md mb-14 md:mb-0">
        <div className="sticky top-0 w-full flex space-x-1 overflow-hidden bg-body border-l border-r border-b border-line p-2">
          <Skeleton className="w-10 h-10 shrink-0 rounded-full"/>
          <Skeleton className="w-10 h-10 shrink-0 rounded-full"/>
          <Skeleton className="w-10 h-10 shrink-0 rounded-full"/>
        </div>
        <div className="border-l border-b border-r border-line w-full bg-body">
          <div className="flex flex-row items-center space-x-2 px-4 py-3">
            <Skeleton className="w-6 h-6 rounded-full"/>
            <Skeleton className="h-3 w-10 rounded-full"/>
          </div>
          <div className="w-full flex justify-center items-center px-4">
              <Skeleton className="w-full h-128 rounded-lg"/>
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Skeleton className="py-3 w-64 rounded-full"/>
              </div>
              <Skeleton className="py-2 w-10 rounded-full"/>
            </div>
            <Skeleton className="mt-4 text-sm py-2 w-10 rounded-full"/>
          </div>
        </div>
      </div>
    </div>
  );
}