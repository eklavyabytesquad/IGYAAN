import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vfaoqkiwsjtnuukmrkel.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYW9xa2l3c2p0bnV1a21ya2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2NzUsImV4cCI6MjA3Njg3NzY3NX0.yAcVgYp8cCCIm7dlHYXbETVSbqciXbdSuJiZ6r_MLAs";
const supabase = createClient(supabaseUrl, supabaseKey);

const WHATSAPP_API_URL = "https://adminapis.backendprod.com/lms_campaign/api/whatsapp/template/h908xvdkc3/process";

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean phone number → 10 digits (India)
function cleanPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  // If starts with 91 and is 12 digits, strip country code
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  // If 10 digits, use as-is
  if (digits.length === 10) return digits;
  return digits;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, reason = "registration" } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanedPhone = cleanPhone(phone);

    if (cleanedPhone.length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // Rate limit: max 5 OTPs per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabase
      .from("otp_records")
      .select("id")
      .eq("phone", cleanedPhone)
      .gte("created_at", oneHourAgo);

    if (recentOtps && recentOtps.length >= 5) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again after some time." },
        { status: 429 }
      );
    }

    // Expire any previous unverified OTPs for this phone + reason
    await supabase
      .from("otp_records")
      .update({ expires_at: new Date().toISOString() })
      .eq("phone", cleanedPhone)
      .eq("reason", reason)
      .eq("is_verified", false);

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP record
    const { error: insertErr } = await supabase.from("otp_records").insert({
      phone: cleanedPhone,
      otp_code: otpCode,
      reason,
      expires_at: expiresAt.toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    if (insertErr) {
      console.error("OTP insert error:", insertErr);
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
    }

    // Send OTP via WhatsApp using the "staff otp" template
    const whatsappPayload = {
      receiver: `91${cleanedPhone}`,
      values: {
        "1": otpCode,
      },
    };

    const whatsappResponse = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(whatsappPayload),
    });

    if (!whatsappResponse.ok) {
      const errText = await whatsappResponse.text();
      console.error("WhatsApp API error:", whatsappResponse.status, errText);
      // Still return success — OTP is saved, user can try resend
      return NextResponse.json({
        success: true,
        message: "OTP generated. WhatsApp delivery may be delayed.",
        phone: cleanedPhone,
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your WhatsApp successfully",
      phone: cleanedPhone,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
