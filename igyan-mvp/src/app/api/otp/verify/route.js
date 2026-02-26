import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vfaoqkiwsjtnuukmrkel.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYW9xa2l3c2p0bnV1a21ya2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2NzUsImV4cCI6MjA3Njg3NzY3NX0.yAcVgYp8cCCIm7dlHYXbETVSbqciXbdSuJiZ6r_MLAs";
const supabase = createClient(supabaseUrl, supabaseKey);

function cleanPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, otp, reason = "registration" } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const cleanedPhone = cleanPhone(phone);

    // Find the latest unverified OTP for this phone + reason
    const { data: record, error: fetchErr } = await supabase
      .from("otp_records")
      .select("*")
      .eq("phone", cleanedPhone)
      .eq("reason", reason)
      .eq("is_verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr || !record) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (record.attempts >= record.max_attempts) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Increment attempt count
    await supabase
      .from("otp_records")
      .update({ attempts: record.attempts + 1, updated_at: new Date().toISOString() })
      .eq("id", record.id);

    // Verify OTP
    if (record.otp_code !== otp.trim()) {
      const remaining = record.max_attempts - record.attempts - 1;
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Mark as verified
    await supabase
      .from("otp_records")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
      phone: cleanedPhone,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
