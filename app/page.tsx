"use client";

import PhoneDialer from "@/components/PhoneDialer";
import CallStatus from "@/components/CallStatus";
import Transcript from "@/components/Transcript";
import CallControls from "@/components/CallControls";
import { useCall } from "@/hooks/useCall";

export default function Home() {
  const { state, initiateCall, endCall, isActive } = useCall();

  const handleCall = async (phoneNumber: string, systemPrompt?: string) => {
    await initiateCall(phoneNumber, systemPrompt);
  };

  const handleEndCall = async () => {
    await endCall();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Phone Call Agent
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter a phone number to start a conversation with AI
          </p>
        </div>

        {/* Phone Dialer or Call Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {state.status === "idle" ? (
            <PhoneDialer onCall={handleCall} disabled={false} />
          ) : (
            <div className="flex flex-col gap-4">
              {/* Phone number being called */}
              {state.phoneNumber && (
                <div className="text-center">
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    Calling
                  </span>
                  <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    {state.phoneNumber}
                  </p>
                </div>
              )}

              {/* Call Status */}
              <CallStatus
                status={state.status}
                startTime={state.startTime}
              />

              {/* End Call Button */}
              {isActive && (
                <CallControls onEndCall={handleEndCall} disabled={false} />
              )}

              {/* Error Message */}
              {state.error && (
                <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {state.error}
                </div>
              )}

              {/* New Call Button (when call ended) */}
              {!isActive && (
                <button
                  onClick={() => window.location.reload()}
                  className="mx-auto rounded-lg border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Start New Call
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transcript */}
        {state.status !== "idle" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Conversation
            </h2>
            <Transcript messages={state.transcript} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            Powered by Twilio, Deepgram, and OpenAI
          </p>
        </footer>
      </main>
    </div>
  );
}
