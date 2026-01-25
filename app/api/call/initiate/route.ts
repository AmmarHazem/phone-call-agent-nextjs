import { NextRequest, NextResponse } from "next/server";
import {
  initiateCall,
  formatPhoneNumber,
  validatePhoneNumber,
} from "@/lib/twilio";
import type { InitiateCallRequest, InitiateCallResponse } from "@/types/call";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<InitiateCallResponse>> {
  try {
    const body: InitiateCallRequest = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 },
      );
    }

    // Format and validate phone number
    let formattedNumber: string;
    try {
      formattedNumber = formatPhoneNumber(phoneNumber);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid phone number format. Use E.164 format (e.g., +14155551234)",
        },
        { status: 400 },
      );
    }

    if (!validatePhoneNumber(formattedNumber)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid phone number format. Use E.164 format (e.g., +14155551234)",
        },
        { status: 400 },
      );
    }

    // Get the app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: NEXT_PUBLIC_APP_URL not set",
        },
        { status: 500 },
      );
    }

    // Construct webhook URLs
    const webhookUrl = `${appUrl}/api/call/webhook`;
    const statusCallbackUrl = `${appUrl}/api/call/status`;

    // Initiate the call
    const callSid = await initiateCall(
      formattedNumber,
      webhookUrl,
      statusCallbackUrl,
    );

    console.log(`[API] Call initiated: ${callSid} to ${formattedNumber}`);

    return NextResponse.json<InitiateCallResponse>({
      success: true,
      callSid,
      message: "Call initiated successfully",
    });
  } catch (error) {
    console.error("[API] Error initiating call:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Failed to initiate call: ${errorMessage}` },
      { status: 500 },
    );
  }
}
