"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CallStatus,
  TranscriptMessage,
  InitiateCallResponse,
  CallEvent,
} from "@/types/call";

interface CallState {
  status: CallStatus | "idle";
  callSid: string | null;
  phoneNumber: string | null;
  startTime: Date | null;
  transcript: TranscriptMessage[];
  error: string | null;
}

interface UseCallReturn {
  state: CallState;
  initiateCall: (phoneNumber: string, systemPrompt?: string) => Promise<void>;
  endCall: () => Promise<void>;
  isActive: boolean;
}

const initialState: CallState = {
  status: "idle",
  callSid: null,
  phoneNumber: null,
  startTime: null,
  transcript: [],
  error: null,
};

export function useCall(): UseCallReturn {
  const [state, setState] = useState<CallState>(initialState);
  const eventSourceRef = useRef<EventSource | null>(null);

  const isActive =
    state.status !== "idle" &&
    state.status !== "completed" &&
    state.status !== "failed" &&
    state.status !== "busy" &&
    state.status !== "no-answer";

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Subscribe to call events via SSE
  const subscribeToEvents = useCallback((callSid: string) => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/call/events?callSid=${callSid}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: CallEvent = JSON.parse(event.data);

        switch (data.type) {
          case "status":
            const statusData = data.data as { status: CallStatus; timestamp: Date };
            setState((prev) => ({
              ...prev,
              status: statusData.status,
              startTime:
                statusData.status === "in-progress" && !prev.startTime
                  ? new Date()
                  : prev.startTime,
            }));

            // Close connection if call ended
            if (
              statusData.status === "completed" ||
              statusData.status === "failed" ||
              statusData.status === "busy" ||
              statusData.status === "no-answer"
            ) {
              eventSource.close();
            }
            break;

          case "transcript":
            const transcriptData = data.data as { message: TranscriptMessage };
            setState((prev) => {
              // Check if this message already exists (update) or is new
              const existingIndex = prev.transcript.findIndex(
                (m) => m.id === transcriptData.message.id
              );

              if (existingIndex >= 0) {
                // Update existing message
                const newTranscript = [...prev.transcript];
                newTranscript[existingIndex] = transcriptData.message;
                return { ...prev, transcript: newTranscript };
              } else {
                // Add new message
                return {
                  ...prev,
                  transcript: [...prev.transcript, transcriptData.message],
                };
              }
            });
            break;

          case "error":
            const errorData = data.data as { message: string };
            setState((prev) => ({
              ...prev,
              error: errorData.message,
            }));
            break;
        }
      } catch (error) {
        console.error("[useCall] Error parsing SSE event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[useCall] SSE error:", error);
      // Don't close on error - it might reconnect
    };
  }, []);

  // Initiate a call
  const initiateCall = useCallback(
    async (phoneNumber: string, systemPrompt?: string) => {
      setState({
        ...initialState,
        status: "initiating",
        phoneNumber,
      });

      try {
        const response = await fetch("/api/call/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, systemPrompt }),
        });

        const data: InitiateCallResponse = await response.json();

        if (!data.success || !data.callSid) {
          throw new Error(data.message || "Failed to initiate call");
        }

        setState((prev) => ({
          ...prev,
          callSid: data.callSid!,
          status: "initiating",
        }));

        // Subscribe to events
        subscribeToEvents(data.callSid);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to initiate call";
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: message,
        }));
      }
    },
    [subscribeToEvents]
  );

  // End the call
  const endCall = useCallback(async () => {
    if (!state.callSid) return;

    try {
      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Note: In a production app, you'd also call an API to end the call via Twilio
      // For now, we just update local state
      setState((prev) => ({
        ...prev,
        status: "completed",
      }));
    } catch (error) {
      console.error("[useCall] Error ending call:", error);
    }
  }, [state.callSid]);

  return {
    state,
    initiateCall,
    endCall,
    isActive,
  };
}
