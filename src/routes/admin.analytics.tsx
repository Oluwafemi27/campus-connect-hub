import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

function AdminAnalytics() {
  useAuthGuard();
  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Analytics & Insights</h1>

      <div className="glass rounded-2xl p-8 text-center space-y-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <p className="text-lg font-semibold">No Analytics Data Yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics and insights will appear here as users interact with the app
          </p>
        </div>
      </div>
    </div>
  );
}
