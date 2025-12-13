
import { createClient } from '@supabase/supabase-js';
import { UserContext, TaskItem, MemoryItem, Message, ApprovalItem } from '../types';
import { INITIAL_TASKS, INITIAL_APPROVALS } from '../constants';

// --- CONFIGURATION ---

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const SQUARE_PAYMENT_LINKS = {
    executive: 'https://squareup.com/payment-link/test_executive_placeholder', 
    total_command: 'https://squareup.com/payment-link/test_total_command_placeholder'
};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase Keys are missing. Authentication will not work properly.");
}

export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co', 
    SUPABASE_ANON_KEY || 'placeholder'
);

// --- DATA ACCESS LAYER ---

// 1. PROFILES
export const api = {
    profile: {
        get: async (userId: string): Promise<UserContext | null> => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            // Map snake_case DB to camelCase TypeScript interface
            return {
                name: data.full_name || 'User',
                role: data.role || 'business',
                subscriptionTier: data.subscription_tier || 'executive',
                strictness: data.strictness || 'high',
                verbosity: data.verbosity || 'conversational',
                checkInFrequency: 'medium' // default, not in DB yet
            };
        },
        update: async (userId: string, updates: Partial<UserContext>) => {
            // Map updates back to snake_case
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.full_name = updates.name;
            if (updates.role) dbUpdates.role = updates.role;
            if (updates.subscriptionTier) dbUpdates.subscription_tier = updates.subscriptionTier;
            if (updates.strictness) dbUpdates.strictness = updates.strictness;
            if (updates.verbosity) dbUpdates.verbosity = updates.verbosity;

            const { error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', userId);
            
            if (error) throw error;
        }
    },

    tasks: {
        list: async (userId: string): Promise<TaskItem[]> => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            // If new user has no tasks, seed them (Optional UX choice)
            if (data.length === 0) {
                 await Promise.all(INITIAL_TASKS.map(t => api.tasks.create(userId, t)));
                 return INITIAL_TASKS; // Return defaults immediately for UI responsiveness
            }

            return data.map((t: any) => ({
                id: t.id,
                text: t.text,
                status: t.status,
                priority: t.priority,
                category: t.category,
                due: t.due // Assuming we add 'due' column or store in metadata later
            }));
        },
        create: async (userId: string, task: Partial<TaskItem>) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    user_id: userId,
                    text: task.text,
                    status: task.status || 'todo',
                    priority: task.priority || 'medium',
                    category: task.category || 'strategic'
                })
                .select()
                .single();
            
            if (error) throw error;
            return {
                id: data.id,
                text: data.text,
                status: data.status,
                priority: data.priority,
                category: data.category
            } as TaskItem;
        },
        update: async (taskId: string, updates: Partial<TaskItem>) => {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: updates.status,
                    text: updates.text,
                    // map other fields as needed
                })
                .eq('id', taskId);
            
            if (error) throw error;
        },
        deleteCompleted: async (userId: string) => {
             const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('user_id', userId)
                .eq('status', 'done');
             if (error) throw error;
        }
    },

    memories: {
        list: async (userId: string): Promise<MemoryItem[]> => {
             const { data, error } = await supabase
                .from('memories')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false });
            
            if (error) throw error;
            return data as MemoryItem[];
        },
        create: async (userId: string, memory: Partial<MemoryItem>) => {
            const { data, error } = await supabase
                .from('memories')
                .insert({
                    user_id: userId,
                    category: memory.category,
                    key: memory.key,
                    value: memory.value
                })
                .select()
                .single();
            if (error) throw error;
            return data as MemoryItem;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('memories').delete().eq('id', id);
            if (error) throw error;
        }
    },

    messages: {
        list: async (userId: string): Promise<Message[]> => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: true }); // Chronological for chat
            
            if (error) throw error;
            return data.map((m: any) => ({
                id: m.id,
                role: m.role,
                text: m.text,
                timestamp: new Date(m.timestamp)
            }));
        },
        create: async (userId: string, msg: Message) => {
             const { error } = await supabase
                .from('messages')
                .insert({
                    user_id: userId,
                    role: msg.role,
                    text: msg.text,
                    timestamp: msg.timestamp.toISOString()
                });
            if (error) throw error;
        }
    },

    approvals: {
        list: async (userId: string): Promise<ApprovalItem[]> => {
            const { data, error } = await supabase
                .from('approvals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) {
                // If table doesn't exist yet, return empty or defaults safely
                console.warn("Approvals table might be missing.", error);
                return [];
            }
            
            if (data.length === 0) {
                // Seed for demo
                 await Promise.all(INITIAL_APPROVALS.map(a => api.approvals.create(userId, a)));
                 return INITIAL_APPROVALS; 
            }

            return data.map((a: any) => ({
                id: a.id,
                type: a.type,
                title: a.title,
                description: a.description,
                status: a.status,
                generatedContent: a.generated_content,
                metadata: a.metadata,
                executionPayload: a.execution_payload
            }));
        },
        create: async (userId: string, item: Partial<ApprovalItem>) => {
            const { data, error } = await supabase
                .from('approvals')
                .insert({
                    user_id: userId,
                    type: item.type,
                    title: item.title,
                    description: item.description,
                    status: item.status || 'pending',
                    generated_content: item.generatedContent,
                    metadata: item.metadata,
                    execution_payload: item.executionPayload
                })
                .select()
                .single();
            if (error) throw error;
            return {
                ...data,
                generatedContent: data.generated_content,
                executionPayload: data.execution_payload
            } as ApprovalItem;
        },
        delete: async (id: string) => {
             const { error } = await supabase.from('approvals').delete().eq('id', id);
             if (error) throw error;
        }
    }
};
