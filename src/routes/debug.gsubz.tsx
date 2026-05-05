import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/debug/gsubz")({
  component: DebugGsubz,
});

async function testGsubzConnection() {
  try {
    console.log("[Test] Starting Gsubz API test...");
    const apiKey = import.meta.env.VITE_GSUBZ_API_KEY;
    
    console.log("[Test] API Key configured:", apiKey ? "✓" : "✗");
    
    if (!apiKey) {
      throw new Error("VITE_GSUBZ_API_KEY is not configured");
    }

    const url = "https://app.gsubz.com/api/plans?service=mtn_cg";
    console.log("[Test] Testing URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api_key": apiKey,
      },
    });

    console.log("[Test] Response status:", response.status);
    const data = await response.json();
    console.log("[Test] Response data:", data);

    return {
      success: true,
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error("[Test] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function DebugGsubz() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    const testResult = await testGsubzConnection();
    setResult(testResult);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h1>Gsubz API Debug Test</h1>
      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Testing..." : "Test Gsubz API"}
      </button>

      {result && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <h2>{result.success ? "✓ Success" : "✗ Failed"}</h2>
          <p>{JSON.stringify(result, null, 2)}</p>
        </div>
      )}

      <hr />
      <h3>Check Browser Console</h3>
      <p>Open your browser's developer console (F12) and click the test button above.</p>
      <p>Look for [Test] messages to see detailed debugging output.</p>
    </div>
  );
}
