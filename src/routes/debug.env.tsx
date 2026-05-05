import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/debug/env")({
  component: DebugEnv,
});

function DebugEnv() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h1>Environment Variables Debug</h1>
      <p>
        VITE_SUPABASE_URL:{" "}
        {import.meta.env.VITE_SUPABASE_URL || "NOT SET"}
      </p>
      <p>
        VITE_GSUBZ_API_KEY:{" "}
        {import.meta.env.VITE_GSUBZ_API_KEY
          ? import.meta.env.VITE_GSUBZ_API_KEY.substring(0, 20) + "..."
          : "NOT SET"}
      </p>
      <p>
        VITE_GSUBZ_WIDGET_KEY:{" "}
        {import.meta.env.VITE_GSUBZ_WIDGET_KEY
          ? import.meta.env.VITE_GSUBZ_WIDGET_KEY.substring(0, 20) + "..."
          : "NOT SET"}
      </p>
      <hr />
      <p>Full import.meta.env:</p>
      <p>{JSON.stringify(import.meta.env, null, 2)}</p>
    </div>
  );
}
