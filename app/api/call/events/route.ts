import { NextRequest } from "next/server";

// Store for SSE connections
const sseConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const callSid = searchParams.get("callSid");

  if (!callSid) {
    return new Response("callSid is required", { status: 400 });
  }

  // Get the WebSocket server URL to poll for session data
  const wsServerUrl = process.env.WEBSOCKET_SERVER_URL?.replace(
    "wss://",
    "https://",
  ).replace("ws://", "http://");

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

      // Poll the Express server for updates
      let lastTranscriptCount = 0;
      const pollInterval = setInterval(async () => {
        console.log("--- start polling events", wsServerUrl);
        try {
          if (!wsServerUrl) {
            return;
          }

          const response = await fetch(`${wsServerUrl}/session/${callSid}`);
          const session = await response.json();
          console.log("call events session polling", JSON.stringify(session));
          if (!response.ok) {
            if (response.status === 404) {
              // Session not found - might not have started yet
              return;
            }
            const responseBody = await response.json();
            console.error(
              `[SSE] Error fetching session: ${response.status}`,
              responseBody,
            );
            return;
          }

          // Send status update
          const statusMessage = `data: ${JSON.stringify({
            type: "status",
            callSid,
            data: { status: session.status, timestamp: new Date() },
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(statusMessage));

          // Send new transcript messages
          if (
            session.transcript &&
            session.transcript.length > lastTranscriptCount
          ) {
            const newMessages = session.transcript.slice(lastTranscriptCount);
            for (const message of newMessages) {
              const transcriptMessage = `data: ${JSON.stringify({
                type: "transcript",
                callSid,
                data: { message },
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(transcriptMessage));
            }
            lastTranscriptCount = session.transcript.length;
          }

          // Check if call is completed
          if (session.status === "completed" || session.status === "failed") {
            clearInterval(pollInterval);
            controller.close();
          }
        } catch (error) {
          console.error("[SSE] Error polling session:", error);
        }
      }, 1000); // Poll every second

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        sseConnections.get(callSid)?.delete(controller);
        if (sseConnections.get(callSid)?.size === 0) {
          sseConnections.delete(callSid);
        }
      });
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

// Helper function to broadcast events to all connected clients for a call
export function broadcastEvent(callSid: string, event: unknown): void {
  const controllers = sseConnections.get(callSid);
  if (controllers) {
    const message = `data: ${JSON.stringify(event)}\n\n`;
    const encoded = new TextEncoder().encode(message);
    controllers.forEach((controller) => {
      try {
        controller.enqueue(encoded);
      } catch {
        // Controller might be closed
      }
    });
  }
}
