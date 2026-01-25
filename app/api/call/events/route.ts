import { NextRequest } from "next/server";
import { EventEmitter } from "events";

// Singleton event emitter for SSE broadcasting
// Using globalThis to persist across hot reloads in development
const globalForEvents = globalThis as unknown as {
  sseEmitter: EventEmitter | undefined;
  sseConnections: Map<string, Set<ReadableStreamDefaultController>> | undefined;
};

if (!globalForEvents.sseEmitter) {
  globalForEvents.sseEmitter = new EventEmitter();
  globalForEvents.sseEmitter.setMaxListeners(100);
}

if (!globalForEvents.sseConnections) {
  globalForEvents.sseConnections = new Map();
}

const sseEmitter = globalForEvents.sseEmitter;
const sseConnections = globalForEvents.sseConnections;

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
      if (!sseConnections.has(callSid)) {
        sseConnections.set(callSid, new Set());
      }
      sseConnections.get(callSid)!.add(controller);

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: "connected", callSid })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Listen for events pushed from the WebSocket server
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
      sseEmitter.on(`call:${callSid}`, eventHandler);

      // Cleanup function
      const cleanup = () => {
        sseEmitter.off(`call:${callSid}`, eventHandler);
        sseConnections.get(callSid)?.delete(controller);
        if (sseConnections.get(callSid)?.size === 0) {
          sseConnections.delete(callSid);
        }
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

// POST: WebSocket server calls this to push events
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { callSid, type, data } = body;

    if (!callSid || !type) {
      return Response.json(
        { error: "callSid and type are required" },
        { status: 400 },
      );
    }

    console.log(`[SSE] Received push event: ${type} for call ${callSid}`);

    // Emit the event to all SSE listeners for this call
    sseEmitter.emit(`call:${callSid}`, { type, data });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[SSE] Error processing push event:", error);
    return Response.json({ error: "Failed to process event" }, { status: 500 });
  }
}
