
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
  generatedContent?: string; // e.g. the email draft
  // The payload required to execute the action upon approval
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
  category: 'strategic' | 'errand'; // Added category
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
  id:string;
  type: 'missed' | 'incoming' | 'outgoing';
  contact: string;
  number: string;
  timestamp: string; // ISO string for simplicity in mocks
  duration?: string;
  voicemail?: {
    transcript: string;
    audioUrl?: string; // placeholder
    isNew: boolean;
  };
}

export interface UserContext {
  name: string;
  role: string;
  subscriptionTier: 'executive' | 'total_command'; // Updated plan names
  strictness?: 'low' | 'high';
  verbosity?: 'concise' | 'conversational';
  checkInFrequency?: 'low' | 'medium' | 'high'; // New setting
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  content: string;
  size: string;
  date: string;
}
