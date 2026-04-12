import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.99.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code, businessId } = await req.json();
    if (!phone || !code || !businessId) {
      return new Response(JSON.stringify({ error: "phone, code, and businessId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find matching unexpired, unverified code
    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("business_id", businessId)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid or expired code" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", data.id);

    // Clean up old codes for this phone
    await supabase
      .from("otp_codes")
      .delete()
      .eq("phone", phone)
      .lt("expires_at", new Date().toISOString());

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(JSON.stringify({ valid: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
