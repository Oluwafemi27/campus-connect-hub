"use server";

import { supabase } from "@/lib/supabase";

export interface AuthResponse {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log("[Auth Server] Login attempt for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth Server] Login error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("[Auth Server] Login successful for:", email);
    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err) {
    console.error("[Auth Server] Login exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Login failed",
    };
  }
}

export async function signupUser(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<AuthResponse> {
  try {
    console.log("[Auth Server] Signup attempt for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: "https://campusconnecthub.example.com/",
      },
    });

    if (error) {
      console.error("[Auth Server] Signup error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        phone: phone || null,
        created_at: new Date().toISOString(),
        status: "active",
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
    }

    console.log("[Auth Server] Signup successful for:", email);
    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err) {
    console.error("[Auth Server] Signup exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Signup failed",
    };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    console.log("[Auth Server] Logout attempt");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[Auth Server] Logout error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("[Auth Server] Logout successful");
    return {
      success: true,
    };
  } catch (err) {
    console.error("[Auth Server] Logout exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Logout failed",
    };
  }
}

export async function getSession(): Promise<AuthResponse> {
  try {
    console.log("[Auth Server] Getting session...");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("[Auth Server] Get session error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("[Auth Server] Session retrieved, user:", !!data.session?.user);
    return {
      success: true,
      session: data.session,
    };
  } catch (err) {
    console.error("[Auth Server] Get session exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get session",
    };
  }
}
