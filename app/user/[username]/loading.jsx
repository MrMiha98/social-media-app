import Skeleton from "@/components/Skeleton";
import Sidebar from "@/components/Sidebar";

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-start space-x-2 bg-mute">
      <Sidebar />
      <div className="min-h-screen bg-body md:border-l md:border-r border-line p-6 w-full md:max-w-md relative">
        <div className="absolute left-0 top-0 right-0 w-full h-20 z-0"></div>
        <div className="flex items-start space-x-5">
          <label className="w-28 h-28 rounded-full overflow-hidden shrink-0 relative">
            <Skeleton className="h-full w-full" />
          </label>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <Skeleton className="py-2 w-10 rounded-full"/>
            </div>
            <Skeleton className="mt-2 py-2 w-24 rounded-full"/>
            <div className="mt-3">
              <div className="flex justify-between items-start gap-3">
                <Skeleton className="py-2 w-10 rounded-full"/>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="aspect-square overflow-hidden rounded-sm">
            <Skeleton className="w-full h-full"/>
          </div>
          <div className="aspect-square overflow-hidden rounded-sm">
            <Skeleton className="w-full h-full"/>
          </div>
          <div className="aspect-square overflow-hidden rounded-sm">
            <Skeleton className="w-full h-full"/>
          </div>
          <div className="aspect-square overflow-hidden rounded-sm">
            <Skeleton className="w-full h-full"/>
          </div>
        </div>
      </div>
    </div>
  );
}