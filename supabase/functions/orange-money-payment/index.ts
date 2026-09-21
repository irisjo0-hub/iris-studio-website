import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requireText = (value: unknown, name: string, max = 120) => {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) throw new Error(`${name} is required`);
  return text;
};

const requireAmount = (value: unknown) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 2000) {
    throw new Error("Invalid payment amount");
  }
  return Math.round(amount * 100) / 100;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ success: false, error: "Payment service is not configured." }, 503);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const action = requireText(body.action, "action", 20);

    if (action !== "initiate") {
      return json({ success: false, error: "Unsupported payment action." }, 400);
    }

    const orderType = requireText(body.order_type, "order_type", 20);
    if (!["printing", "booking", "graduation"].includes(orderType)) {
      return json({ success: false, error: "Invalid order type." }, 400);
    }

    const orderId = Number(body.order_id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return json({ success: false, error: "Invalid order id." }, 400);
    }

    const orderNumber = requireText(body.order_number, "order_number", 80);
    const customerPhone = requireText(body.customer_phone, "customer_phone", 30);
    const customerName = requireText(body.customer_name, "customer_name", 100);
    const amount = requireAmount(body.amount);

    // The public frontend never receives provider credentials or tokens.
    // Orange's Jordan API contract must be supplied through these server-side
    // environment variables before live initiation can be enabled.
    const orangeInitUrl = Deno.env.get("ORANGE_MONEY_INIT_URL");
    const orangeTokenUrl = Deno.env.get("ORANGE_MONEY_TOKEN_URL");
    const orangeClientId = Deno.env.get("ORANGE_MONEY_CLIENT_ID");
    const orangeClientSecret = Deno.env.get("ORANGE_MONEY_CLIENT_SECRET");
    const orangeMerchantKey = Deno.env.get("ORANGE_MONEY_MERCHANT_KEY");
    const orangeCurrency = Deno.env.get("ORANGE_MONEY_CURRENCY") || "JOD";
    const returnUrl = Deno.env.get("ORANGE_MONEY_RETURN_URL");
    const cancelUrl = Deno.env.get("ORANGE_MONEY_CANCEL_URL");
    const notifUrl = Deno.env.get("ORANGE_MONEY_NOTIF_URL");

    if (!orangeInitUrl || !orangeTokenUrl || !orangeClientId || !orangeClientSecret || !orangeMerchantKey || !returnUrl || !cancelUrl || !notifUrl) {
      return json({
        success: false,
        code: "ORANGE_MONEY_NOT_CONFIGURED",
        error: "Orange Money API credentials/endpoints are not configured yet.",
      }, 503);
    }

    const { data: existing } = await admin
      .from("payment_transactions")
      .select("id,status,provider_reference,provider_token")
      .eq("order_type", orderType)
      .eq("order_id", orderId)
      .eq("provider", "orange_money")
      .maybeSingle();

    if (existing?.status === "paid") {
      return json({ success: false, code: "ALREADY_PAID", error: "This invoice is already paid." }, 409);
    }

    const tokenResponse = await fetch(orangeTokenUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${orangeClientId}:${orangeClientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: "grant_type=client_credentials",
    });

    const tokenText = await tokenResponse.text();
    if (!tokenResponse.ok) {
      console.error("Orange token error:", tokenText.slice(0, 500));
      return json({ success: false, error: "Orange Money authentication failed." }, 502);
    }

    const tokenJson = JSON.parse(tokenText);
    const accessToken: string = tokenJson.access_token;
    if (!accessToken) return json({ success: false, error: "Orange Money did not return an access token." }, 502);

    const providerOrderId = `IRIS-${orderType.toUpperCase()}-${orderId}`;
    const paymentPayload = {
      merchant_key: orangeMerchantKey,
      currency: orangeCurrency,
      order_id: providerOrderId,
      amount,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: notifUrl,
      lang: "ar",
      reference: orderNumber,
      customer_phone: customerPhone,
    };

    const paymentResponse = await fetch(orangeInitUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentText = await paymentResponse.text();
    if (!paymentResponse.ok) {
      console.error("Orange payment init error:", paymentText.slice(0, 800));
      return json({ success: false, error: "Orange Money rejected the payment request." }, 502);
    }

    const providerJson = JSON.parse(paymentText);
    const paymentUrl = providerJson.payment_url || providerJson.paymentUrl;
    const payToken = providerJson.pay_token || providerJson.payToken || null;
    const providerReference = providerJson.txnid || providerJson.transaction_id || providerOrderId;

    const row = {
      order_type: orderType,
      order_id: orderId,
      order_number: orderNumber,
      provider: "orange_money",
      amount,
      currency: orangeCurrency,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: "pending",
      provider_reference: providerReference,
      provider_token: payToken,
      provider_status: "INITIATED",
      failure_reason: null,
      paid_at: null,
    };

    if (existing?.id) {
      await admin.from("payment_transactions").update(row).eq("id", existing.id);
    } else {
      await admin.from("payment_transactions").insert(row);
    }

    if (!paymentUrl) {
      return json({
        success: false,
        code: "ORANGE_PAYMENT_URL_MISSING",
        error: "Orange Money did not return a payment URL.",
      }, 502);
    }

    return json({
      success: true,
      payment_url: paymentUrl,
      order_number: orderNumber,
      amount,
      currency: orangeCurrency,
      status: "pending",
    });
  } catch (error) {
    console.error("orange-money-payment:", error);
    return json({ success: false, error: error instanceof Error ? error.message : "Payment initialization failed." }, 400);
  }
});