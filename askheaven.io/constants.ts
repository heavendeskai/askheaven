
import { ApprovalItem, TaskItem, CallLogItem } from "./types";

export const HEAVEN_SYSTEM_INSTRUCTION = `
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
`;

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
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
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
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    duration: '14m 20s'
  },
  {
    id: '3',
    type: 'outgoing',
    contact: 'Delta Airlines Support',
    number: '+1 (800) 221-1212',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    duration: '45m 10s'
  },
  {
    id: '4',
    type: 'missed',
    contact: 'Contractor (Home)',
    number: '+1 (323) 555-9999',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // Yesterday
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
