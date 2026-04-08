import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // CPAGrip postback parameters
    const userId = params.get("user_id") || params.get("subid");
    const offerId = params.get("offer_id") || params.get("oid");
    const offerName = params.get("offer_name") || params.get("offer");
    const payout = parseFloat(params.get("payout") || params.get("amount") || "0");
    const transactionId = params.get("transaction_id") || params.get("tid");
    const ip = params.get("ip") || req.headers.get("x-forwarded-for") || "";
    const secretKey = params.get("secret");

    // Validate secret to prevent fake postbacks
    const POSTBACK_SECRET = Deno.env.get("CPAGRIP_POSTBACK_SECRET");
    if (POSTBACK_SECRET && secretKey !== POSTBACK_SECRET) {
      return new Response("Unauthorized", { status: 403 });
    }

    if (!userId || !offerId) {
      return new Response("Missing required params", { status: 400 });
    }

    // Points: 1 point = $0.001, so payout * 1000
    const pointsEarned = Math.round(payout * 1000);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert offer completion
    const { error: insertError } = await supabase.from("offer_completions").insert({
      user_id: userId,
      offer_id: offerId,
      offer_name: offerName || "Unknown Offer",
      points_earned: pointsEarned,
      payout,
      transaction_id: transactionId,
      ip_address: ip,
      status: "completed",
    });

    if (insertError) {
      // Duplicate transaction_id means already processed
      if (insertError.code === "23505") {
        return new Response("Already processed", { status: 200 });
      }
      console.error("Insert error:", insertError);
      return new Response("Error", { status: 500 });
    }

    // Upsert points balance
    const { data: existing } = await supabase
      .from("points_balance")
      .select("total_points")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("points_balance")
        .update({
          total_points: existing.total_points + pointsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      await supabase.from("points_balance").insert({
        user_id: userId,
        total_points: pointsEarned,
        redeemed_points: 0,
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Postback error:", err);
    return new Response("Server error", { status: 500 });
  }
});
