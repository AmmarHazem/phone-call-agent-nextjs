import { NextRequest, NextResponse } from "next/server";
import { registerCall } from "@/lib/elevenlabs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract system prompt from URL query params
    const url = new URL(request.url);
    const encodedSystemPrompt = url.searchParams.get("systemPrompt");
    let systemPrompt: string | undefined;

    if (encodedSystemPrompt) {
      try {
        systemPrompt = Buffer.from(
          decodeURIComponent(encodedSystemPrompt),
          "base64"
        ).toString("utf-8");
        console.log(
          `[Webhook] Custom system prompt received (${systemPrompt.length} chars)`
        );
      } catch (e) {
        console.error("[Webhook] Failed to decode system prompt:", e);
      }
    }

    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const callStatus = formData.get("CallStatus") as string;

    console.log(`[Webhook] Call ${callSid}: ${callStatus} (${from} -> ${to})`);

    // Get ElevenLabs agent ID
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!agentId) {
      console.error("[Webhook] ELEVENLABS_AGENT_ID not configured");
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, there was a configuration error. Please try again later.</Say>
  <Hangup />
</Response>`;
      return new NextResponse(errorTwiml, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Register call with ElevenLabs and get TwiML
    const result = await registerCall({
      agentId,
      callSid,
      fromNumber: from,
      toNumber: to,
      systemPrompt,
    });

    console.log(`[Webhook] ElevenLabs call registered for ${callSid}`);

    // ElevenLabs register-call returns TwiML directly for Twilio integration
    return new NextResponse(result.twiml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, an error occurred. Please try again later.</Say>
  <Hangup />
</Response>`;
    return new NextResponse(errorTwiml, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
