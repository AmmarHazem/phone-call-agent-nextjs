const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export interface RegisterCallResponse {
  agent_id?: string;
  conversation_id?: string;
  // The register-call endpoint returns TwiML directly for Twilio integration
  twiml: string;
}

export interface RegisterCallParams {
  agentId: string;
  callSid: string;
  fromNumber: string;
  toNumber: string;
  systemPrompt?: string;
}

/**
 * Register an incoming/outgoing call with ElevenLabs Conversational AI
 * This integrates with Twilio to handle the call via ElevenLabs
 */
export async function registerCall(
  params: RegisterCallParams
): Promise<RegisterCallResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    agent_id: params.agentId,
    from_number: params.fromNumber,
    to_number: params.toNumber,
    conversation_initiation_client_data: {
      dynamic_variables: {
        call_sid: params.callSid,
      },
    },
  };

  // Override system prompt if provided
  if (params.systemPrompt) {
    body.conversation_initiation_client_data = {
      ...(body.conversation_initiation_client_data as Record<string, unknown>),
      conversation_config_override: {
        agent: {
          prompt: { prompt: params.systemPrompt },
        },
      },
    };
  }

  const response = await fetch(`${ELEVENLABS_API}/convai/twilio/register-call`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs register call failed: ${response.status} - ${errorText}`
    );
  }

  // Check content type - ElevenLabs returns TwiML directly as XML
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
    // Response is TwiML XML directly
    const twiml = await response.text();
    return { twiml };
  }

  // Response is JSON (fallback)
  const json = await response.json();
  return {
    agent_id: json.agent_id,
    conversation_id: json.conversation_id,
    twiml: json.twiml,
  };
}
