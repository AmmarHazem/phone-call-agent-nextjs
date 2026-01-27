import { EventEmitter } from "events";

export interface SSEEvent {
  type: "transcript" | "status" | "error" | "connected";
  message?: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isFinal: boolean;
  };
  status?: string;
  error?: string;
}

type EventHandler = (event: { type: string; data: unknown }) => void;

class SSEManager {
  private emitter: EventEmitter;
  private connections: Map<string, Set<ReadableStreamDefaultController>>;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
    this.connections = new Map();
  }

  /**
   * Add an SSE listener for a specific call
   */
  addListener(callSid: string, controller: ReadableStreamDefaultController): void {
    if (!this.connections.has(callSid)) {
      this.connections.set(callSid, new Set());
    }
    this.connections.get(callSid)!.add(controller);
  }

  /**
   * Remove an SSE listener for a specific call
   */
  removeListener(callSid: string, controller: ReadableStreamDefaultController): void {
    this.connections.get(callSid)?.delete(controller);
    if (this.connections.get(callSid)?.size === 0) {
      this.connections.delete(callSid);
    }
  }

  /**
   * Broadcast an event to all listeners for a specific call
   */
  broadcastToCall(callSid: string, data: SSEEvent): void {
    // Emit to EventEmitter for internal listeners
    this.emitter.emit(`call:${callSid}`, { type: data.type, data });

    // Also directly write to any connected SSE streams
    const listeners = this.connections.get(callSid);
    if (!listeners) return;

    const message = `data: ${JSON.stringify({
      type: data.type,
      callSid,
      data,
    })}\n\n`;
    const encoder = new TextEncoder();

    for (const controller of listeners) {
      try {
        controller.enqueue(encoder.encode(message));
      } catch {
        // Controller might be closed, remove it
        listeners.delete(controller);
      }
    }
  }

  /**
   * Subscribe to events for a specific call
   */
  subscribe(callSid: string, handler: EventHandler): void {
    this.emitter.on(`call:${callSid}`, handler);
  }

  /**
   * Unsubscribe from events for a specific call
   */
  unsubscribe(callSid: string, handler: EventHandler): void {
    this.emitter.off(`call:${callSid}`, handler);
  }

  /**
   * Emit an event for a specific call
   */
  emit(callSid: string, event: { type: string; data: unknown }): void {
    this.emitter.emit(`call:${callSid}`, event);
  }
}

// Singleton with hot-reload persistence
const globalForSSE = globalThis as unknown as { sseManager: SSEManager | undefined };

if (!globalForSSE.sseManager) {
  globalForSSE.sseManager = new SSEManager();
}

export const sseManager = globalForSSE.sseManager;
