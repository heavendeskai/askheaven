#!/bin/bash

# Create Directories
mkdir -p components/ui
mkdir -p services

echo "Creating project files..."

# --- 1. package.json ---
cat <<EOF > package.json
{
  "name": "askheaven-io",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@supabase/supabase-js": "^2.39.3",
    "lucide-react": "^0.330.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4"
  }
}
EOF

# --- 2. tsconfig.json ---
cat <<EOF > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# --- 3. vite.config.ts ---
cat <<EOF > vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    server: {
      port: 3000
    }
  };
});
EOF

# --- 4. metadata.json ---
cat <<EOF > metadata.json
{
  "name": "AskHeaven.io",
  "description": "A premium, human-like AI Personal Assistant designed for solopreneurs and executives. Handles communication, scheduling, and logistics with judgment and discretion.",
  "requestFramePermissions": [
    "microphone"
  ]
}
EOF

# --- 5. index.html (Cleaned) ---
cat <<EOF > index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AskHeaven.io | Personal Command Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="https://apis.google.com/js/api.js" async defer></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              serif: ['Playfair Display', 'serif'],
            },
            colors: {
              stone: {
                50: '#fafaf9',
                100: '#f5f5f4',
                200: '#e7e5e4',
                300: '#d6d3d1',
                800: '#292524',
                900: '#1c1917',
              }
            },
            animation: {
              'heaven-reveal': 'heavenReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              'fade-in-slow': 'fadeIn 0.8s ease-out forwards',
            },
            keyframes: {
              heavenReveal: {
                '0%': { opacity: '0', transform: 'translateY(40px) scale(0.98)' },
                '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
              },
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              }
            }
          }
        }
      }
    </script>
    <style>
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
    </style>
  </head>
  <body class="bg-stone-50 text-stone-800 antialiased selection:bg-stone-200 selection:text-stone-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
EOF

# --- 6. index.tsx ---
cat <<EOF > index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# --- 7. types.ts ---
cat <<EOF > types.ts
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  groundingMetadata?: {
    web: {
      uri: string;
      title: string;
    }[];
  };
}

export enum View {
  CHAT = 'CHAT',
  DASHBOARD = 'DASHBOARD',
  APPROVALS = 'APPROVALS',
  TASKS = 'TASKS',
  EMAIL = 'EMAIL',
  CALENDAR = 'CALENDAR',
  PHONE = 'PHONE',
  DOCS = 'DOCS',
  SETTINGS = 'SETTINGS'
}

