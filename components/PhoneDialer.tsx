"use client";

import { useState } from "react";

interface PhoneDialerProps {
  onCall: (phoneNumber: string) => void;
  disabled: boolean;
}

export default function PhoneDialer({ onCall, disabled }: PhoneDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("+971586504939");
  const [error, setError] = useState("");

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

    onCall(cleaned);
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
