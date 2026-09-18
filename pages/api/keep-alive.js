import supabase from "../../lib/supabaseClient";

/**
 * GET /api/keep-alive
 * Pings the Supabase database to prevent the free-tier project from pausing.
 * Called every 3 days by the Vercel Cron Job defined in vercel.json.
 */
export default async function handler(req, res) {
  try {
    // Lightweight ping — just fetch 1 row from categories
    const { error } = await supabase
      .from("categories")
      .select("name")
      .limit(1);

    if (error) {
      console.error("[keep-alive] Supabase ping failed:", error.message);
      return res.status(500).json({ ok: false, error: error.message });
    }

    console.log("[keep-alive] Supabase pinged successfully at", new Date().toISOString());
    return res.status(200).json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[keep-alive] Unexpected error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