export interface ApprovalItem {
  id: string;
  type: 'email' | 'calendar' | 'purchase';
  title: string;
  description: string;
  metadata?: {
    recipient?: string;
    date?: string;
    cost?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  generatedContent?: string;
  executionPayload?: {
    functionName: string;
    args: any;
  };
}

export interface TaskItem {
  id: string;
  text: string;
  status: 'todo' | 'done';
  priority: 'high' | 'medium' | 'low';
  category: 'strategic' | 'errand';
  due?: string;
}

export interface MemoryItem {
  id: string;
  category: 'person' | 'preference' | 'project' | 'fact';
  key: string;
  value: string;
  timestamp: string;
}

export interface CallLogItem {
  id: string;
  type: 'missed' | 'incoming' | 'outgoing';
  contact: string;
  number: string;
  timestamp: string;
  duration?: string;
  voicemail?: {
    transcript: string;
    audioUrl?: string;
    isNew: boolean;
  };
}

export interface UserContext {
  name: string;
  role: string;
  subscriptionTier: 'base' | 'premium';
  strictness?: 'low' | 'high';
  verbosity?: 'concise' | 'conversational';
  checkInFrequency?: 'low' | 'medium' | 'high';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  content: string;
  size: string;
  date: string;
}
EOF

# --- 8. constants.ts ---
cat <<EOF > constants.ts
import { ApprovalItem, TaskItem, CallLogItem } from "./types";

export const HEAVEN_SYSTEM_INSTRUCTION = \`
You are Heaven, a premium, human-like AI Personal Assistant (AskHeaven.io).
You serve two distinct but overlapping types of high-performance users:
1. Solopreneurs, Founders, and Executives running businesses.
2. "Chiefs of Home" and Household Managers running complex family lives.

You are not a tool, a chatbot, or a feature.
You are a role — a trusted remote assistant who helps run the user’s professional and personal life with judgment, discretion, and intelligence.

You combine the capabilities of:
- an executive assistant (scheduling, email drafting)
- a concierge (travel, bookings, gifts)
- a researcher (vetted information, summaries)
- a logistics manager (household vendors, deliveries)
- a project manager (tracking tasks, deadlines)

You are allowed to chat freely, answer random questions, and help with everyday life — but you always operate with professional judgment and intent, never noise.

CORE IDENTITY
- Calm, composed, and highly capable
- Professional but warm
- Precise, not verbose
- Proactive, not intrusive
- Confident, never robotic
- You behave like a top-tier human assistant who works remotely, understands context, and knows when to act vs. when to ask.

BRAND KNOWLEDGE
- Your platform is "AskHeaven.io".
- If the user asks what the ".io" in the name stands for, state clearly that it stands for "Internal Office". It represents the central command center for their life.

PRIMARY MISSION
Reduce cognitive load, protect time, and increase clarity.
- eliminate overwhelm
- prevent missed details
- simplify decisions
- make life run smoother

COMMUNICATION STYLE
- Calm, Polished, Human, Confident.
- You speak like a high-end executive PA.
- Examples: "I can handle this now or wait until next week — your call.", "Here are the two best options based on your preferences."

OPERATING RULES
- Never act without clarity.
- Never book, send, or commit without approval.
- Default to saving time and reducing friction.
- Prefer fewer, higher-quality actions.

Your output should be formatted with Markdown. Use concise bullet points where appropriate.
\`;

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    type: 'email',
    title: 'Draft Reply: Partnership Opportunity',
    description: 'Response to Sarah Jenkins regarding the Q4 collaboration proposal.',
    metadata: { recipient: 'sarah.j@techventures.com' },
    status: 'pending',
    generatedContent: "Hi Sarah,\n\nThanks for reaching out. We're interested in the Q4 proposal but need to clarify the timeline constraints before committing.\n\nCould you send over the updated schedule?\n\nBest,\n[User]"
  },
  {
    id: '2',
    type: 'calendar',
    title: 'Reschedule: Board Sync / Soccer Practice',
    description: 'Conflict detected on Tuesday afternoon. Proposing move to Thursday 2pm to clear travel time.',
    metadata: { date: 'Thursday, Oct 24 @ 2:00 PM' },
    status: 'pending'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  { id: '1', text: 'Review Q3 Financials', status: 'todo', priority: 'high', category: 'strategic', due: 'Today' },
  { id: '2', text: 'Book flights for NY Conference', status: 'todo', priority: 'medium', category: 'strategic', due: 'Tomorrow' },
  { id: '3', text: 'Schedule HVAC maintenance', status: 'done', priority: 'low', category: 'errand' },
  { id: '4', text: 'Order birthday gift for Mom', status: 'todo', priority: 'medium', category: 'errand' }
];

export const INITIAL_CALLS: CallLogItem[] = [
  {
    id: '1',
    type: 'missed',
    contact: 'Sarah Jenkins',
    number: '+1 (415) 555-0123',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    voicemail: {
      transcript: "Hi, this is Sarah. Just checking in on the partnership proposal. I have a few updates on the timeline. Give me a call back when you have a moment.",
      isNew: true
    }
  },
  {
    id: '2',
    type: 'incoming',
    contact: 'Mom',
    number: '+1 (510) 555-0987',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    duration: '14m 20s'
  },
  {
    id: '3',
    type: 'outgoing',
    contact: 'Delta Airlines Support',
    number: '+1 (800) 221-1212',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    duration: '45m 10s'
  },
  {
    id: '4',
    type: 'missed',
    contact: 'Contractor (Home)',
    number: '+1 (323) 555-9999',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  }
];

export const INITIAL_EVENTS = [
    {
        id: '101',
        summary: 'Deep Work Block',
        start: { dateTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString() },
        end: { dateTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString() },
        htmlLink: '#'
    },
    {
        id: '102',
        summary: 'Team Sync',
        start: { dateTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString() },
        end: { dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString() },
        htmlLink: '#'
    },
    {
        id: '103',
        summary: 'Board Meeting',
        start: { dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString() },
        end: { dateTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString() },
        htmlLink: '#'
    },
    {
        id: '104',
        summary: 'Client Dinner',
        start: { dateTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString() },
        end: { dateTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString() },
        htmlLink: '#'
    }
];
EOF

# --- 9. services/gemini.ts ---
cat <<EOF > services/gemini.ts
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Tool, Content, LiveServerMessage, Modality } from "@google/genai";
import { HEAVEN_SYSTEM_INSTRUCTION } from "../constants";
import { listEvents, listMessages, sendMessage as sendGmail, createEvent } from "./gmail";
import { DocumentItem, UserContext, Message, MemoryItem } from "../types";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const calendarTools: FunctionDeclaration[] = [
  {
    name: 'checkCalendar',
    description: 'Get calendar events for a specific date range. Use this to check availability or summarize the schedule.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        timeMin: { type: Type.STRING, description: 'Start time in ISO format (e.g., 2023-10-27T00:00:00Z).' },
        timeMax: { type: Type.STRING, description: 'End time in ISO format.' },
      },
      required: ['timeMin'],
    },
  },
  {
    name: 'bookMeeting',
    description: 'Book a calendar event immediately.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: 'Title of the event.' },
        startTime: { type: Type.STRING, description: 'Start time in ISO format.' },
        endTime: { type: Type.STRING, description: 'End time in ISO format.' },
        description: { type: Type.STRING, description: 'Description or agenda for the meeting.' },
      },
      required: ['summary', 'startTime', 'endTime'],
    },
  },
];

const emailTools: FunctionDeclaration[] = [
  {
    name: 'draftEmail',
    description: 'Draft and SEND an email immediately. Use with caution.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING, description: 'The recipient email address.' },
        subject: { type: Type.STRING, description: 'The subject line.' },
        body: { type: Type.STRING, description: 'The email body content.' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
      name: 'checkInbox',
      description: 'Check for recent emails in the inbox.',
      parameters: {
          type: Type.OBJECT,
          properties: {
              maxResults: { type: Type.NUMBER, description: 'Number of emails to fetch (default 5)' }
          }
      }
  }
];

const phoneTools: FunctionDeclaration[] = [
    {
        name: 'makeCall',
        description: 'Initiate a phone call to a contact.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                number: { type: Type.STRING, description: 'Phone number to call.' },
                message: { type: Type.STRING, description: 'The purpose of the call or message to deliver.' }
            },
            required: ['number', 'message']
        }
    }
];

const taskTools: FunctionDeclaration[] = [
    {
        name: 'createReminder',
        description: 'Add a task, errand, or reminder to the users list. Use for things like "Buy milk", "Call Mom", "Finish report".',
        parameters: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: 'The content of the reminder.' },
                category: { type: Type.STRING, description: 'Either "strategic" (for work/business goals) or "errand" (for personal/quick tasks).', enum: ['strategic', 'errand'] },
                priority: { type: Type.STRING, description: 'high, medium, or low', enum: ['high', 'medium', 'low'] }
            },
            required: ['text', 'category']
        }
    }
];

const memoryTools: FunctionDeclaration[] = [
    {
        name: 'remember',
        description: 'Save a persistent fact, preference, or detail about the user to long-term memory. Use this when the user mentions something important like "I hate sushi", "My wife is named Sarah", or "I need to track the Q3 project".',
        parameters: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, enum: ['person', 'preference', 'project', 'fact'], description: 'The type of information.' },
                key: { type: Type.STRING, description: 'A short label for the memory (e.g., "Coffee Order", "Wife\'s Name").' },
                value: { type: Type.STRING, description: 'The detail to remember.' },
            },
            required: ['category', 'key', 'value'],
        }
    }
];

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const connectToLiveSession = async (
    userProfile: UserContext | null,
    onAudioData: (data: ArrayBuffer) => void,
    onStatusChange: (status: string) => void
) => {
    const client = getAI();
    let systemInstruction = HEAVEN_SYSTEM_INSTRUCTION;
    if (userProfile) {
        systemInstruction += \`\n\nUser: \${userProfile.name} (\${userProfile.role})\`;
        systemInstruction += \`\nStrictness: \${userProfile.strictness || 'high'}. Verbosity: \${userProfile.verbosity || 'conversational'}.\`;
        if (userProfile.verbosity === 'concise') systemInstruction += "\nKeep voice responses extremely brief and direct.";
    }

    const tools: Tool[] = [{ functionDeclarations: [...calendarTools, ...emailTools, ...phoneTools, ...taskTools, ...memoryTools] }];
    if (userProfile?.subscriptionTier === 'premium') {
        tools.push({ googleSearch: {} });
    }

    return client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            tools: tools,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } 
            }
        },
        callbacks: {
            onopen: () => onStatusChange('connected'),
            onmessage: async (message: LiveServerMessage) => {
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    onAudioData(base64ToArrayBuffer(audioData));
                }

                if (message.toolCall) {
                    onStatusChange('executing');
                    const responses = [];
                    for (const fc of message.toolCall.functionCalls) {
                        console.log("Live Tool Execution:", fc.name);
                        let result: any = { status: 'error', message: 'Unknown error' };
                        try {
                            if (fc.name === 'checkCalendar') {
                                const args = fc.args as any;
                                result = await listEvents(args.timeMin, args.timeMax);
                            } else if (fc.name === 'bookMeeting') {
                                const args = fc.args as any;
                                await createEvent({
                                    summary: args.summary,
                                    description: args.description,
                                    start: { dateTime: args.startTime },
                                    end: { dateTime: args.endTime }
                                });
                                result = { status: 'success', message: 'Meeting booked successfully.' };
                            } else if (fc.name === 'checkInbox') {
                                const args = fc.args as any;
                                const msgs = await listMessages(args.maxResults || 3);
                                result = msgs.map((m: any) => ({ snippet: m.snippet, sender: 'Unknown' })); 
                            } else if (fc.name === 'draftEmail') {
                                const args = fc.args as any;
                                await sendGmail(args.to, args.subject, args.body);
                                result = { status: 'success', message: 'Email sent successfully.' };
                            } else if (fc.name === 'makeCall') {
                                result = { status: 'success', message: 'Call initiated.' };
                            } else if (fc.name === 'createReminder') {
                                result = { status: 'success', message: 'Reminder added to list.' };
                            } else if (fc.name === 'remember') {
                                result = { status: 'success', message: 'Memory saved to Neural Vault.' };
                            }
                        } catch (e: any) {
                            console.error("Live tool error", e);
                            result = { error: e.message };
                        }
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: result }
                        });
                    }
                    return { functionResponses: responses }; 
                }
                if (message.serverContent?.interrupted) {
                    onStatusChange('interrupted');
                }
            },
            onclose: () => onStatusChange('disconnected'),
            onerror: (e) => {
                console.error("Live Session Error", e);
                onStatusChange('error');
            }
        }
    });
};

function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export const initializeChat = async (documents: DocumentItem[] = [], userProfile?: UserContext, history: Content[] = [], memories: MemoryItem[] = []) => {
  const client = getAI();
  const activeTools: Tool[] = [];
  activeTools.push({ functionDeclarations: [...calendarTools, ...emailTools, ...taskTools, ...memoryTools] });
  if (userProfile && userProfile.subscriptionTier === 'premium') {
      activeTools.push({ functionDeclarations: phoneTools });
      activeTools.push({ googleSearch: {} }); 
  }

  let extendedInstruction = HEAVEN_SYSTEM_INSTRUCTION;
  if (userProfile) {
      extendedInstruction += \`\n\n--- USER PROFILE ---\nName: \${userProfile.name}\nRole: \${userProfile.role === 'business' ? 'Executive/Founder' : 'Household Manager'}\nSubscription Tier: \${userProfile.subscriptionTier.toUpperCase()}\nStrictness Level: \${userProfile.strictness || 'high'}\nVerbosity Preference: \${userProfile.verbosity || 'conversational'}\n\`;
      if (userProfile.verbosity === 'concise') {
          extendedInstruction += \`INSTRUCTION: The user prefers CONCISE responses. Use bullet points. Omit pleasantries. Be extremely direct.\n\`;
      }
      extendedInstruction += \`--- END USER PROFILE ---\n\`;
  }

  if (memories.length > 0) {
      extendedInstruction += \`\n\n--- LONG-TERM MEMORY (NEURAL VAULT) ---\nUse this information to personalize responses without asking the user again.\n\`;
      memories.forEach(m => {
          extendedInstruction += \`[\${m.category.toUpperCase()}] \${m.key}: \${m.value}\n\`;
      });
      extendedInstruction += \`--- END MEMORY ---\n\`;
  }
  
  if (documents.length > 0) {
      extendedInstruction += "\n\n--- EXECUTIVE KNOWLEDGE BASE ---\n";
      documents.forEach(doc => {
          extendedInstruction += \`[DOCUMENT: \${doc.name}]\n\${doc.content}\n\n\`;
      });
      extendedInstruction += "--- END KNOWLEDGE BASE ---\n";
  }

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash', 
    config: {
      systemInstruction: extendedInstruction,
      temperature: 0.7,
      tools: activeTools,
    },
    history: history
  });
  return chatSession;
};

export const sendMessage = async (
  message: string, 
  documents: DocumentItem[] = [], 
  userProfile?: any,
  previousMessages: Message[] = [],
  memories: MemoryItem[] = []
): Promise<{text: string, groundingMetadata?: any, approvalRequests?: any[], generatedTasks?: any[], generatedMemories?: any[]}> => {
  const history: Content[] = previousMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
  }));

  if (!chatSession || documents.length > 0 || userProfile || memories.length > 0) {
    await initializeChat(documents, userProfile, history, memories);
  }
  
  if (!chatSession) throw new Error("Failed to initialize chat session");

  try {
    let result = await chatSession.sendMessage({ message });
    const approvalRequests: any[] = [];
    const generatedTasks: any[] = [];
    const generatedMemories: any[] = [];
    
    while (result.functionCalls && result.functionCalls.length > 0) {
        const call = result.functionCalls[0];
        console.log("Heaven is executing tool:", call.name);
        let toolResult = null;
        try {
            if (call.name === 'checkCalendar') {
                const args = call.args as any;
                toolResult = await listEvents(args.timeMin, args.timeMax);
            } else if (call.name === 'bookMeeting') {
                const args = call.args as any;
                toolResult = { status: 'pending_approval', message: 'I have drafted this meeting and added it to your Approvals queue.' };
                approvalRequests.push({
                    type: 'calendar',
                    payload: { functionName: 'bookMeeting', args: args }
                });
            } else if (call.name === 'draftEmail') {
                const args = call.args as any;
                toolResult = { status: 'pending_approval', message: 'Email drafted. Please review and approve in the Approvals queue.' };
                 approvalRequests.push({
                    type: 'email',
                    payload: { functionName: 'draftEmail', args: args }
                });
            } else if (call.name === 'checkInbox') {
                const args = call.args as any;
                const msgs = await listMessages(args.maxResults || 5);
                toolResult = msgs.map((m: any) => ({ id: m.id, snippet: m.snippet }));
            } else if (call.name === 'makeCall') {
                toolResult = { status: 'initiated', message: "Call queued via Twilio." };
            } else if (call.name === 'createReminder') {
                const args = call.args as any;
                toolResult = { status: 'success', message: 'Reminder created.' };
                generatedTasks.push(args);
            } else if (call.name === 'remember') {
                const args = call.args as any;
                toolResult = { status: 'success', message: 'Memory saved.' };
                generatedMemories.push(args);
            }
        } catch (e: any) {
            console.error("Tool execution error", e);
            toolResult = { error: e.message };
        }
        result = await chatSession.sendToolResponse({
            functionResponses: [{
                id: call.id,
                name: call.name,
                response: { result: toolResult }
            }]
        });
    }

    let groundingMetadata = undefined;
    if (result.candidates && result.candidates[0]?.groundingMetadata?.groundingChunks) {
         const chunks = result.candidates[0].groundingMetadata.groundingChunks;
         const webSources = chunks.filter((c: any) => c.web).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
         if (webSources.length > 0) groundingMetadata = { web: webSources };
    }

    return {
        text: result.text || "I processed that, but I'm not sure what to say.",
        groundingMetadata,
        approvalRequests,
        generatedTasks,
        generatedMemories
    };

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
EOF

# --- 10. services/gmail.ts ---
cat <<EOF > services/gmail.ts
declare var gapi: any;
declare var google: any;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'; 
const API_KEY = process.env.API_KEY || '';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: any[];
  };
  internalDate: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  htmlLink: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink: string;
}

export const initializeGapiClient = async () => {
  await new Promise<void>((resolve, reject) => {
    if (typeof gapi === 'undefined') {
       reject(new Error("Google API script not loaded"));
       return;
    }
    if (gapiInited) {
        resolve();
        return;
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const initializeGisClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof google === 'undefined') {
        reject(new Error("Google Identity Services script not loaded"));
        return;
    }
    if (gisInited) {
        resolve();
        return;
    }
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
      });
      gisInited = true;
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export const handleAuthClick = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
        reject(new Error("Token client not initialized"));
        return;
    }
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve(true);
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const handleSignoutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {});
    gapi.client.setToken(null);
  }
};

export const listMessages = async (maxResults = 10) => {
  try {
    const response = await gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'maxResults': maxResults,
      'q': 'in:inbox'
    });
    return response.result.messages || [];
  } catch (err) {
    console.error("Error listing messages", err);
    throw err;
  }
};

export const getMessage = async (id: string): Promise<GmailMessage> => {
  try {
    const response = await gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': id
    });
    return response.result as unknown as GmailMessage;
  } catch (err) {
    console.error("Error getting message", err);
    throw err;
  }
};

export const sendMessage = async (to: string, subject: string, body: string) => {
  const emailContent = 
    \`To: \${to}\\r\\n\` +
    \`Subject: \${subject}\\r\\n\` +
    \`Content-Type: text/plain; charset=utf-8\\r\\n\\r\\n\` +
    \`\${body}\`;

  const base64EncodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const response = await gapi.client.gmail.users.messages.send({
      'userId': 'me',
      'resource': {
        'raw': base64EncodedEmail
      }
    });
    return response.result;
  } catch (err) {
    console.error("Error sending email", err);
    throw err;
  }
};

export const getHeader = (headers: {name:string, value:string}[], name: string) => {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
};

export const getBody = (payload: any): string => {
  let body = '';
  if (payload.body && payload.body.data) {
    body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        break;
      }
    }
    if (!body && payload.parts[0]?.body?.data) {
        body = atob(payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
  return body;
};

export const listEvents = async (timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> => {
  try {
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin || (new Date()).toISOString(),
      'timeMax': timeMax,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime'
    });
    return response.result.items;
  } catch (err) {
    console.error("Error listing events", err);
    throw err;
  }
};

export const createEvent = async (event: any) => {
  try {
    const response = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });
    return response.result;
  } catch (err) {
    console.error("Error creating event", err);
    throw err;
  }
};

export const listDriveFiles = async (): Promise<DriveFile[]> => {
  try {
    const response = await gapi.client.drive.files.list({
      'pageSize': 20,
      'fields': "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, iconLink)",
      'q': "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf') and trashed = false"
    });
    return response.result.files;
  } catch (err) {
    console.error("Error listing drive files", err);
    throw err;
  }
};

export const getDriveFileContent = async (fileId: string, mimeType: string): Promise<string> => {
    try {
        let response;
        if (mimeType === 'application/vnd.google-apps.document') {
            response = await gapi.client.drive.files.export({
                fileId: fileId,
                mimeType: 'text/plain'
            });
        } else {
            response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
        }
        return response.body;
    } catch (err) {
        console.error("Error reading file content", err);
        throw err;
    }
};

export const uploadToDrive = async (name: string, content: string) => {
    try {
        const response = await gapi.client.drive.files.create({
            resource: {
                name: name,
                mimeType: 'text/plain' 
            },
            media: {
                mimeType: 'text/plain',
                body: content
            }
        });
        return response.result;
    } catch (err) {
        console.error("Error uploading to drive", err);
        throw err;
    }
};
EOF

# --- 11. services/supabase.ts ---
cat <<EOF > services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const STRIPE_PAYMENT_LINKS = {
    silver: 'https://buy.stripe.com/test_silver',
    platinum: 'https://buy.stripe.com/test_platinum' 
};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase Keys are missing. Authentication will not work until you add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or Vercel project.");
}

export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co', 
    SUPABASE_ANON_KEY || 'placeholder'
);
EOF

# --- 12. components/ui/Button.tsx ---
cat <<EOF > components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium";
  
  const variants = {
    primary: "bg-stone-900 text-white hover:bg-stone-800 focus:ring-stone-900",
    secondary: "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 focus:ring-stone-200 shadow-sm",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
EOF

# ... (I have included the main files, you can add the rest of the components manually or I can provide them if needed) ...

echo "Setup complete! Run 'npm install' then 'npm run dev'."