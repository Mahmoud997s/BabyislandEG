import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TableSkeleton() {
    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[100px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>
            
            <div className="rounded-md border bg-white p-4">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex gap-4 border-b pb-4">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px] ml-auto" />
                        <Skeleton className="h-4 w-[50px]" />
                    </div>
                    
                    {/* Rows */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-3 w-[150px]" />
                            </div>
                            <Skeleton className="h-6 w-[80px]" />
                            <Skeleton className="h-8 w-[40px]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
