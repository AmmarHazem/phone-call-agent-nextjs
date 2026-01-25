"use client";

import { useState } from "react";

const DEFAULT_SYSTEM_PROMPT = `You are a friendly and helpful AI phone assistant. You are having a real-time voice conversation over the phone.

## Guidelines for Phone Conversations:

1. **Be Concise**: Keep your responses short and conversational, typically 1-3 sentences. Long responses feel unnatural on a phone call.

2. **Natural Speech**:
   - Speak as if you're talking to a friend
   - Use contractions (I'm, you're, don't)
   - Avoid technical jargon unless the user uses it first
   - Don't use markdown, bullet points, lists, or any formatted text

3. **Active Listening**:
   - Acknowledge what the user says before responding
   - If you don't understand something, ask for clarification naturally
   - Be patient with pauses and background noise

4. **Conversation Flow**:
   - End your responses in a way that invites the user to continue
   - Ask follow-up questions when appropriate
   - Don't overwhelm with too much information at once

5. **Phone-Specific Considerations**:
   - Numbers should be spoken naturally (e.g., "twelve thirty" instead of "12:30")
   - Spell out abbreviations when needed
   - If there's silence, you can gently prompt the user

6. **Tone**:
   - Be warm, friendly, and helpful
   - Match the user's energy level
   - Stay calm and patient even if the user seems frustrated

Remember: This is a voice conversation, not a text chat. Everything you say will be spoken aloud, so write exactly how you would speak.`;

interface PhoneDialerProps {
  onCall: (phoneNumber: string, systemPrompt?: string) => void;
  disabled: boolean;
}

export default function PhoneDialer({ onCall, disabled }: PhoneDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("+971586504939");
  const [error, setError] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // const formatDisplayNumber = (value: string): string => {
  //   // Remove all non-digit characters except +
  //   const cleaned = value.replace(/[^\d+]/g, "");

  //   // If it starts with +, keep it, otherwise format as US number
  //   if (cleaned.startsWith("+")) {
  //     return cleaned;
  //   }

  //   // Format as US number: (XXX) XXX-XXXX
  //   const digits = cleaned.replace(/\D/g, "");
  //   if (digits.length <= 3) {
  //     return digits;
  //   }
  //   if (digits.length <= 6) {
  //     return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  //   }
  //   return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value; // formatDisplayNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get just the digits (and + if present)
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleaned) {
      setError("Please enter a phone number");
      return;
    }

    // Basic validation
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    // Pass system prompt only if it differs from default
    const customPrompt = systemPrompt !== DEFAULT_SYSTEM_PROMPT ? systemPrompt : undefined;
    onCall(cleaned, customPrompt);
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Enter a phone number with country code (e.g., +1 for US)
        </p>
      </div>

      {/* Collapsible System Prompt Section */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <span>Customize AI Prompt</span>
          <ChevronIcon expanded={isPromptExpanded} />
        </button>

        {isPromptExpanded && (
          <div className="mt-2 space-y-2">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={disabled}
              rows={10}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {systemPrompt.length} characters
              </span>
              <button
                type="button"
                onClick={handleResetPrompt}
                disabled={disabled || systemPrompt === DEFAULT_SYSTEM_PROMPT}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !phoneNumber}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
      >
        <PhoneIcon />
        {disabled ? "Calling..." : "Start Call"}
      </button>
    </form>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
