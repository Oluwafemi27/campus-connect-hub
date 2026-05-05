import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { loginUser, signupUser, logoutUser, getSession } from "@/server/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
      ) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getSession();
        if (result.success && result.session?.user) {
          const adminRole =
            result.session.user.user_metadata?.admin === true ||
            result.session.user.user_metadata?.role === "admin";
          setUser({
            id: result.session.user.id,
            name:
              result.session.user.user_metadata?.name || result.session.user.email?.split("@")[0] || "",
            email: result.session.user.email || "",
            phone: result.session.user.user_metadata?.phone,
          });
          setIsAdmin(adminRole);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes (for client-side auth state changes)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const adminRole =
          session.user.user_metadata?.admin === true ||
          session.user.user_metadata?.role === "admin";
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
          email: session.user.email || "",
          phone: session.user.user_metadata?.phone,
        });
        setIsAdmin(adminRole);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      if (result.user) {
        setUser({
          id: result.user.id,
          name: result.user.user_metadata?.name || email.split("@")[0],
          email: result.user.email || email,
          phone: result.user.user_metadata?.phone,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      setIsLoading(true);
      try {
        const result = await signupUser(email, password, name, phone);

        if (!result.success) {
          throw new Error(result.error || "Signup failed");
        }

        if (result.user) {
          setUser({
            id: result.user.id,
            name,
            email,
            phone,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await logoutUser();

      if (!result.success) {
        throw new Error(result.error || "Logout failed");
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isAdmin, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
