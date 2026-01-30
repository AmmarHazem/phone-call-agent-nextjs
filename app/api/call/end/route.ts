import { endCall } from "@/lib/twilio";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.callSid) return NextResponse.error();
    await endCall(data.callSid);
    return NextResponse.json({});
  } catch (e) {
    console.log("--- /call/end error", e);
    return NextResponse.error();
  }
}
