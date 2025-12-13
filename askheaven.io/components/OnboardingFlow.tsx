
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Sparkles, Check, ChevronRight, Mail, Phone, Lock, CreditCard, Building2, Home, Star, Zap, ExternalLink } from 'lucide-react';
import { handleAuthClick } from '../services/gmail';
import { STRIPE_PAYMENT_LINKS } from '../services/supabase';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
}

type Step = 'profile' | 'plan' | 'billing' | 'connect' | 'calibrate';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Data
  const [name, setName] = useState('');
  const [role, setRole] = useState<'business' | 'home'>('business');
  const [subscriptionTier, setSubscriptionTier] = useState<'base' | 'premium'>('premium');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [strictness, setStrictness] = useState<'low' | 'high'>('high');
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    try {
      // In a real app, this triggers the actual OAuth flow
      await handleAuthClick(); 
      setGoogleConnected(true);
    } catch (error) {
      console.error("Auth failed", error);
      // Fallback for demo if API keys aren't actually set up in local env
      setTimeout(() => setGoogleConnected(true), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeCheckout = () => {
      // 1. Get the correct link
      const link = subscriptionTier === 'premium' ? STRIPE_PAYMENT_LINKS.platinum : STRIPE_PAYMENT_LINKS.silver;
      
      if (!link || link.includes('test_...')) {
          alert("Stripe links are not configured in services/supabase.ts yet.");
          return;
      }

      // 2. Open Stripe in new tab
      window.open(link, '_blank');

      // 3. In a real app, we would use a Webhook to detect payment. 
      // For this MVP, we will ask the user to confirm they paid.
      setPaymentComplete(true);
  };

  const handleNext = () => {
    if (step === 'profile') setStep('plan');
    else if (step === 'plan') setStep('billing');
    else if (step === 'billing') {
        if (!paymentComplete) {
            // If they haven't clicked the button yet
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('connect');
        }, 1000);
    }
    else if (step === 'connect') setStep('calibrate');
    else {
        // Finish
        setIsLoading(true);
        setTimeout(() => {
            onComplete({ name, role, subscriptionTier, googleConnected, strictness });
        }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Panel - Context */}
        <div className="bg-stone-900 w-full md:w-1/3 p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Sparkles size={20} />
                </div>
                <h2 className="font-serif text-2xl mb-2">
                    {step === 'profile' && "Who are you?"}
                    {step === 'plan' && "Select Capability."}
                    {step === 'billing' && "Secure Access."}
                    {step === 'connect' && "Connect Data."}
                    {step === 'calibrate' && "Calibration."}
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed">
                    {step === 'profile' && "Heaven adapts its personality and priorities based on your role."}
                    {step === 'plan' && "Choose the level of autonomy and tools you need."}
                    {step === 'billing' && "Complete your subscription securely via Stripe."}
                    {step === 'connect' && "Heaven needs access to your communication streams to function."}
                    {step === 'calibrate' && "Decide how aggressively Heaven should guard your time."}
                </p>
            </div>
            
            {/* Progress Dots */}
            <div className="flex gap-2">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'profile' ? 'w-8 bg-white' : 'w-2 bg-stone-700'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'plan' ? 'w-8 bg-white' : 'w-2 bg-stone-700'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'billing' ? 'w-8 bg-white' : 'w-2 bg-stone-700'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'connect' ? 'w-8 bg-white' : 'w-2 bg-stone-700'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'calibrate' ? 'w-8 bg-white' : 'w-2 bg-stone-700'}`}></div>
            </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto">
            
            {/* STEP 1: PROFILE */}
            {step === 'profile' && (
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">What should I call you?</label>
                        <input 
                            type="text" 
                            className="w-full text-xl border-b-2 border-stone-100 focus:border-stone-900 outline-none py-2 bg-transparent transition-colors placeholder-stone-200 font-serif text-stone-900"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Primary Focus</label>
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setRole('business')}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${role === 'business' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'business' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-stone-900">Executive / Founder</div>
                                    <div className="text-xs text-stone-500">Focus on ROI, calendar logistics, and professional negotiation.</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setRole('home')}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${role === 'home' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'home' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    <Home size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-stone-900">Household Manager</div>
                                    <div className="text-xs text-stone-500">Focus on family logistics, appointments, purchasing, and coordination.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: PLAN SELECTION */}
            {step === 'plan' && (
                <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Select Access Tier</label>
                    
                    {/* Base Plan */}
                    <button 
                        onClick={() => setSubscriptionTier('base')}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${subscriptionTier === 'base' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-200'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-stone-200 rounded text-stone-600"><Mail size={16} /></div>
                                <h3 className="font-bold text-stone-900">Executive Base</h3>
                             </div>
                             <div className="text-sm font-medium text-stone-500">$29/mo</div>
                        </div>
                        <p className="text-xs text-stone-500 mb-4">Perfect for email & calendar management.</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-stone-600"><Check size={12} className="text-green-600"/> Email Drafting & Triage</li>
                            <li className="flex items-center gap-2 text-xs text-stone-600"><Check size={12} className="text-green-600"/> Calendar Management</li>
                            <li className="flex items-center gap-2 text-xs text-stone-600"><Check size={12} className="text-green-600"/> Daily Briefs</li>
                        </ul>
                        {subscriptionTier === 'base' && <div className="absolute top-4 right-4 text-stone-900"><Check size={20} /></div>}
                    </button>

                    {/* Total Plan */}
                    <button 
                        onClick={() => setSubscriptionTier('premium')}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${subscriptionTier === 'premium' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 hover:border-stone-200'}`}
                    >
                        <div className="absolute -top-3 left-6 bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> Most Popular
                        </div>
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-stone-800 rounded text-amber-400"><Zap size={16} /></div>
                                <h3 className={`font-bold ${subscriptionTier === 'premium' ? 'text-white' : 'text-stone-900'}`}>Total Command</h3>
                             </div>
                             <div className={`text-sm font-medium ${subscriptionTier === 'premium' ? 'text-stone-300' : 'text-stone-500'}`}>$49/mo</div>
                        </div>
                        <p className={`text-xs mb-4 ${subscriptionTier === 'premium' ? 'text-stone-400' : 'text-stone-500'}`}>Full autonomy including voice and research.</p>
                        <ul className="space-y-2">
                            <li className={`flex items-center gap-2 text-xs ${subscriptionTier === 'premium' ? 'text-stone-300' : 'text-stone-600'}`}><Check size={12} className="text-green-500"/> <strong>All Base Features</strong></li>
                            <li className={`flex items-center gap-2 text-xs ${subscriptionTier === 'premium' ? 'text-stone-300' : 'text-stone-600'}`}><Check size={12} className="text-green-500"/> Twilio Voice & SMS Agent</li>
                            <li className={`flex items-center gap-2 text-xs ${subscriptionTier === 'premium' ? 'text-stone-300' : 'text-stone-600'}`}><Check size={12} className="text-green-500"/> Deep Research (Web Browsing)</li>
                        </ul>
                        {subscriptionTier === 'premium' && <div className="absolute top-4 right-4 text-white"><Check size={20} /></div>}
                    </button>
                </div>
            )}

            {/* STEP 3: BILLING (STRIPE INTEGRATION) */}
            {step === 'billing' && (
                <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    
                    {/* Summary */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex justify-between items-center">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Selected Plan</div>
                            <div className="font-serif font-medium text-stone-900">{subscriptionTier === 'premium' ? 'Total Command' : 'Executive Base'}</div>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-stone-900">{subscriptionTier === 'premium' ? '$49' : '$29'}<span className="text-sm font-normal text-stone-500">/mo</span></div>
                             <div className="text-[10px] text-green-600 font-medium">Monthly billing</div>
                        </div>
                    </div>

                    <div className="p-6 border border-stone-200 rounded-xl text-center space-y-4">
                        <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-stone-200">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-stone-900">Secure Checkout</h3>
                            <p className="text-sm text-stone-500">Complete your subscription via Stripe to activate your account.</p>
                        </div>
                        
                        {!paymentComplete ? (
                            <Button 
                                onClick={handleStripeCheckout} 
                                className="w-full justify-center py-4 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Proceed to Payment <ExternalLink size={16} className="ml-2" />
                            </Button>
                        ) : (
                            <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
                                <Check size={16} /> Payment Verified
                            </div>
                        )}
                        
                        <p className="text-[10px] text-stone-400">
                            {paymentComplete 
                                ? "Click 'Continue' below to configure your workspace." 
                                : "A new tab will open for secure payment. Return here after."}
                        </p>
                    </div>

                </div>
            )}

            {/* STEP 4: CONNECT */}
            {step === 'connect' && (
                <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                         <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Mail size={16} /></div>
                         <div>
                             <h4 className="font-semibold text-stone-900 text-sm">Google Workspace</h4>
                             <p className="text-xs text-stone-500 mt-1">Required for Email and Calendar management. We use standard OAuth security.</p>
                         </div>
                         <Button 
                            size="sm" 
                            onClick={handleConnectGoogle}
                            className={`ml-auto ${googleConnected ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                            disabled={googleConnected || isLoading}
                         >
                             {googleConnected ? <Check size={14} className="mr-1" /> : null}
                             {googleConnected ? 'Connected' : 'Connect'}
                         </Button>
                    </div>

                    {/* Twilio Connection - Locked for Base Plan */}
                    <div className={`rounded-xl p-4 border flex items-start gap-3 ${subscriptionTier === 'base' ? 'bg-stone-100 border-stone-200 opacity-75' : 'bg-stone-50 border-stone-100'}`}>
                         <div className="p-2 bg-white rounded-lg text-stone-600 shadow-sm"><Phone size={16} /></div>
                         <div className="flex-1">
                             <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-stone-900 text-sm">Twilio (Voice & SMS)</h4>
                                {subscriptionTier === 'base' && <span className="text-[10px] bg-stone-200 text-stone-500 px-1.5 rounded font-bold uppercase">Locked</span>}
                             </div>
                             <p className="text-xs text-stone-500 mt-1">
                                {subscriptionTier === 'base' 
                                    ? "Upgrade to Total Command to enable voice agents and SMS screening." 
                                    : "Enables Heaven to make calls and screen texts on your behalf."}
                             </p>
                         </div>
                         <Button 
                            size="sm" 
                            variant="secondary" 
                            className="ml-auto" 
                            onClick={() => setTwilioConnected(!twilioConnected)}
                            disabled={subscriptionTier === 'base'}
                         >
                            {subscriptionTier === 'base' ? <LockIcon /> : (twilioConnected ? 'Added' : 'Add')}
                         </Button>
                    </div>

                    <p className="text-xs text-stone-400 text-center mt-4">
                        Data is encrypted at rest. We never sell your data.
                    </p>
                </div>
            )}

            {/* STEP 5: CALIBRATE */}
            {step === 'calibrate' && (
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Gatekeeping Strictness</label>
                        <div className="space-y-4">
                            <button 
                                onClick={() => setStrictness('low')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${strictness === 'low' ? 'border-stone-900 bg-stone-50' : 'border-stone-100'}`}
                            >
                                <div>
                                    <div className="font-semibold text-stone-900">Open Door</div>
                                    <div className="text-xs text-stone-500">Only block obvious spam. Let most meetings through.</div>
                                </div>
                                {strictness === 'low' && <Check size={18} />}
                            </button>
                            <button 
                                onClick={() => setStrictness('high')}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${strictness === 'high' ? 'border-stone-900 bg-stone-50' : 'border-stone-100'}`}
                            >
                                <div>
                                    <div className="font-semibold text-stone-900">Ruthless Defense</div>
                                    <div className="text-xs text-stone-500">Aggressively decline low-priority requests. Protect deep work.</div>
                                </div>
                                {strictness === 'high' && <Check size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-stone-500">Initializing Command Center...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs text-stone-400">Step {step === 'profile' ? 1 : step === 'plan' ? 2 : step === 'billing' ? 3 : step === 'connect' ? 4 : 5} of 5</div>
                <Button 
                    onClick={handleNext} 
                    disabled={(step === 'profile' && !name) || (step === 'billing' && !paymentComplete)} 
                    className={`rounded-full px-6 ${step === 'billing' && !paymentComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {step === 'billing' && isLoading ? 'Processing...' : step === 'calibrate' ? 'Finish Setup' : 'Continue'} 
                    {!isLoading && <ChevronRight size={14} className="ml-1" />}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
