import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DatabaseStatusProps {
  className?: string;
}

export function DatabaseStatus({ className }: DatabaseStatusProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/status"],
    staleTime: 60000, // 1 minute
  });

  return (
    <Card className={`${className} mb-8`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-gray-800">Database Connection Status</CardTitle>
        {isLoading ? (
          <Skeleton className="h-8 w-28 rounded-full" />
        ) : error ? (
          <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"></span>
            Disconnected
          </span>
        ) : data?.connected ? (
          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
            Connected
          </span>
        ) : (
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
            Reconnecting
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-500">Database Type</div>
            {isLoading ? (
              <Skeleton className="h-6 w-36 mt-1" />
            ) : (
              <div className="mt-1 text-lg font-semibold">{data?.type || "Unknown"}</div>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-500">Connection Pool</div>
            {isLoading ? (
              <Skeleton className="h-6 w-36 mt-1" />
            ) : (
              <div className="mt-1 text-lg font-semibold">
                Active: {data?.connectionPool?.active || 0} / Max: {data?.connectionPool?.max || 0}
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-500">Schema</div>
            {isLoading ? (
              <Skeleton className="h-6 w-36 mt-1" />
            ) : (
              <div className="mt-1 text-lg font-semibold">{data?.schema || "Unknown"}</div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Recent Database Activity</h3>
          <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <pre className="text-xs text-gray-600">
                {data?.recentActivity?.join("\n") || "No recent activity"}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
