import { NextRequest, NextResponse } from "next/server";
import { generateMediaStreamTwiML } from "@/lib/twilio";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const callStatus = formData.get("CallStatus") as string;

    console.log(`[Webhook] Call ${callSid}: ${callStatus} (${from} -> ${to})`);

    // Get the WebSocket server URL
    const websocketUrl = process.env.WEBSOCKET_SERVER_URL;
    if (!websocketUrl) {
      console.error("[Webhook] WEBSOCKET_SERVER_URL not configured");
      // Return a TwiML that says there's an error
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, there was a configuration error. Please try again later.</Say>
  <Hangup />
</Response>`;
      return new NextResponse(errorTwiml, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Construct the full WebSocket URL with path
    const wsUrl = `${websocketUrl}/media-stream`;

    // Generate TwiML to connect to media stream
    const twiml = generateMediaStreamTwiML(wsUrl, callSid);

    console.log(`[Webhook] Returning TwiML to connect to: ${wsUrl}`);

    return new NextResponse(twiml, {
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
