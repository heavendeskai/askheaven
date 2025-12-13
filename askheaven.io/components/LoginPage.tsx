
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignUp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        onLogin();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'azure' | 'apple') => {
      try {
          const { error } = await supabase.auth.signInWithOAuth({
              provider: provider,
              options: {
                  redirectTo: window.location.origin // Returns to this page after login
              }
          });
          if (error) throw error;
      } catch (err: any) {
          setError("Could not connect to " + provider);
      }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Please enter your email address first.");
          return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else alert("Password reset link sent to " + email);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-stone-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-stone-200 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[360px] relative z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-stone-200 ring-4 ring-white">
             <Sparkles size={20} />
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900 tracking-tight">
            AskHeaven<span className="text-stone-400">.io</span>
          </h1>
          <p className="text-stone-500 text-sm mt-2 tracking-wide font-light">Personal Command Center</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
            <button 
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
            </button>
            <button 
                onClick={() => handleSocialLogin('azure')}
                className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm"
            >
                <img src="https://www.svgrepo.com/show/452269/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
                Continue with Microsoft
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink-0 mx-4 text-stone-300 text-xs uppercase tracking-widest">Or via Email</span>
            <div className="flex-grow border-t border-stone-200"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-stone-200/50 border border-white/50 space-y-5 mt-4">
          <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest pl-1">Email Address</label>
             <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-100 focus:border-stone-800 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 text-stone-900 placeholder-stone-300 transition-all text-sm outline-none"
                placeholder="you@company.com"
                required
             />
          </div>
          <div className="space-y-1.5">
             <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest pl-1">Password</label>
             <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-100 focus:border-stone-800 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 text-stone-900 placeholder-stone-300 transition-all text-sm outline-none"
                placeholder="••••••••••••"
                required
             />
          </div>

          {error && <div className="text-red-500 text-xs bg-red-50 p-2 rounded">{error}</div>}

          <div className="pt-2">
            <Button 
                type="submit" 
                className="w-full justify-center py-4 rounded-xl text-sm shadow-lg shadow-stone-900/20 hover:shadow-xl hover:shadow-stone-900/30 transition-all duration-300" 
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
                        Sign In <ArrowRight size={16} className="ml-2 opacity-60" />
                    </span>
                )}
            </Button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-4">
           {onSwitchToSignUp && (
             <p className="text-xs text-stone-400 mb-2">
               Don't have an account?{' '}
               <button onClick={onSwitchToSignUp} className="text-stone-800 font-medium hover:underline transition-all">
                 Request Access
               </button>
             </p>
           )}
           <button 
             onClick={handleResetPassword}
             className="text-xs text-stone-400 hover:text-stone-800 transition-colors flex items-center justify-center gap-1.5 mx-auto group"
           >
             <Lock size={10} className="group-hover:text-stone-600" />
             Reset Password
           </button>
        </div>
      </div>
    </div>
  );
};
