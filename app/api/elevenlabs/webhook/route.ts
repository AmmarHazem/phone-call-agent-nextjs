import { NextRequest, NextResponse } from "next/server";
import { sseManager } from "@/lib/sse-manager";

interface ElevenLabsWebhookEvent {
  type: string;
  conversation_id?: string;
  // Transcript events
  id?: string;
  role?: "agent" | "user";
  text?: string;
  // Conversation metadata that may contain call_sid
  conversation?: {
    metadata?: {
      call_sid?: string;
    };
  };
  // Dynamic variables passed during registration
  dynamic_variables?: {
    call_sid?: string;
  };
  // Error events
  message?: string;
  error?: string;
}

/**
 * Webhook handler for ElevenLabs Conversational AI events
 * Receives transcript updates and conversation events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const event: ElevenLabsWebhookEvent = await request.json();

    console.log("[ElevenLabs Webhook] Received event:", event.type);

    // Extract callSid from various possible locations in the event
    const callSid =
      event.conversation?.metadata?.call_sid ||
      event.dynamic_variables?.call_sid;

    if (!callSid) {
      console.warn("[ElevenLabs Webhook] Missing callSid in event:", event);
      return NextResponse.json({ error: "Missing callSid" }, { status: 400 });
    }

    switch (event.type) {
      case "transcript":
      case "user_transcript":
      case "agent_transcript":
        // Handle transcript events
        if (event.text) {
          const role =
            event.role === "agent" || event.type === "agent_transcript"
              ? "assistant"
              : "user";

          sseManager.broadcastToCall(callSid, {
            type: "transcript",
            message: {
              id: event.id || crypto.randomUUID(),
              role,
              content: event.text,
              timestamp: new Date(),
              isFinal: true,
            },
          });
        }
        break;

      case "conversation_started":
        sseManager.broadcastToCall(callSid, {
          type: "status",
          status: "in-progress",
        });
        break;

      case "conversation_ended":
        sseManager.broadcastToCall(callSid, {
          type: "status",
          status: "completed",
        });
        break;

      case "error":
        sseManager.broadcastToCall(callSid, {
          type: "error",
          error: event.message || event.error || "Unknown error",
        });
        break;

      default:
        console.log(`[ElevenLabs Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ElevenLabs Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Failed to process event" },
      { status: 500 }
    );
  }
}
