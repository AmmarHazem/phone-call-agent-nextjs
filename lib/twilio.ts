import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client
export const twilioClient = twilio(accountSid, authToken);

/**
 * Initiate an outbound call to a phone number
 */
export async function initiateCall(
  toPhoneNumber: string,
  webhookUrl: string,
  statusCallbackUrl: string
): Promise<string> {
  if (!twilioPhoneNumber) {
    throw new Error("TWILIO_PHONE_NUMBER is not configured");
  }

  const call = await twilioClient.calls.create({
    to: toPhoneNumber,
    from: twilioPhoneNumber,
    url: webhookUrl,
    statusCallback: statusCallbackUrl,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    statusCallbackMethod: "POST",
  });

  console.log(`[Twilio] Initiated call: ${call.sid} to ${toPhoneNumber}`);
  return call.sid;
}

/**
 * Generate TwiML to connect the call to a media stream
 */
export function generateMediaStreamTwiML(
  websocketUrl: string,
  callSid: string,
  phoneNumber: string
): string {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${websocketUrl}">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="phoneNumber" value="${phoneNumber}" />
    </Stream>
  </Connect>
</Response>`;

  return twiml;
}

/**
 * End an active call
 */
export async function endCall(callSid: string): Promise<void> {
  await twilioClient.calls(callSid).update({ status: "completed" });
  console.log(`[Twilio] Ended call: ${callSid}`);
}

/**
 * Validate a phone number format (E.164)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number], max 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Format a phone number to E.164 format
 * Basic implementation - assumes US numbers without country code
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // If already has country code (11 digits starting with 1 for US)
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Otherwise, assume it's already in the right format with +
  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  throw new Error(`Invalid phone number format: ${phoneNumber}`);
}
