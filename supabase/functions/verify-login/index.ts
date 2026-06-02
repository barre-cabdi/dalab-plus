import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isBcryptHash = (s: string) => typeof s === "string" && /^\$2[aby]\$/.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { username, password, type } = await req.json();
    if (!username || !password || !type || !["business", "staff"].includes(type)) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (type === "business") {
      const { data: biz } = await supabase.from("businesses").select("*").eq("admin_username", username).maybeSingle();
      if (!biz) return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: cred } = await supabase.from("business_credentials").select("password_hash").eq("business_id", biz.id).maybeSingle();
      const stored = cred?.password_hash || "";

      let ok = false;
      if (isBcryptHash(stored)) {
        ok = await bcrypt.compare(password, stored);
      } else {
        ok = stored === password;
        if (ok && stored) {
          // Re-hash legacy plaintext on successful login
          const hash = await bcrypt.hash(password, 10);
          await supabase.from("business_credentials").upsert({ business_id: biz.id, password_hash: hash, updated_at: new Date().toISOString() });
        }
      }

      if (!ok) return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ valid: true, business: biz }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // staff
    const { data: staff } = await supabase.from("staff").select("*").eq("username", username).maybeSingle();
    if (!staff) return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: cred } = await supabase.from("staff_credentials").select("password_hash").eq("staff_id", staff.id).maybeSingle();
    const stored = cred?.password_hash || "";

    let ok = false;
    if (isBcryptHash(stored)) {
      ok = await bcrypt.compare(password, stored);
    } else {
      ok = stored === password;
      if (ok && stored) {
        const hash = await bcrypt.hash(password, 10);
        await supabase.from("staff_credentials").upsert({ staff_id: staff.id, password_hash: hash, updated_at: new Date().toISOString() });
      }
    }

    if (!ok) return new Response(JSON.stringify({ valid: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ valid: true, staff }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("verify-login error:", e);
    return new Response(JSON.stringify({ valid: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
