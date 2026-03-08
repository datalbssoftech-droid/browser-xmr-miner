import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // ─── GET /mining-proxy?action=config ───
    // Returns pool + proxy configuration for the frontend or proxy server
    if (req.method === "GET") {
      const { data: configRows } = await supabase
        .from("platform_config")
        .select("key, value");

      const config: Record<string, string> = {};
      (configRows || []).forEach((r: any) => {
        config[r.key] = r.value;
      });

      return new Response(
        JSON.stringify({
          proxy_url: config.proxy_url || "",
          proxy_enabled: config.proxy_enabled === "true",
          proxy_max_connections: parseInt(config.proxy_max_connections || "1000"),
          proxy_auth_required: config.proxy_auth_required !== "false",
          pool_url: config.pool_url || "",
          pool_port: parseInt(config.pool_port || "3333"),
          pool_wallet: config.pool_wallet || "",
          worker_prefix: config.worker_prefix || "harimine",
          pool_password: config.pool_password || "x",
          platform_fee: parseFloat(config.platform_fee || "5"),
          share_reward_rate: parseFloat(config.share_reward_rate || "0.000000001"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── POST actions ───
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // ─── POST /mining-proxy { action: "auth" } ───
    // Called by the proxy server to validate a miner's JWT
    if (body.action === "auth") {
      const { token } = body;
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
      const { data: { user }, error } = await authClient.auth.getUser(token);

      if (error || !user) {
        return new Response(
          JSON.stringify({ valid: false, error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address, display_name")
        .eq("user_id", user.id)
        .single();

      return new Response(
        JSON.stringify({
          valid: true,
          user_id: user.id,
          wallet_address: profile?.wallet_address || "",
          display_name: profile?.display_name || "",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── POST /mining-proxy { action: "submit_share" } ───
    // Called by the proxy server when a browser submits a valid share
    if (body.action === "submit_share") {
      const { user_id, session_id, job_id, nonce, result, difficulty, is_valid } = body;

      if (!user_id || !job_id || !nonce || !result) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record the share
      const { error: shareError } = await supabase
        .from("share_submissions")
        .insert({
          user_id,
          session_id: session_id || null,
          job_id,
          nonce,
          result,
          difficulty: difficulty || 0,
          is_valid: is_valid !== false,
        });

      if (shareError) {
        return new Response(
          JSON.stringify({ error: "Failed to record share", details: shareError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If valid share, credit earnings
      if (is_valid !== false) {
        const { data: rateConfig } = await supabase
          .from("platform_config")
          .select("value")
          .eq("key", "share_reward_rate")
          .single();

        const rewardRate = parseFloat(rateConfig?.value || "0.000000001");
        const reward = rewardRate * (difficulty || 1);

        // Get platform fee
        const { data: feeConfig } = await supabase
          .from("platform_config")
          .select("value")
          .eq("key", "platform_fee")
          .single();

        const feePercent = parseFloat(feeConfig?.value || "5");
        const netReward = reward * (1 - feePercent / 100);

        // Record mining earning
        await supabase.from("earnings").insert({
          user_id,
          amount: netReward,
          source: "mining",
        });

        // Check for referrer and credit referral earnings
        const { data: referral } = await supabase
          .from("referrals")
          .select("referrer_id")
          .eq("referred_id", user_id)
          .single();

        if (referral) {
          const { data: refConfig } = await supabase
            .from("platform_config")
            .select("value")
            .eq("key", "referral_percentage")
            .single();

          const refPercent = parseFloat(refConfig?.value || "5");
          const refReward = reward * (refPercent / 100);

          await supabase.from("earnings").insert({
            user_id: referral.referrer_id,
            amount: refReward,
            source: "referral",
          });

          // Update referral total earnings
          await supabase.rpc("has_role", { _user_id: referral.referrer_id, _role: "user" }); // dummy call
          // Use raw update since we need to increment
          const { data: currentRef } = await supabase
            .from("referrals")
            .select("earnings")
            .eq("referred_id", user_id)
            .single();

          if (currentRef) {
            await supabase
              .from("referrals")
              .update({ earnings: currentRef.earnings + refReward })
              .eq("referred_id", user_id);
          }
        }

        return new Response(
          JSON.stringify({ success: true, reward: netReward }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, reward: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── POST /mining-proxy { action: "update_session" } ───
    // Called by the proxy to update a mining session's hashrate/hashes
    if (body.action === "update_session") {
      const { user_id, session_id, hashrate, total_hashes } = body;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: "Missing user_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: any = {};
      if (hashrate !== undefined) updateData.hashrate = hashrate;
      if (total_hashes !== undefined) updateData.total_hashes = total_hashes;

      let query = supabase
        .from("mining_sessions")
        .update(updateData)
        .eq("user_id", user_id)
        .eq("is_active", true);

      if (session_id) {
        query = supabase
          .from("mining_sessions")
          .update(updateData)
          .eq("id", session_id);
      }

      await query;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── POST /mining-proxy { action: "end_session" } ───
    if (body.action === "end_session") {
      const { user_id, session_id, total_hashes } = body;

      const updateData: any = {
        is_active: false,
        ended_at: new Date().toISOString(),
        hashrate: 0,
      };
      if (total_hashes !== undefined) updateData.total_hashes = total_hashes;

      if (session_id) {
        await supabase.from("mining_sessions").update(updateData).eq("id", session_id);
      } else if (user_id) {
        await supabase.from("mining_sessions").update(updateData).eq("user_id", user_id).eq("is_active", true);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
