
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SignUpPageProps {
  onSignUp: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) throw error;
        
        // If email confirmation is disabled in Supabase, this logs them in immediately
        // If enabled, they need to check email. For demo, we assume immediate.
        if (data.session) {
            onSignUp();
        } else {
             alert("Please check your email to confirm your account.");
             onSwitchToLogin();
        }

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-stone-200 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-stone-200 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[380px] relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg ring-4 ring-white">
             <Sparkles size={18} />
          </div>
          <h1 className="font-serif text-2xl font-medium text-stone-900 tracking-tight">
            Request Access
          </h1>
          <p className="text-stone-500 text-sm mt-1">Join the waitlist for AskHeaven.io</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-white/50 space-y-4">
          
          <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest pl-1">Full Name</label>
             <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-100 focus:border-stone-800 focus:bg-white focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-stone-900 placeholder-stone-300 transition-all text-sm outline-none"
                    placeholder="Alex Mercer"
                    required
                />
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest pl-1">Work Email</label>
             <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-100 focus:border-stone-800 focus:bg-white focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-stone-900 placeholder-stone-300 transition-all text-sm outline-none"
                    placeholder="alex@company.com"
                    required
                />
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest pl-1">Password</label>
             <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-100 focus:border-stone-800 focus:bg-white focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-stone-900 placeholder-stone-300 transition-all text-sm outline-none"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                />
             </div>
          </div>

          {error && <div className="text-red-500 text-xs bg-red-50 p-2 rounded">{error}</div>}

          <div className="pt-4">
            <Button 
                type="submit" 
                className="w-full justify-center py-3.5 rounded-xl text-sm shadow-lg shadow-stone-900/10 hover:shadow-xl hover:shadow-stone-900/20 transition-all duration-300" 
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></span>
                    </span>
                ) : (
                    <span className="flex items-center">
                        Create Account <ArrowRight size={16} className="ml-2 opacity-60" />
                    </span>
                )}
            </Button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8">
           <p className="text-xs text-stone-400">
             Already have an account?{' '}
             <button 
               onClick={onSwitchToLogin}
               className="text-stone-800 font-medium hover:underline transition-all"
             >
               Sign In
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};
