/**
 * Configuration for audio processing
 */
export const AUDIO_CONFIG = {
  // Twilio's audio format
  twilio: {
    encoding: "mulaw" as const,
    sampleRate: 8000,
    channels: 1,
  },
  // Deepgram TTS output format
  deepgramTts: {
    encoding: "linear16" as const,
    sampleRate: 24000,
    channels: 1,
  },
};

/**
 * Timing configuration for the conversation
 */
export const TIMING_CONFIG = {
  // How long to wait for speech before prompting
  silencePromptMs: 10000,
  // Maximum duration for a single response
  maxResponseDurationMs: 30000,
  // Debounce time for interim transcripts
  transcriptDebounceMs: 100,
};
