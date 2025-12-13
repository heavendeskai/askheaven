
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Tool, Content, LiveServerMessage, Modality } from "@google/genai";
import { HEAVEN_SYSTEM_INSTRUCTION } from "../constants";
import { listEvents, listMessages, sendMessage as sendGmail, createEvent } from "./gmail"; // Added execution imports
import { DocumentItem, UserContext, Message, MemoryItem } from "../types";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// --- Tool Definitions ---

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

// --- LIVE API IMPLEMENTATION ---

export const connectToLiveSession = async (
    userProfile: UserContext | null,
    onAudioData: (data: ArrayBuffer) => void,
    onStatusChange: (status: string) => void
) => {
    const client = getAI();
    
    // Construct System Prompt
    let systemInstruction = HEAVEN_SYSTEM_INSTRUCTION;
    if (userProfile) {
        systemInstruction += `\n\nUser: ${userProfile.name} (${userProfile.role})`;
        systemInstruction += `\nStrictness: ${userProfile.strictness || 'high'}. Verbosity: ${userProfile.verbosity || 'conversational'}.`;
        if (userProfile.verbosity === 'concise') systemInstruction += "\nKeep voice responses extremely brief and direct.";
    }

    // Combine Tools
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
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Deep, calm male voice
            }
        },
        callbacks: {
            onopen: () => onStatusChange('connected'),
            onmessage: async (message: LiveServerMessage) => {
                // 1. Handle Audio Output
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    onAudioData(base64ToArrayBuffer(audioData));
                }

                // 2. Handle Tool Calls
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

                // 3. Handle Interruption
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

// --- HELPER FUNCTIONS ---

function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


// --- EXISTING CHAT LOGIC ---

export const initializeChat = async (documents: DocumentItem[] = [], userProfile?: UserContext, history: Content[] = [], memories: MemoryItem[] = []) => {
  const client = getAI();
  
  // 1. DYNAMIC TOOL INJECTION
  const activeTools: Tool[] = [];
  activeTools.push({ functionDeclarations: [...calendarTools, ...emailTools, ...taskTools, ...memoryTools] });
  if (userProfile && userProfile.subscriptionTier === 'premium') {
      activeTools.push({ functionDeclarations: phoneTools });
      activeTools.push({ googleSearch: {} }); 
  }

  // 2. CONTEXT AWARE SYSTEM INSTRUCTION
  let extendedInstruction = HEAVEN_SYSTEM_INSTRUCTION;
  if (userProfile) {
      extendedInstruction += `\n\n--- USER PROFILE ---\n`;
      extendedInstruction += `Name: ${userProfile.name}\n`;
      extendedInstruction += `Role: ${userProfile.role === 'business' ? 'Executive/Founder' : 'Household Manager'}\n`;
      extendedInstruction += `Subscription Tier: ${userProfile.subscriptionTier.toUpperCase()}\n`;
      extendedInstruction += `Strictness Level: ${userProfile.strictness || 'high'}\n`;
      extendedInstruction += `Verbosity Preference: ${userProfile.verbosity || 'conversational'}\n`;
      if (userProfile.verbosity === 'concise') {
          extendedInstruction += `INSTRUCTION: The user prefers CONCISE responses. Use bullet points. Omit pleasantries. Be extremely direct.\n`;
      }
      extendedInstruction += `--- END USER PROFILE ---\n`;
  }

  // 3. INJECT MEMORIES (THE NEURAL VAULT)
  if (memories.length > 0) {
      extendedInstruction += `\n\n--- LONG-TERM MEMORY (NEURAL VAULT) ---\n`;
      extendedInstruction += `Use this information to personalize responses without asking the user again.\n`;
      memories.forEach(m => {
          extendedInstruction += `[${m.category.toUpperCase()}] ${m.key}: ${m.value}\n`;
      });
      extendedInstruction += `--- END MEMORY ---\n`;
  }
  
  if (documents.length > 0) {
      extendedInstruction += "\n\n--- EXECUTIVE KNOWLEDGE BASE ---\n";
      documents.forEach(doc => {
          extendedInstruction += `[DOCUMENT: ${doc.name}]\n${doc.content}\n\n`;
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

// Return type now includes approvalRequests, generatedTasks, and generatedMemories
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
    
    // Loop to handle potential function calls
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
