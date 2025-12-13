
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---

// 1. SUPABASE KEYS
// In Vercel, you will add these as "Environment Variables" named exactly like this:
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 2. STRIPE PAYMENT LINKS
// Create these in your Stripe Dashboard (Products -> Payment Links)
// Paste the URLs here. It is safe to have these public.
export const STRIPE_PAYMENT_LINKS = {
    silver: 'https://buy.stripe.com/test_...', // REPLACE THIS with your actual Stripe Link for Silver Plan
    platinum: 'https://buy.stripe.com/test_...' // REPLACE THIS with your actual Stripe Link for Platinum Plan
};

// --- INITIALIZATION ---

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase Keys are missing. Authentication will not work until you add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or Vercel project.");
}

export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co', 
    SUPABASE_ANON_KEY || 'placeholder'
);
