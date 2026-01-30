import { GetCallStatusResponseModel } from "@/models/GetCallStatusResponseModel";
import { CallStatus } from "@/types/call";
import { NextRequest, NextResponse } from "next/server";

// Store for call statuses (in production, use a proper database)
const callStatuses = new Map<string, { status: CallStatus; timestamp: Date }>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as CallStatus;
    const callDuration = formData.get("CallDuration") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;

    console.log(`[Status] Call ${callSid}: ${callStatus}`);
    if (callDuration) {
      console.log(`[Status] Duration: ${callDuration} seconds`);
    }

    // Update call status
    callStatuses.set(callSid, {
      status: callStatus,
      timestamp: new Date(),
    });

    // Log detailed status for debugging
    const statusDetails = {
      callSid,
      callStatus,
      callDuration,
      from,
      to,
      timestamp: new Date().toISOString(),
    };
    console.log("[Status] Details:", JSON.stringify(statusDetails));

    // Handle specific statuses
    switch (callStatus) {
      case "completed":
        console.log(
          `[Status] Call ${callSid} completed after ${callDuration}s`,
        );
        // Clean up after a delay to allow final data retrieval
        setTimeout(() => {
          callStatuses.delete(callSid);
        }, 60000); // Keep for 1 minute after completion
        break;

      case "failed":
      case "busy":
      case "no-answer":
        console.log(
          `[Status] Call ${callSid} ended with status: ${callStatus}`,
        );
        break;

      case "ringing":
        console.log(`[Status] Call ${callSid} is ringing`);
        break;

      case "in-progress":
        console.log(`[Status] Call ${callSid} connected`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET endpoint to check call status
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const callSid = searchParams.get("callSid");

  if (!callSid) {
    return NextResponse.json({ error: "callSid is required" }, { status: 400 });
  }

  const status = callStatuses.get(callSid);
  if (!status) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  return NextResponse.json<GetCallStatusResponseModel>(status);
}

// Export for use by other modules
export { callStatuses };
