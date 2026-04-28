import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function useAdminGuard() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate({ to: "/login", replace: true });
      } else if (!isAdmin) {
        navigate({ to: "/", replace: true });
      }
    }
  }, [isAdmin, isLoading, isAuthenticated, navigate]);

  return { isLoading, isAuthenticated, isAdmin };
}
