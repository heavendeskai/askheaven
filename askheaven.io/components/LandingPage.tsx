
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import {
  Sparkles, ArrowRight, Mail, Clock, Brain, MessageSquare, LayoutDashboard,
  CheckSquare, ListTodo, Phone, FileText, Shield, Zap, Search, Calendar, X,
  Globe, CreditCard, Plane, Users, Lock, ChevronDown, Check, PhoneCall,
  UserCheck, Mic, Sun, Moon, Coffee, Heart, Baby, Car, Hotel, Briefcase,
  FileSearch, CloudSync, Bell, BellOff, Activity, Home, Play, Pause
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureItem = ({ text, light = false }: { text: string; light?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${light ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'}`}>
      <Check size={12} strokeWidth={3} />
    </div>
    <span className={`text-sm ${light ? 'text-stone-300' : 'text-stone-600'}`}>{text}</span>
  </div>
);

const FeatureSpec = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex flex-col gap-1">
    <div className="font-semibold text-stone-900 text-sm">{title}</div>
    <div className="text-xs text-stone-500 leading-relaxed">{desc}</div>
  </div>
);

// New component for HVA feature rows
const HVAFeatureRow = ({
  feature,
  experience,
  action,
  icon: Icon
}: {
  feature: string;
  experience: string;
  action: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <div className="grid md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-stone-100 hover:shadow-lg transition-all group">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <div>
        <div className="font-serif text-lg text-stone-900">{feature}</div>
      </div>
    </div>
    <div className="text-sm text-stone-600 leading-relaxed">{experience}</div>
    <div className="text-sm text-stone-500 leading-relaxed bg-stone-50 p-4 rounded-xl border-l-4 border-stone-800">
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Proactive Action</span>
      {action}
    </div>
  </div>
);

// Section Header component for consistent styling
const SectionHeader = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  gradient = false
}: {
  badge: string;
  badgeIcon?: React.ComponentType<{ size?: number; className?: string }>;
  title: React.ReactNode;
  subtitle: string;
  gradient?: boolean;
}) => (
  <div className="text-center mb-16">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-bold tracking-widest uppercase text-stone-500 mb-6 shadow-sm">
      {BadgeIcon && <BadgeIcon size={12} className="text-amber-500" />}
      {badge}
    </div>
    <h2 className={`font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight ${gradient ? 'bg-clip-text text-transparent bg-gradient-to-r from-stone-700 to-stone-900' : 'text-stone-900'}`}>
      {title}
    </h2>
    <p className="text-stone-500 max-w-3xl mx-auto text-lg md:text-xl font-light leading-relaxed">
      {subtitle}
    </p>
  </div>
);

// Feature Card component for consistent styling
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features,
  highlight = false
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  features?: string[];
  highlight?: boolean;
}) => (
  <div className={`p-8 rounded-3xl border transition-all group ${
    highlight
      ? 'bg-stone-900 border-stone-800 text-white'
      : 'bg-white border-stone-100 hover:border-stone-200 hover:shadow-lg'
  }`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
      highlight
        ? 'bg-white/10 text-white'
        : 'bg-stone-100 text-stone-600'
    }`}>
      <Icon size={24} />
    </div>
    <h3 className={`font-serif text-2xl mb-4 ${highlight ? 'text-white' : 'text-stone-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed mb-6 ${highlight ? 'text-stone-300' : 'text-stone-500'}`}>
      {description}
    </p>
    {features && (
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className={`flex items-center gap-2 text-xs ${highlight ? 'text-stone-300' : 'text-stone-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-green-400' : 'bg-green-500'}`}></div>
            {feature}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [selectedMVP, setSelectedMVP] = useState<'workday' | 'travel' | null>(null);

  // Animation State
  const [typedText, setTypedText] = useState('');
  const [showUserMessage, setShowUserMessage] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);

  // Scroll handlers
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHVA = () => {
    const element = document.getElementById('hva');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const textToType = "Jeff Bezos is calling. Handle it.";
    let currentIndex = 0;
    let typingInterval: ReturnType<typeof setInterval>;
    let sequenceTimeout: ReturnType<typeof setTimeout>;

    const startAnimation = () => {
      setTypedText('');
      setShowUserMessage(false);
      setShowAiResponse(false);
      currentIndex = 0;

      typingInterval = setInterval(() => {
        if (currentIndex <= textToType.length) {
          setTypedText(textToType.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);

          sequenceTimeout = setTimeout(() => {
            setTypedText('');
            setShowUserMessage(true);

            setTimeout(() => {
              setShowAiResponse(true);
              setTimeout(startAnimation, 10000);
            }, 1500);
          }, 800);
        }
      }, 50);
    };

    const initialTimeout = setTimeout(startAnimation, 1000);

    return () => {
        clearTimeout(initialTimeout);
        clearInterval(typingInterval);
        clearTimeout(sequenceTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 relative">

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full bg-stone-50/90 backdrop-blur-xl z-40 border-b border-stone-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-stone-200">
              <Sparkles size={14} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">Heaven<span className="text-stone-400">System</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={scrollToHVA} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">Voice Agent</button>
            <button onClick={scrollToPricing} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">Pricing</button>
            <button onClick={onGetStarted} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">Log In</button>
            <Button onClick={onGetStarted} className="rounded-full px-6 shadow-lg shadow-stone-200 hover:shadow-xl hover:shadow-stone-300 transition-all">Get Access</Button>
          </div>
        </div>
      </nav>

      {/* --- SECTION 1: HERO - THE CEO EOS --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">

        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-white via-stone-100 to-transparent rounded-[100%] blur-3xl -z-10 opacity-60"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-bold tracking-widest uppercase text-stone-500 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            CEO Executive Operating System • EOS v2.0
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[1.05] mb-8 text-stone-900 tracking-tight">
            The Unified, High-Security<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-400 to-stone-600 italic">Autonomous Life Operating System.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-500 mb-6 max-w-3xl mx-auto leading-relaxed font-light">
            Heaven is the AI Command Center powered by the <span className="font-semibold text-stone-700">Heaven Voice Agent (HVA)</span> — your ultimate Active Gatekeeper for all critical, inner-circle communications.
          </p>
          <p className="text-base text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Built for CEOs, founders, and high-output executives who demand absolute sovereignty over their time, attention, and family.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={onGetStarted} className="rounded-full px-8 py-4 text-base shadow-xl shadow-stone-900/20 hover:scale-105 transition-transform">
              Start Your Free Trial <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="secondary" onClick={scrollToHVA} className="rounded-full px-8 py-4 text-base">
              Explore Voice Agent <PhoneCall size={18} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* CSS MOCKUP: THE HVA CALL SHIELD */}
        <div className="max-w-6xl mx-auto relative z-10 perspective-[2000px]">
            <div className="bg-stone-900 rounded-2xl p-2 shadow-2xl shadow-stone-400/50 transform rotate-x-6 hover:rotate-x-0 transition-transform duration-1000 ease-out border border-stone-200">
                <div className="bg-stone-50 rounded-xl overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[650px] relative">

                    {/* Mock Sidebar */}
                    <div className="w-20 md:w-64 bg-white border-r border-stone-100 flex flex-col py-6 hidden md:flex">
                        <div className="px-6 mb-8 flex items-center gap-2">
                             <div className="w-6 h-6 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                                <Sparkles size={12} />
                             </div>
                             <h1 className="font-serif text-lg font-bold tracking-tight text-stone-900">Heaven<span className="text-stone-400">System</span></h1>
                        </div>
                        <div className="space-y-1 px-3">
                             <div className="bg-stone-900 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><PhoneCall size={16}/> Voice Agent</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Sun size={16}/> Morning Brief</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><LayoutDashboard size={16}/> Workday</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><CheckSquare size={16}/> Approvals <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-1.5 rounded-full">2</span></div>

                             <div className="mt-6 mb-2 px-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Workspace</div>

                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Mail size={16}/> Inbox <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-1.5 rounded-full">12</span></div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Calendar size={16}/> Calendar</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Plane size={16}/> Travel</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Heart size={16}/> Family</div>
                        </div>
                    </div>

                    {/* Mock Content - HVA Call Shield Demo */}
                    <div className="flex-1 bg-stone-50/50 p-4 md:p-8 flex flex-col relative">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-8">
                             <div className="bg-white border border-stone-200 px-4 py-2 rounded-full text-xs font-medium text-stone-600 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                HVA Active • Inner Circle Protected
                             </div>
                             <div className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Live Call Shield</div>
                        </div>

                        {/* Dynamic Interactions */}
                        <div className="space-y-6 max-w-2xl mx-auto w-full flex-1 overflow-hidden">

                            {/* Incoming Call Alert */}
                            <div className={`flex justify-end transition-all duration-500 transform ${showUserMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="bg-stone-900 text-white rounded-2xl rounded-br-sm px-6 py-4 shadow-lg text-sm max-w-[90%]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone size={16} className="text-green-400 animate-pulse" />
                                        <span className="text-green-400 font-semibold">Incoming Call</span>
                                    </div>
                                    "Jeff Bezos is calling. Handle it."
                                </div>
                            </div>

                            {/* HVA Response */}
                            <div className={`flex flex-col gap-4 w-full transition-all duration-700 delay-100 transform ${showAiResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                                {/* Heaven's Voice Response */}
                                <div className="flex justify-start">
                                    <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm text-sm text-stone-800 max-w-[90%]">
                                        <div className="flex items-center gap-2 text-green-600 text-xs font-semibold mb-2">
                                            <UserCheck size={14} /> Inner Circle Verified
                                        </div>
                                        Jeff Bezos is on your whitelist. Routing directly to your secure line.
                                    </div>
                                </div>

                                {/* Call Shield Card */}
                                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm p-6 shadow-sm w-full space-y-4">
                                    <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider font-semibold mb-2">
                                        <Shield size={12} className="text-stone-900" /> Call Shield Report
                                    </div>

                                    {/* Inner Circle Badge */}
                                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <div className="p-3 bg-white rounded-lg border border-green-100 text-green-600"><UserCheck size={20} /></div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-stone-900">Jeff Bezos • Inner Circle</div>
                                            <div className="text-xs text-stone-500">Priority: Maximum • Direct Line Access</div>
                                        </div>
                                        <div className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">CONNECTED</div>
                                    </div>

                                    {/* Today's Shield Stats */}
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        <div className="text-center p-3 bg-stone-50 rounded-xl">
                                            <div className="text-2xl font-bold text-stone-900">3</div>
                                            <div className="text-[10px] text-stone-500 uppercase">Inner Circle</div>
                                        </div>
                                        <div className="text-center p-3 bg-stone-50 rounded-xl">
                                            <div className="text-2xl font-bold text-stone-900">12</div>
                                            <div className="text-[10px] text-stone-500 uppercase">Shielded</div>
                                        </div>
                                        <div className="text-center p-3 bg-stone-50 rounded-xl">
                                            <div className="text-2xl font-bold text-stone-900">4</div>
                                            <div className="text-[10px] text-stone-500 uppercase">Callbacks</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Animated Input Bar */}
                        <div className="absolute bottom-6 left-6 right-6 md:left-20 md:right-20">
                            <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-2 flex items-center gap-4 shadow-xl">
                                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                                    <Mic size={18} />
                                </div>
                                <div className="flex-1 h-10 flex items-center">
                                    {typedText ? (
                                        <span className="text-stone-800 text-sm pl-2">{typedText}<span className="animate-pulse">|</span></span>
                                    ) : (
                                        <span className="text-stone-400 text-sm pl-2">Command Heaven...</span>
                                    )}
                                </div>
                                <div className="ml-auto flex gap-2 shrink-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${typedText ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                        <ArrowRight size={14}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-stone-200 to-stone-100 rounded-3xl blur-2xl opacity-30 -z-10"></div>
        </div>
      </section>

      {/* --- SECTION 2: HEAVEN VOICE AGENT (HVA) - THE ACTIVE GATEKEEPER --- */}
      <section id="hva" className="py-32 bg-stone-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold tracking-widest uppercase text-stone-300 mb-6">
              <PhoneCall size={12} className="text-green-400" />
              Core Feature • Telephony Platform
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white">
              The Heaven Voice Agent (HVA)<br/>
              <span className="text-stone-400 italic">The Active Gatekeeper</span>
            </h2>
            <p className="text-stone-400 max-w-3xl mx-auto text-lg md:text-xl font-light leading-relaxed">
              The central, top-tier feature built on Twilio, providing a secure, human-like voice interface that protects your most valuable asset: uninterrupted focus.
            </p>
          </div>

          {/* HVA Feature Grid */}
          <div className="space-y-4">

            {/* Inner Circle Whitelist */}
            <div className="grid md:grid-cols-3 gap-6 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="font-serif text-lg text-white">Inner Circle Whitelist</div>
                </div>
              </div>
              <div className="text-sm text-stone-300 leading-relaxed">
                Only direct calls from pre-authorized contacts (Family, Bezos, Gates, Obama, Board Chair, etc.) are allowed to ring your direct line.
              </div>
              <div className="text-sm text-stone-400 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-green-500">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-1">Automatic Prioritization</span>
                HVA instantly identifies whitelisted numbers and routes the call straight through, regardless of time or current activity.
              </div>
            </div>

            {/* Intelligent Call Shielding */}
            <div className="grid md:grid-cols-3 gap-6 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="font-serif text-lg text-white">Intelligent Call Shielding</div>
                </div>
              </div>
              <div className="text-sm text-stone-300 leading-relaxed">
                All other calls (VPs, sales, general staff, PR, etc.) are intercepted by the HVA with a calm, professional, human-like voice using advanced text-to-speech.
              </div>
              <div className="text-sm text-stone-400 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-stone-500">
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block mb-1">Contextual Triage</span>
                HVA says: "Hello, this is Heaven, [CEO Name]'s executive assistant. I understand this is urgent. Can you briefly summarize the purpose of your call?" — transcribes and routes to dashboard.
              </div>
            </div>

            {/* Active Calendar Check */}
            <div className="grid md:grid-cols-3 gap-6 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="font-serif text-lg text-white">Active Calendar Check</div>
                </div>
              </div>
              <div className="text-sm text-stone-300 leading-relaxed">
                If a whitelisted call comes in during a conflict (e.g., deep work block), the HVA provides a customized soft shield based on your current activity.
              </div>
              <div className="text-sm text-stone-400 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-amber-500">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Real-Time Excuse Generation</span>
                "Hello [Caller Name]. [CEO Name] is currently focused on an urgent M&A review. Would you like me to schedule a 15-minute callback window in 30 minutes, or can I relay a message?"
              </div>
            </div>

            {/* Outbound Calling Proxy */}
            <div className="grid md:grid-cols-3 gap-6 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-serif text-lg text-white">Outbound Calling (Proxy)</div>
                </div>
              </div>
              <div className="text-sm text-stone-300 leading-relaxed">
                You ask Heaven to place a call. Heaven handles all the details so you never have to dial, wait, or manage connection logistics.
              </div>
              <div className="text-sm text-stone-400 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-blue-500">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Seamless Proxy</span>
                Heaven places the call from a dedicated, secure line, managing connection details and providing real-time background context on the caller before they pick up.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 3: THE MORNING BRIEFING --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader
            badge="The Peaceful Start"
            badgeIcon={Sun}
            title={<>The Morning Briefing<br/><span className="text-stone-400 italic">Heaven's Whisper</span></>}
            subtitle="Heaven delivers the essential context with efficiency and calm. Start your day with clarity, not chaos. Ready to integrate with the HVA for overnight call summaries."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Ambient Wake-Up */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform shadow-sm">
                <Sun size={24} />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-3">Ambient Wake-Up</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Optimizes wake-up based on sleep data, respecting the baby's schedule. Gentle, contextual alerts instead of jarring alarms.
              </p>
            </div>

            {/* Global Critical */}
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-stone-600 group-hover:scale-110 transition-transform shadow-sm border border-stone-100">
                <Globe size={24} />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-3">Global Critical</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Top 3 relevant market and geopolitical updates. Only what moves your needle — no noise, no doom scrolling required.
              </p>
            </div>

            {/* C-Suite Priority */}
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-stone-600 group-hover:scale-110 transition-transform shadow-sm border border-stone-100">
                <Briefcase size={24} />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-3">C-Suite Priority</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Summary of overnight communication (email, text, or HVA transcript) from high-value contacts across G Suite and M365.
              </p>
            </div>

            {/* Family Focus */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-pink-500 group-hover:scale-110 transition-transform shadow-sm">
                <Heart size={24} />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-3">Family Focus</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Key events and baby schedule updates. Never miss a recital, doctor's appointment, or milestone moment.
              </p>
            </div>

          </div>

          {/* Additional Briefing Features */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Schedule Synthesis</h4>
                <p className="text-sm text-stone-500">Displays the final, conflict-free optimized schedule. No surprises, no double-bookings.</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0">
                <Car size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Attire & Logistics</h4>
                <p className="text-sm text-stone-500">Suggests appropriate dress based on your calendar and pre-loads navigation for your first meeting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: EXECUTIVE WORKDAY MANAGEMENT --- */}
      <section className="py-32 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="The Unifying Ghost"
            badgeIcon={LayoutDashboard}
            title={<>Executive Workday Management<br/><span className="text-stone-400 italic">Invisible. Powerful. Autonomous.</span></>}
            subtitle="Heaven silently manages dual-corporate accounts and meeting chaos. Your calendar and inbox become instruments of leverage, not sources of anxiety."
          />

          <div className="grid md:grid-cols-3 gap-6 mb-12">

            {/* Dual-Cloud Synthesis */}
            <FeatureCard
              icon={CloudSync}
              title="Dual-Cloud Synthesis"
              description="Unified Inbox and Calendar from both G Suite and Microsoft 365. One view, two empires."
              features={['Gmail + Outlook Unified', 'Google Calendar + O365 Sync', 'Contacts Merged']}
            />

            {/* Intelligent Account Routing */}
            <FeatureCard
              icon={Mail}
              title="Intelligent Routing"
              description="Heaven automatically selects the correct corporate account for every reply. No more wrong-address embarrassments."
              features={['Context-Aware Replies', 'Signature Auto-Selection', 'Domain Detection']}
              highlight
            />

            {/* Meeting Autonomy */}
            <FeatureCard
              icon={Mic}
              title="Meeting Autonomy"
              description="Automatically handles secure transcription and recording consent. You focus on the conversation."
              features={['Auto-Transcription', 'Recording Consent', 'Action Item Capture']}
            />

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Real-Time Contextual Feed */}
            <div className="p-8 rounded-3xl bg-white border border-stone-100 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-stone-900 mb-1">Real-Time Contextual Feed</h3>
                  <p className="text-sm text-stone-500">Private data nudges during meetings</p>
                </div>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="text-xs text-stone-400 uppercase tracking-wider mb-2">During your 2pm with Sarah Chen:</div>
                <div className="text-sm text-stone-700">"Sarah mentioned last month she's considering leaving. Her contract renewal is next week. She values flexibility over comp."</div>
              </div>
            </div>

            {/* Autonomous Delegation */}
            <div className="p-8 rounded-3xl bg-white border border-stone-100 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                  <ListTodo size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-stone-900 mb-1">Autonomous Delegation</h3>
                  <p className="text-sm text-stone-500">Verbal commitments become assigned tasks</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <CheckSquare size={16} className="text-green-500" />
                  <span className="text-sm text-stone-700">Draft Q4 proposal → Delegated to Sarah</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <CheckSquare size={16} className="text-amber-500" />
                  <span className="text-sm text-stone-700">Review contracts → Added to your Friday block</span>
                </div>
              </div>
            </div>

          </div>

          {/* Document Filing */}
          <div className="mt-6 p-6 rounded-2xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <FileSearch size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Document Compliance & Filing</h4>
                <p className="text-sm text-stone-400">Semantic Filing Agent instantly analyzes, names, and files documents into the correct cloud drive (G Drive or OneDrive).</p>
              </div>
            </div>
            <Button onClick={onGetStarted} className="bg-white text-stone-900 hover:bg-stone-100 shrink-0">
              See Demo <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: HIGH-STAKES TRAVEL MANAGEMENT --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Zero-Friction Logistics"
            badgeIcon={Plane}
            title={<>High-Stakes Travel Management<br/><span className="text-stone-400 italic">Executive-Grade. Global. Seamless.</span></>}
            subtitle="Heaven ensures seamless, personalized global travel. From booking to post-trip expense processing — complete autonomy."
          />

          <div className="grid md:grid-cols-2 gap-8 mb-12">

            {/* Autonomous Booking */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                <Plane size={24} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">Autonomous Booking</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Handles all complex bookings based on your standards — First Class or Private Charter, high-security hotels, ground transport, and compliance requirements.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-blue-500" /> First Class / Private Charter
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-blue-500" /> High-Security Hotel Selection
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-blue-500" /> Ground Transport Coordination
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-blue-500" /> Visa & Compliance Handling
                </li>
              </ul>
            </div>

            {/* Pre-Trip Synthesis */}
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-stone-600 shadow-sm border border-stone-100">
                <CheckSquare size={24} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">Pre-Trip Synthesis</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Generates personalized packing lists and family coordination schedules. The HVA ensures critical contacts are informed of your travel schedule.
              </p>
              <div className="bg-white p-4 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-400 uppercase tracking-wider mb-3">Packing Intelligence</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Weather in Zurich</span>
                    <span className="text-stone-900 font-medium">48°F, Rain</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Dress Code</span>
                    <span className="text-stone-900 font-medium">Business Formal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Adapter</span>
                    <span className="text-stone-900 font-medium">Type J (Swiss)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Real-Time Adaptation */}
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-amber-600 shadow-sm border border-stone-100">
                <Clock size={24} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">Real-Time Adaptation</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Autonomously reschedules meetings during flight delays and manages ground transport updates. You never have to make a single call.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                  <Clock size={14} /> Flight Delay Detected
                </div>
                <div className="text-sm text-stone-600">Your 9am with the Board has been moved to 11am. All parties notified. Car pickup adjusted to 10:15am.</div>
              </div>
            </div>

            {/* In-Destination & Post-Trip */}
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-stone-600 shadow-sm border border-stone-100">
                <Hotel size={24} />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-4">In-Destination & Post-Trip</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Personalized welcome packages, contextual dining recommendations based on your dietary preferences, and automatic expense processing and archival.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-green-500" /> Dining reservations secured
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-green-500" /> Expense reports auto-filed
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-green-500" /> Receipts OCR'd and categorized
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 6: PERSONAL & FAMILY LIFE AGENT --- */}
      <section className="py-32 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold tracking-widest uppercase text-stone-300 mb-6">
              <Heart size={12} className="text-pink-400" />
              The Calming Force
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white">
              Personal & Family Life Agent<br/>
              <span className="text-stone-400 italic">Protect what matters most.</span>
            </h2>
            <p className="text-stone-400 max-w-3xl mx-auto text-lg md:text-xl font-light leading-relaxed">
              Heaven safeguards your well-being and family priorities with the same intensity it manages your business. Non-negotiable boundaries, enforced autonomously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">

            {/* Non-Negotiable Time Guard */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">Non-Negotiable Time Guard</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Aggressively protects personal and family blocks. Date nights, kids' events, and recovery time are defended like board meetings.
              </p>
              <div className="flex items-center gap-2 text-sm text-pink-400">
                <Lock size={14} /> Protected from 6pm-8am
              </div>
            </div>

            {/* Health & Wellness Enforcement */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">Health & Wellness Enforcement</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Monitors progress and provides contextual nudges. Integrates with your fitness tracker and sleep data.
              </p>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-sm text-stone-300 italic">"Your next window for a 15-minute mindfulness break is now. Heart rate elevated for 3 hours."</div>
              </div>
            </div>

            {/* The "Order" Button */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-stone-800 to-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] font-bold bg-amber-500 text-stone-900 px-2 py-1 rounded-full uppercase">Ultimate</div>
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 text-red-400 group-hover:scale-110 transition-transform">
                <BellOff size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">The "Order" Button</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                The ultimate digital function. Instantly silences ALL non-critical communications (including all unauthorized calls that the HVA is handling).
              </p>
              <button className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-400 font-semibold transition-all flex items-center justify-center gap-2">
                <BellOff size={18} /> Activate Order Mode
              </button>
              <p className="text-xs text-stone-500 mt-3 text-center">Sends all comms to deferred hold folder</p>
            </div>

          </div>

          {/* Family Dashboard Preview */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Baby size={20} className="text-pink-400" />
                <span className="font-semibold text-white">Family Dashboard</span>
              </div>
              <span className="text-xs text-stone-400">Real-time sync</span>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-xs text-stone-400 mb-1">Baby Nap</div>
                <div className="text-lg font-semibold text-white">2:30 PM</div>
                <div className="text-xs text-green-400">On schedule</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-xs text-stone-400 mb-1">School Pickup</div>
                <div className="text-lg font-semibold text-white">3:15 PM</div>
                <div className="text-xs text-amber-400">Nanny confirmed</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-xs text-stone-400 mb-1">Family Dinner</div>
                <div className="text-lg font-semibold text-white">6:30 PM</div>
                <div className="text-xs text-stone-400">Protected block</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-xs text-stone-400 mb-1">Your Sleep</div>
                <div className="text-lg font-semibold text-white">6h 42m</div>
                <div className="text-xs text-red-400">Below target</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 7: MVP NEXT STEPS --- */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold tracking-widest uppercase text-stone-500 mb-6">
              <Zap size={12} className="text-amber-500" />
              Your MVP Foundation
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-stone-900">
              Which foundation should<br/>
              <span className="text-stone-400 italic">we build first?</span>
            </h2>
            <p className="text-stone-500 max-w-3xl mx-auto text-lg leading-relaxed">
              The Heaven Voice Agent (HVA) is a monumental feature that should be developed after the core systems are in place. Help us prioritize your MVP by selecting the foundation that matters most to you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Option 1: Executive Workday Management */}
            <button
              onClick={() => setSelectedMVP('workday')}
              className={`p-8 rounded-3xl border-2 text-left transition-all ${
                selectedMVP === 'workday'
                  ? 'border-stone-900 bg-stone-50 shadow-xl'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedMVP === 'workday' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  <LayoutDashboard size={24} />
                </div>
                {selectedMVP === 'workday' && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Check size={16} />
                  </div>
                )}
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3">Executive Workday Management</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                The Dual-Cloud Synthesis — unifying and automating your G Suite and M365 communications into one powerful command center.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Unified inbox across platforms
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Intelligent account routing
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Meeting transcription & delegation
                </li>
              </ul>
            </button>

            {/* Option 2: High-Stakes Travel Management */}
            <button
              onClick={() => setSelectedMVP('travel')}
              className={`p-8 rounded-3xl border-2 text-left transition-all ${
                selectedMVP === 'travel'
                  ? 'border-stone-900 bg-stone-50 shadow-xl'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedMVP === 'travel' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  <Plane size={24} />
                </div>
                {selectedMVP === 'travel' && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Check size={16} />
                  </div>
                )}
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3">High-Stakes Travel Management</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Zero-Friction Logistics — automating the full trip lifecycle from booking to post-trip expense processing.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Autonomous booking system
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Real-time adaptation
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-green-500" /> Expense auto-processing
                </li>
              </ul>
            </button>

          </div>

          {selectedMVP && (
            <div className="mt-12 text-center animate-fade-in">
              <Button size="lg" onClick={onGetStarted} className="rounded-full px-10 py-5 text-lg shadow-xl shadow-stone-900/20 hover:scale-105 transition-transform">
                Start Building {selectedMVP === 'workday' ? 'Workday Management' : 'Travel Management'} <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 8: PRICING --- */}
      <section id="pricing" className="py-32 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
                <h2 className="font-serif text-4xl md:text-6xl mb-6 text-stone-900">
                    Invest in your sovereignty.
                </h2>
                <p className="text-stone-500 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                    Flexible plans designed for CEOs, high-growth executives, and complex families who demand the best.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">

                {/* EXECUTIVE */}
                <div className="p-8 rounded-3xl border border-stone-200 bg-white flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Executive</div>
                        <h3 className="font-serif text-3xl text-stone-900">Command Center</h3>
                        <p className="text-sm text-stone-500 mt-2">Essential EOS for high-output professionals.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$99</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} variant="secondary" className="w-full mb-8">Get Started</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Dual-Cloud Email Synthesis" />
                        <FeatureItem text="Calendar Management & Defense" />
                        <FeatureItem text="Morning Briefing System" />
                        <FeatureItem text="Basic Task Delegation" />
                        <FeatureItem text="Document Filing Agent" />
                    </div>
                </div>

                {/* CHAIRMAN - FEATURED */}
                <div className="p-8 rounded-3xl border-2 border-stone-900 bg-white flex flex-col relative shadow-xl z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        Most Popular
                    </div>
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Chairman</div>
                        <h3 className="font-serif text-3xl text-stone-900">Total Sovereignty</h3>
                        <p className="text-sm text-stone-500 mt-2">Full HVA access with voice and travel automation.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$299</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} className="w-full mb-8">Start Free Trial</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Everything in Executive" />
                        <FeatureItem text="Heaven Voice Agent (HVA)" />
                        <FeatureItem text="Inner Circle Call Shielding" />
                        <FeatureItem text="Travel Management Suite" />
                        <FeatureItem text="Family Life Agent" />
                        <FeatureItem text="The 'Order' Button" />
                    </div>
                </div>

                {/* BOARD */}
                <div className="p-8 rounded-3xl border border-stone-200 bg-white flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Board</div>
                        <h3 className="font-serif text-3xl text-stone-900">Private Office</h3>
                        <p className="text-sm text-stone-500 mt-2">For complex families and multi-entity founders.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$999</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} variant="secondary" className="w-full mb-8">Contact Sales</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Everything in Chairman" />
                        <FeatureItem text="Multi-User Family Support" />
                        <FeatureItem text="Dedicated Server Priority" />
                        <FeatureItem text="White Glove Onboarding" />
                        <FeatureItem text="Custom Integrations" />
                        <FeatureItem text="24/7 Concierge Support" />
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
       <footer className="bg-stone-900 text-white pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-6">
                          <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-stone-900">
                              <Sparkles size={12} />
                          </div>
                          <span className="font-serif text-lg font-bold tracking-tight text-white">HeavenSystem</span>
                      </div>
                      <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
                          The CEO Executive Operating System. The unified, high-security, autonomous life operating system for leaders who demand absolute sovereignty.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Lock size={12} />
                        <span>SOC 2 Type II Compliant • End-to-End Encrypted</span>
                      </div>
                  </div>
                  <div>
                      <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
                      <ul className="space-y-3 text-sm text-stone-400">
                          <li><button onClick={scrollToHVA} className="hover:text-white transition-colors">Voice Agent</button></li>
                          <li><button onClick={scrollToPricing} className="hover:text-white transition-colors">Pricing</button></li>
                          <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
                      <ul className="space-y-3 text-sm text-stone-400">
                          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
                      </ul>
                  </div>
              </div>
              <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-stone-500">
                      © 2024 HeavenSystem Inc. All rights reserved.
                  </div>
                  <div className="text-xs text-stone-500">
                      Built for CEOs, by operators who understand.
                  </div>
              </div>
          </div>
      </footer>

      {/* --- FEATURES OVERLAY MODAL --- */}
      {showFeatures && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-md animate-fade-in-slow"
                onClick={() => setShowFeatures(false)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-heaven-reveal flex flex-col">

                {/* Header */}
                <div className="p-8 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-stone-100 rounded text-stone-500 flex items-center justify-center">
                                <Zap size={14} />
                            </div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">CEO EOS</span>
                        </div>
                        <h2 className="font-serif text-3xl text-stone-900">System Specifications</h2>
                    </div>
                    <button onClick={() => setShowFeatures(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X size={24} className="text-stone-400" />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-8 grid md:grid-cols-2 gap-12">

                    {/* Module 1: HVA */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <PhoneCall className="text-stone-400" size={20} /> Heaven Voice Agent
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Inner Circle Whitelist" desc="Pre-authorized contacts ring through directly. Everyone else is intelligently triaged." />
                             <FeatureSpec title="Intelligent Call Shielding" desc="Human-like voice intercepts and contextually triages all non-priority calls." />
                             <FeatureSpec title="Outbound Proxy Calling" desc="Heaven places calls on your behalf with real-time context briefing." />
                        </div>
                    </div>

                    {/* Module 2: Workday */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <LayoutDashboard className="text-stone-400" size={20} /> Workday Management
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Dual-Cloud Synthesis" desc="Unified inbox and calendar from G Suite and Microsoft 365." />
                             <FeatureSpec title="Meeting Autonomy" desc="Auto-transcription, consent handling, and action item capture." />
                             <FeatureSpec title="Semantic Document Filing" desc="AI-powered filing into correct cloud drives with intelligent naming." />
                        </div>
                    </div>

                    {/* Module 3: Travel */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <Plane className="text-stone-400" size={20} /> Travel Management
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Autonomous Booking" desc="First Class, Private Charter, high-security hotels, ground transport, compliance." />
                             <FeatureSpec title="Real-Time Adaptation" desc="Flight delays trigger automatic rescheduling of all affected appointments." />
                             <FeatureSpec title="Expense Processing" desc="Auto-OCR receipts, categorize, and file expense reports." />
                        </div>
                    </div>

                    {/* Module 4: Family */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <Heart className="text-stone-400" size={20} /> Family Life Agent
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Non-Negotiable Time Guard" desc="Aggressively protects family blocks like board meetings." />
                             <FeatureSpec title="Health Enforcement" desc="Contextual wellness nudges based on fitness and sleep data." />
                             <FeatureSpec title="The Order Button" desc="Instant silence. All non-critical comms deferred to hold folder." />
                        </div>
                    </div>

                </div>

                {/* Footer CTA */}
                <div className="p-8 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
                    <div className="text-sm text-stone-500">
                        Ready to reclaim your sovereignty?
                    </div>
                    <Button onClick={() => { setShowFeatures(false); onGetStarted(); }}>
                        Start Free Trial <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
