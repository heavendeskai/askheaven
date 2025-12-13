
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Sparkles, ArrowRight, Mail, Clock, Brain, MessageSquare, LayoutDashboard, CheckSquare, ListTodo, Phone, FileText, Shield, Zap, Search, Calendar, X, Globe, CreditCard, Plane, Users, Lock, ChevronDown, Check } from 'lucide-react';

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

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showFeatures, setShowFeatures] = useState(false);
  
  // Animation State
  const [typedText, setTypedText] = useState('');
  const [showUserMessage, setShowUserMessage] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);

  // Scroll handler for pricing
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const textToType = "I'm overwhelmed. Clear my afternoon and find a flight to NY for Tuesday.";
    let currentIndex = 0;
    let typingInterval: ReturnType<typeof setInterval>;
    let sequenceTimeout: ReturnType<typeof setTimeout>;
    
    const startAnimation = () => {
      // Reset State
      setTypedText('');
      setShowUserMessage(false);
      setShowAiResponse(false);
      currentIndex = 0;

      // 1. Start Typing User Request
      typingInterval = setInterval(() => {
        if (currentIndex <= textToType.length) {
          setTypedText(textToType.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          
          // 2. "Send" Message
          sequenceTimeout = setTimeout(() => {
            setTypedText('');
            setShowUserMessage(true);
            
            // 3. AI Response (Text + Action)
            setTimeout(() => {
              setShowAiResponse(true);
              
              // 4. Restart Loop
              setTimeout(startAnimation, 10000); 
            }, 1500); // 1.5s thinking time
          }, 800); // 0.8s pause before sending
        }
      }, 50); // Typing speed
    };

    // Initial start delay
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
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">AskHeaven<span className="text-stone-400">.io</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={scrollToPricing} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">Pricing</button>
            <button onClick={onGetStarted} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">Log In</button>
            <Button onClick={onGetStarted} className="rounded-full px-6 shadow-lg shadow-stone-200 hover:shadow-xl hover:shadow-stone-300 transition-all">Get Access</Button>
          </div>
        </div>
      </nav>

      {/* --- SECTION 1: HERO & VISUALIZATION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-white via-stone-100 to-transparent rounded-[100%] blur-3xl -z-10 opacity-60"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-bold tracking-widest uppercase text-stone-500 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            System Online • v2.0
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[1.05] mb-8 text-stone-900 tracking-tight">
            The Personal Assistant <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-400 to-stone-600 italic">you actually trust.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Heaven is the AI Command Center that integrates with your Email, Calendar, and Life. It negotiates meetings, plans travel, and clears your mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={onGetStarted} className="rounded-full px-8 py-4 text-base shadow-xl shadow-stone-900/20 hover:scale-105 transition-transform">
              Start Your Free Trial <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* CSS MOCKUP: THE DASHBOARD & CHAT DYNAMICS */}
        <div className="max-w-6xl mx-auto relative z-10 perspective-[2000px]">
            {/* Main Window */}
            <div className="bg-stone-900 rounded-2xl p-2 shadow-2xl shadow-stone-400/50 transform rotate-x-6 hover:rotate-x-0 transition-transform duration-1000 ease-out border border-stone-200">
                <div className="bg-stone-50 rounded-xl overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[650px] relative">
                    
                    {/* Mock Sidebar */}
                    <div className="w-20 md:w-64 bg-white border-r border-stone-100 flex flex-col py-6 hidden md:flex">
                        <div className="px-6 mb-8 flex items-center gap-2">
                             <div className="w-6 h-6 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                                <Sparkles size={12} />
                             </div>
                             <h1 className="font-serif text-lg font-bold tracking-tight text-stone-900">AskHeaven<span className="text-stone-400">.io</span></h1>
                        </div>
                        <div className="space-y-1 px-3">
                             <div className="bg-stone-100 text-stone-900 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><MessageSquare size={16}/> Chat</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><LayoutDashboard size={16}/> Daily Brief</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><CheckSquare size={16}/> Approvals <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-1.5 rounded-full">2</span></div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><ListTodo size={16}/> Tasks <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-1.5 rounded-full">5</span></div>
                             
                             <div className="mt-6 mb-2 px-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Workspace</div>
                             
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Mail size={16}/> Inbox <span className="ml-auto bg-stone-100 text-stone-600 text-[10px] px-1.5 rounded-full">12</span></div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Calendar size={16}/> Calendar</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><Phone size={16}/> Phone</div>
                             <div className="text-stone-500 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-3"><FileText size={16}/> Docs</div>
                        </div>
                    </div>

                    {/* Mock Content */}
                    <div className="flex-1 bg-stone-50/50 p-4 md:p-8 flex flex-col relative">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-8">
                             <div className="bg-white border border-stone-200 px-4 py-2 rounded-full text-xs font-medium text-stone-600 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Connected to Email & Calendar
                             </div>
                             <div className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Today, Oct 24</div>
                        </div>

                        {/* Dynamic Chat Interactions */}
                        <div className="space-y-6 max-w-2xl mx-auto w-full flex-1 overflow-hidden">
                            
                            {/* User Request */}
                            <div className={`flex justify-end transition-all duration-500 transform ${showUserMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="bg-stone-900 text-white rounded-2xl rounded-br-sm px-6 py-4 shadow-lg text-sm max-w-[90%]">
                                    "I'm overwhelmed. Clear my afternoon and find a flight to NY for Tuesday."
                                </div>
                            </div>

                            {/* AI Processing Visualization */}
                            <div className={`flex flex-col gap-4 w-full transition-all duration-700 delay-100 transform ${showAiResponse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                
                                {/* Heaven's Text Reply */}
                                <div className="flex justify-start">
                                    <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm text-sm text-stone-800 max-w-[90%]">
                                        Consider it done. I've cleared your afternoon for focus time and found 3 flight options.
                                    </div>
                                </div>

                                {/* Analysis Card */}
                                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm p-6 shadow-sm w-full space-y-4">
                                    <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider font-semibold mb-2">
                                        <Sparkles size={12} className="text-stone-900" /> Action Report
                                    </div>
                                    
                                    {/* Action 1: Cancellation */}
                                    <div className="flex items-center gap-4 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                        <div className="p-2 bg-white rounded-lg border border-red-100 text-red-500"><Calendar size={16} /></div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-stone-900">Rescheduled: Board Sync</div>
                                            <div className="text-xs text-stone-500">Moved to Thursday • Notification sent</div>
                                        </div>
                                    </div>

                                    {/* Action 2: Flights */}
                                    <div className="space-y-2">
                                        <p className="text-sm text-stone-800 font-medium">Flight Options (JFK):</p>
                                        <div className="flex items-center gap-3 p-3 bg-white border border-stone-100 rounded-xl hover:border-stone-300 transition-colors cursor-pointer">
                                            <div className="w-5 h-5 rounded-full border-2 border-stone-300"></div>
                                            <span className="text-sm text-stone-700">Delta 08:00 AM (Non-stop)</span>
                                            <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">BEST</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Animated Input Bar */}
                        <div className="absolute bottom-6 left-6 right-6 md:left-20 md:right-20">
                            <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-2 flex items-center gap-4 shadow-xl">
                                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex-1 h-10 flex items-center">
                                    {typedText ? (
                                        <span className="text-stone-800 text-sm pl-2">{typedText}<span className="animate-pulse">|</span></span>
                                    ) : (
                                        <span className="text-stone-400 text-sm pl-2">Ask Heaven...</span>
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

      {/* --- SECTION 2: THE PROBLEM (Light Theme) --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
                <h2 className="font-serif text-4xl md:text-6xl mb-6 leading-tight text-stone-900">
                    Are you tired? <br/>
                    <span className="text-stone-400 italic">Of course you are.</span>
                </h2>
                <p className="text-stone-500 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                    You manage a business, a team, or a busy household. You didn't sign up to play Tetris with your calendar or apologize for missed emails. The cognitive load is costing you a fortune.
                </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-white border border-stone-100 rounded-2xl flex items-center justify-center mb-8 text-stone-400 group-hover:scale-110 transition-transform shadow-sm">
                        <Mail size={24} />
                    </div>
                    <h3 className="font-serif text-2xl mb-4 text-stone-900">Inbox Overwhelm</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        Your inbox is a to-do list created by other people. Vendors, clients, teachers, team members—you spend hours filtering noise instead of leading.
                    </p>
                </div>

                {/* Card 2 */}
                <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-white border border-stone-100 rounded-2xl flex items-center justify-center mb-8 text-stone-400 group-hover:scale-110 transition-transform shadow-sm">
                        <Clock size={24} />
                    </div>
                    <h3 className="font-serif text-2xl mb-4 text-stone-900">Death by Logistics</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        Planning travel, scheduling contractors, or just finding a time to meet. <br/>
                        This back-and-forth kills your flow state and fragments your deep work blocks.
                    </p>
                </div>

                {/* Card 3 */}
                <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-white border border-stone-100 rounded-2xl flex items-center justify-center mb-8 text-stone-400 group-hover:scale-110 transition-transform shadow-sm">
                        <Brain size={24} />
                    </div>
                    <h3 className="font-serif text-2xl mb-4 text-stone-900">Decision Fatigue</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        Every small decision drains your battery. By 5 PM, you have nothing left for the big strategic moves that actually matter for your business or family.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- SECTION 3: THE SOLUTION (Capabilities) --- */}
      <section className="py-32 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-6">
                        <Zap size={12} className="text-amber-500" /> Capabilities
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 leading-tight">
                        Reclaim your sovereignty.
                    </h2>
                    <p className="text-stone-500 text-lg leading-relaxed">
                        Heaven isn't just a chatbot; it's an agentic operating system. It connects directly to your calendar, email, and phone to execute work, not just talk about it.
                    </p>
                </div>
                <div className="flex justify-end">
                    <Button size="lg" onClick={() => setShowFeatures(true)} className="rounded-full px-8 py-4">
                        Explore All Features <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="bg-white p-8 rounded-3xl border border-stone-100 hover:border-stone-200 transition-colors">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 mb-6">
                        <Shield size={20} />
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 mb-2">The Gatekeeper</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6">
                        Heaven triages your inbox. It drafts replies to low-priority emails, unsubscribes from noise, and highlights only what requires your executive attention.
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Auto-Draft Replies</li>
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Spam Filtering</li>
                    </ul>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-8 rounded-3xl border border-stone-100 hover:border-stone-200 transition-colors relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={100} />
                     </div>
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 mb-6 relative z-10">
                        <LayoutDashboard size={20} />
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 mb-2 relative z-10">The Architect</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6 relative z-10">
                        Stop playing calendar Tetris. Heaven negotiates meeting times with others, protects your deep work blocks, and ensures you never double-book.
                    </p>
                    <ul className="space-y-2 relative z-10">
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Conflict Resolution</li>
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Focus Time Defense</li>
                    </ul>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-8 rounded-3xl border border-stone-100 hover:border-stone-200 transition-colors">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 mb-6">
                        <Search size={20} />
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 mb-2">The Researcher</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6">
                        Need a venue for a dinner? A summary of a competitor? Heaven browses the live web to find vetted options and presents them in a clean brief.
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Live Web Access</li>
                        <li className="flex items-center gap-2 text-xs text-stone-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Citation & Sources</li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* --- SECTION 4: PRICING --- */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
                <h2 className="font-serif text-4xl md:text-6xl mb-6 text-stone-900">
                    Invest in your time.
                </h2>
                <p className="text-stone-500 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                    Flexible plans designed for solo founders, high-growth executives, and complex families.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                
                {/* SILVER */}
                <div className="p-8 rounded-3xl border border-stone-100 bg-stone-50 flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Silver</div>
                        <h3 className="font-serif text-3xl text-stone-900">Executive</h3>
                        <p className="text-sm text-stone-500 mt-2">Essential command center for solopreneurs.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$49</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} variant="secondary" className="w-full mb-8">Get Started</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Email Triage & Drafting" />
                        <FeatureItem text="Calendar Management" />
                        <FeatureItem text="Daily Briefing" />
                        <FeatureItem text="Basic Task Management" />
                        <FeatureItem text="Standard Response Time" />
                    </div>
                </div>

                {/* PLATINUM - UPDATED SIDE-BY-SIDE LIGHT THEME */}
                <div className="p-8 rounded-3xl border-2 border-stone-900 bg-white flex flex-col relative shadow-xl z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        Best Value
                    </div>
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Platinum</div>
                        <h3 className="font-serif text-3xl text-stone-900">Total Command</h3>
                        <p className="text-sm text-stone-500 mt-2">Full autonomy with voice and research capabilities.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$99</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} className="w-full mb-8">Start Free Trial</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Everything in Silver" />
                        <FeatureItem text="Twilio Voice & SMS Agent" />
                        <FeatureItem text="Deep Web Research" />
                        <FeatureItem text="Document Context (RAG)" />
                        <FeatureItem text="Priority Processing" />
                    </div>
                </div>

                {/* DIAMOND */}
                <div className="p-8 rounded-3xl border border-stone-100 bg-white flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Diamond</div>
                        <h3 className="font-serif text-3xl text-stone-900">Private Office</h3>
                        <p className="text-sm text-stone-500 mt-2">For complex families and high-output founders.</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-stone-900">$499</span>
                        <span className="text-stone-400">/mo</span>
                    </div>
                    <Button onClick={onGetStarted} variant="secondary" className="w-full mb-8">Contact Sales</Button>
                    <div className="space-y-4 flex-1">
                        <FeatureItem text="Everything in Platinum" />
                        <FeatureItem text="Multi-User Support" />
                        <FeatureItem text="Dedicated Server Priority" />
                        <FeatureItem text="White Glove Onboarding" />
                        <FeatureItem text="Custom Integrations" />
                    </div>
                </div>

            </div>
        </div>
      </section>
      
      {/* ... Footer ... */}
       <footer className="bg-stone-50 border-t border-stone-200 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-6">
                          <div className="w-6 h-6 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                              <Sparkles size={12} />
                          </div>
                          <span className="font-serif text-lg font-bold tracking-tight text-stone-900">AskHeaven.io</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
                          The world's first agentic personal assistant designed for Ambitious Professionals and Household Managers. Reclaim your time.
                      </p>
                  </div>
                  <div>
                      <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Product</h4>
                      <ul className="space-y-3 text-sm text-stone-500">
                          <li><a href="#" className="hover:text-stone-900 transition-colors">Manifesto</a></li>
                          <li><button onClick={scrollToPricing} className="hover:text-stone-900 transition-colors">Pricing</button></li>
                          <li><a href="#" className="hover:text-stone-900 transition-colors">Security</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
                      <ul className="space-y-3 text-sm text-stone-500">
                          <li><a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a></li>
                          <li><a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a></li>
                      </ul>
                  </div>
              </div>
              <div className="pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-stone-400">
                      © 2024 AskHeaven.io Inc. All rights reserved.
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
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">System Capabilities</span>
                        </div>
                        <h2 className="font-serif text-3xl text-stone-900">Product Specifications</h2>
                    </div>
                    <button onClick={() => setShowFeatures(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X size={24} className="text-stone-400" />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-8 grid md:grid-cols-2 gap-12">
                    
                    {/* Module 1: Communication */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <Mail className="text-stone-400" size={20} /> Communication Node
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Inbox Triage" desc="Auto-sorts emails into Priority, Review, and Noise. Drafts replies for approval." />
                             <FeatureSpec title="Voice Agent (Twilio)" desc="Screens incoming calls. Can place calls to make reservations or inquiries." />
                             <FeatureSpec title="SMS Relay" desc="Manages text threads. Perfect for coordinating with contractors or family." />
                        </div>
                    </div>

                    {/* Module 2: Temporal */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <Clock className="text-stone-400" size={20} /> Temporal Engine
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Deep Work Defense" desc="Automatically blocks time for focused work based on your energy levels." />
                             <FeatureSpec title="Meeting Negotiation" desc="Emails back-and-forth with others to find times, preventing calendar tetris." />
                             <FeatureSpec title="Conflict Resolution" desc="Detects double bookings and proposes optimal rescheduling options." />
                        </div>
                    </div>

                    {/* Module 3: Intelligence */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <Brain className="text-stone-400" size={20} /> Intelligence Layer
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Live Research" desc="Browses the real-time web to find vetted options and presents them in a clean brief." />
                             <FeatureSpec title="Document Context (RAG)" desc="Upload PDFs/Docs. Heaven answers based on your specific business context." />
                             <FeatureSpec title="Briefing Generation" desc="Compiles daily digests of what matters, stripping away the noise." />
                        </div>
                    </div>

                    {/* Module 4: Logistics */}
                    <div>
                        <h3 className="flex items-center gap-3 text-lg font-medium text-stone-900 mb-6">
                            <CreditCard className="text-stone-400" size={20} /> Logistics Core
                        </h3>
                        <div className="space-y-6">
                             <FeatureSpec title="Travel Planning" desc="Finds flights and hotels matching your preferences. Prepares itineraries." />
                             <FeatureSpec title="Purchasing" desc="Researches gifts or supplies and prepares carts for your one-click approval." />
                             <FeatureSpec title="Household Ops" desc="Coordinates maintenance, deliveries, and family schedules." />
                        </div>
                    </div>

                </div>

                {/* Footer CTA */}
                <div className="p-8 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
                    <div className="text-sm text-stone-500">
                        Ready to reclaim your time?
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
