import { Link, createRootRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campus Connect — Data, Airtime, TV & Router" },
      {
        name: "description",
        content:
          "Buy data, airtime, TV subscriptions and connect to your campus router in one futuristic student app.",
      },
      { name: "author", content: "Campus Connect" },
      { property: "og:title", content: "Campus Connect — Data, Airtime, TV & Router" },
      {
        property: "og:description",
        content:
          "Buy data, airtime, TV subscriptions and connect to your campus router — all in one futuristic student app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@CampusConnect" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const isMissingVars =
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL.includes("placeholder") ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY.includes("placeholder");

  if (isMissingVars && !import.meta.env.DEV) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
        <p className="mt-2 text-muted-foreground">
          The application is missing required Supabase environment variables.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your deployment
          environment.
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="dark min-h-screen">
        <AppShell />
        <Toaster position="top-center" theme="dark" />
      </div>
    </AuthProvider>
  );
}
