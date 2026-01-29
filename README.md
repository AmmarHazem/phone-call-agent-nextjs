# Phone Call Agent

An AI-powered phone call agent application that enables users to initiate voice calls from a web interface and have real-time conversations with an AI assistant. The application bridges web browsers with phone calls via **Twilio** and **ElevenLabs Conversational AI**.

## Features

- **Initiate Outbound Calls**: Enter a phone number in the web UI and the system places an outbound call using Twilio
- **Real-time Voice Conversation**: AI assistant handles the conversation automatically once the call is answered
- **Live Transcript Display**: The web UI shows a real-time transcript of the conversation
- **Custom AI Prompts**: Customize the system prompt before initiating a call to guide the AI's behavior
- **Call Status Tracking**: Real-time call status updates (initiating, ringing, in-progress, completed, etc.)
- **Call Duration Counter**: Shows elapsed time during active calls
- **Call Control**: End call button to terminate conversations

## Tech Stack

- **Next.js 16** - React framework with API routes
- **React 19** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Twilio SDK** - Phone call management (PSTN integration)
- **ElevenLabs API** - Conversational AI voice agent

## Project Structure

```
phone-call-agent/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main UI page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── api/                      # API Routes
│       ├── call/
│       │   ├── initiate/         # Initiates outbound calls
│       │   ├── webhook/          # Twilio voice webhook
│       │   ├── status/           # Call status updates
│       │   └── events/           # SSE stream for real-time updates
│       └── elevenlabs/
│           └── webhook/          # ElevenLabs event webhook
├── components/                   # React Components
│   ├── PhoneDialer.tsx           # Phone input & system prompt
│   ├── CallStatus.tsx            # Call status display
│   ├── Transcript.tsx            # Real-time conversation
│   └── CallControls.tsx          # End call button
├── hooks/
│   └── useCall.tsx               # Call state management
├── lib/                          # Utilities
│   ├── twilio.ts                 # Twilio client
│   ├── elevenlabs.ts             # ElevenLabs API
│   └── sse-manager.ts            # SSE event broadcasting
└── types/
    └── call.ts                   # TypeScript interfaces
```

## Prerequisites

- Node.js 18+
- [Twilio Account](https://www.twilio.com) with a phone number
- [ElevenLabs Account](https://elevenlabs.io) with a Conversational AI agent
- [ngrok](https://ngrok.com) (for local development)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxxxxx

# Application URL (use ngrok for local development)
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
```

### 3. Configure Twilio

1. Create an account at https://www.twilio.com
2. Purchase a phone number with Voice capability
3. Get Account SID and Auth Token from the Console
4. Configure your phone number's voice settings:
   - **Voice webhook URL**: `{NEXT_PUBLIC_APP_URL}/api/call/webhook`
   - **Status callback URL**: `{NEXT_PUBLIC_APP_URL}/api/call/status`

### 4. Configure ElevenLabs

1. Create an account at https://elevenlabs.io
2. Create a Conversational AI Agent
3. Get your Agent ID and API Key
4. Configure the webhook URL in ElevenLabs: `{NEXT_PUBLIC_APP_URL}/api/elevenlabs/webhook`

## Running the Application

### Terminal 1 - Start ngrok (for local development)

```bash
ngrok http 3000
```

Copy the HTTPS URL and update `NEXT_PUBLIC_APP_URL` in `.env.local`.

### Terminal 2 - Start the Development Server

```bash
npm run dev
```

The app runs at http://localhost:3000.

## Usage

1. Open http://localhost:3000 in your browser
2. Enter a phone number (E.164 format: +1XXXXXXXXXX for US)
3. Optionally customize the AI system prompt
4. Click "Start Call"
5. Answer the call on your phone
6. Speak with the AI assistant
7. Watch the transcript appear in real-time
8. Click "End Call" to terminate

## How It Works

```
Browser → POST /api/call/initiate → Twilio API (place call)
                                         ↓
              Twilio webhook → POST /api/call/webhook
                                         ↓
              Register with ElevenLabs → Return TwiML to Twilio
                                         ↓
              ElevenLabs handles voice conversation
                                         ↓
              Events → POST /api/elevenlabs/webhook
                                         ↓
              SSE Manager → Browser receives real-time updates
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run linter
```

## Phone Number Formats

The application accepts various phone number formats:
- E.164 format: `+14155552671` (recommended)
- 10-digit US: `4155552671` (auto-formatted to +1)
- 11-digit with country code: `14155552671` (auto-formatted to +1)

## License

MIT
