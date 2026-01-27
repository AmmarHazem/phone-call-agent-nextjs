import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse-manager";

// GET: Browser connects here for SSE stream
export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const callSid = searchParams.get("callSid");

  if (!callSid) {
    return new Response("callSid is required", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Add this controller to the connections for this call
      sseManager.addListener(callSid, controller);

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: "connected", callSid })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Listen for events via EventEmitter (from ElevenLabs webhook)
      const eventHandler = (event: { type: string; data: unknown }) => {
        try {
          const message = `data: ${JSON.stringify({
            type: event.type,
            callSid,
            data: event.data,
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));

          // Close connection if call ended
          const status = (event.data as { status?: string })?.status;
          if (
            event.type === "status" &&
            (status === "completed" || status === "failed")
          ) {
            cleanup();
            controller.close();
          }
        } catch (e) {
          // Controller might be closed
          console.log("/call/events eventHandler() error", e);
        }
      };

      // Subscribe to events for this callSid
      sseManager.subscribe(callSid, eventHandler);

      // Cleanup function
      const cleanup = () => {
        sseManager.unsubscribe(callSid, eventHandler);
        sseManager.removeListener(callSid, controller);
      };

      // Clean up on client disconnect
      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// POST: Internal endpoint for pushing events (can be used for testing or manual events)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { callSid, type, data } = body;

    if (!callSid || !type) {
      return Response.json(
        { error: "callSid and type are required" },
        { status: 400 }
      );
    }

    console.log(`[SSE] Received push event: ${type} for call ${callSid}`);

    // Emit the event to all SSE listeners for this call
    sseManager.emit(callSid, { type, data });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[SSE] Error processing push event:", error);
    return Response.json({ error: "Failed to process event" }, { status: 500 });
  }
}
