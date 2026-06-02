import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { id, password, type } = await req.json();
    if (!id || !password || !type || !["business", "staff"].includes(type)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof password !== "string" || password.length < 4 || password.length > 200) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid password length" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    if (type === "business") {
      const { error } = await supabase.from("business_credentials").upsert({
        business_id: id, password_hash: hash, updated_at: now,
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.from("staff_credentials").upsert({
        staff_id: id, password_hash: hash, updated_at: now,
      });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("set-password error:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
