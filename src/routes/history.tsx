import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { History as HistoryIcon } from "lucide-react";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  useAuthGuard();

  return (
    <>
      <TopBar title="HISTORY" />
      <h1 className="mb-4 text-2xl font-bold">
        Transaction <span className="gradient-text">History</span>
      </h1>
      <div className="glass flex flex-col items-center justify-center rounded-3xl p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <HistoryIcon className="h-7 w-7 text-primary" />
        </div>
        <p className="text-base font-semibold">No transactions yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Your purchases will appear here.</p>
      </div>
    </>
  );
}
