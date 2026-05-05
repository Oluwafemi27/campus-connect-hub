import { createAPIFileRoute } from "@tanstack/react-start/api";
import { supabase } from "@/lib/supabase";

export const APIRoute = createAPIFileRoute("/api/auth")(
  {
    POST: async ({ request }) => {
      try {
        const body = await request.json();
        const { action, email, password, name, phone } = body;

        if (action === "login") {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              console.error("[Auth API] Login error:", error);
              return Response.json(
                { success: false, error: error.message },
                { status: 401 }
              );
            }

            console.log("[Auth API] Login successful for:", email);
            return Response.json({
              success: true,
              user: data.user,
              session: data.session,
            });
          } catch (err) {
            console.error("[Auth API] Login exception:", err);
            return Response.json(
              { success: false, error: err instanceof Error ? err.message : "Login failed" },
              { status: 500 }
            );
          }
        }

        if (action === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, phone },
              emailRedirectTo: `${new URL(request.url).origin}/`,
            },
          });

          if (error) {
            return Response.json(
              { success: false, error: error.message },
              { status: 400 }
            );
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

          return Response.json({
            success: true,
            user: data.user,
            session: data.session,
          });
        }

        if (action === "logout") {
          const { error } = await supabase.auth.signOut();

          if (error) {
            return Response.json(
              { success: false, error: error.message },
              { status: 400 }
            );
          }

          return Response.json({ success: true });
        }

        if (action === "get-session") {
          try {
            console.log("[Auth API] Getting session...");
            const { data, error } = await supabase.auth.getSession();

            if (error) {
              console.error("[Auth API] Get session error:", error);
              return Response.json(
                { success: false, error: error.message },
                { status: 400 }
              );
            }

            console.log("[Auth API] Session retrieved, user:", !!data.session?.user);
            return Response.json({
              success: true,
              session: data.session,
            });
          } catch (err) {
            console.error("[Auth API] Get session exception:", err);
            return Response.json(
              { success: false, error: err instanceof Error ? err.message : "Failed to get session" },
              { status: 500 }
            );
          }
        }

        return Response.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
      } catch (error) {
        console.error("Auth API error:", error);
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    },
  }
);
