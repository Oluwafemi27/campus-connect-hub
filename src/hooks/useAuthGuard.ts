import { useAuth } from "@/contexts/AuthContext";

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  // Simply return auth status - don't redirect
  // Navigation should be handled at route/app level
  return { isLoading, isAuthenticated };
}
