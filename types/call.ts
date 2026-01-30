// Call session types
export interface CallSession {
  callSid: string;
  streamSid: string | null;
  phoneNumber: string;
  status: CallStatus;
  startTime: Date;
  transcript: TranscriptMessage[];
}

export type CallStatus =
  | "idle"
  | "initiating"
  | "ringing"
  | "in-progress"
  | "completed"
  | "failed"
  | "busy"
  | "no-answer";

export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isFinal: boolean;
}

// Twilio Media Stream types
export interface TwilioMediaMessage {
  event: "connected" | "start" | "media" | "stop" | "mark";
  sequenceNumber?: string;
  streamSid?: string;
  media?: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string; // base64 encoded mulaw audio
  };
  start?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters: Record<string, string>;
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  mark?: {
    name: string;
  };
}

// Outbound message to Twilio
export interface TwilioOutboundMessage {
  event: "media" | "mark" | "clear";
  streamSid: string;
  media?: {
    payload: string; // base64 encoded mulaw audio
  };
  mark?: {
    name: string;
  };
}

// API request/response types
export interface InitiateCallRequest {
  phoneNumber: string;
  systemPrompt?: string;
}

export interface InitiateCallResponse {
  success: boolean;
  callSid?: string;
  message: string;
}

// SSE event types
export interface CallEvent {
  type: "status" | "transcript" | "error";
  callSid: string;
  data: CallStatusEvent | TranscriptEvent | ErrorEvent;
}

export interface CallStatusEvent {
  status: CallStatus;
  timestamp: Date;
}

export interface TranscriptEvent {
  message: TranscriptMessage;
}

export interface ErrorEvent {
  message: string;
  code?: string;
}
