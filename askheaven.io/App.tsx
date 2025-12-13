
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { FloatingChat } from './components/FloatingChat';
import { DailyBrief } from './components/DailyBrief';
import { ApprovalQueue } from './components/ApprovalQueue';
import { EmailClient } from './components/EmailClient';
import { CalendarView } from './components/CalendarView';
import { PhoneView } from './components/PhoneView';
import { DocsView } from './components/DocsView';
import { SettingsView } from './components/SettingsView';
import { VoiceMode } from './components/VoiceMode';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { SignUpPage } from './components/SignUpPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { View, Message, ApprovalItem, DocumentItem, UserContext, TaskItem, MemoryItem } from './types';
import { INITIAL_APPROVALS, INITIAL_TASKS } from './constants';
import { sendMessage } from './services/gemini';
import { sendMessage as sendGmail, createEvent } from './services/gmail';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  // --- STATE INITIALIZATION ---

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // We rely on Supabase session instead of local storage 'heaven_auth'
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('heaven_onboarding_complete') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserContext | null>(() => {
      const saved = localStorage.getItem('heaven_user_profile');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.checkInFrequency) parsed.checkInFrequency = 'medium';
          return parsed;
      }
      return null;
  });

  const [showLanding, setShowLanding] = useState(!session);

  // Sync landing visibility with session
  useEffect(() => {
    if (session) setShowLanding(false);
  }, [session]);

  const [currentView, setCurrentView] = useState<View>(View.CHAT);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('heaven_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => {
    const saved = localStorage.getItem('heaven_approvals');
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('heaven_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('heaven_docs');
    return saved ? JSON.parse(saved) : [];
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
      const saved = localStorage.getItem('heaven_memories');
      return saved ? JSON.parse(saved) : [];
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // --- PERSISTENCE EFFECTS ---

  useEffect(() => {
    localStorage.setItem('heaven_messages', JSON.stringify(messages));
    localStorage.setItem('heaven_docs', JSON.stringify(documents));
    localStorage.setItem('heaven_approvals', JSON.stringify(approvals));
    localStorage.setItem('heaven_onboarding_complete', hasCompletedOnboarding.toString());
    localStorage.setItem('heaven_tasks', JSON.stringify(tasks));
    localStorage.setItem('heaven_memories', JSON.stringify(memories));
    if (userProfile) {
        localStorage.setItem('heaven_user_profile', JSON.stringify(userProfile));
    }
  }, [messages, documents, approvals, hasCompletedOnboarding, userProfile, tasks, memories]);

  // --- HANDLERS ---

  const handleGetStarted = () => {
      setShowLanding(false);
      setAuthMode('signup');
  };

  const handleLogin = () => {
    // Supabase state change handles this, but for UX smoothness
    setShowLanding(false);
  };

  const handleSignUp = () => {
      // Supabase state change handles this
      setShowLanding(false);
      setHasCompletedOnboarding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLanding(true); 
    setAuthMode('login');
  };

  const handleOnboardingComplete = (data: any) => {
      const fullProfile = { ...data, checkInFrequency: 'medium' };
      setUserProfile(fullProfile);
      setHasCompletedOnboarding(true);
      const welcomeMsg = `Welcome, ${data.name}. I have configured your workspace for ${data.role === 'business' ? 'Executive Support' : 'Household Management'}. I am connected to your services and operating with ${data.strictness === 'high' ? 'maximum' : 'standard'} gatekeeping protocols. What is our first priority?`;
      
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: welcomeMsg,
          timestamp: new Date()
      }]);
  };

  const handleUpdateProfile = (updates: Partial<UserContext>) => {
      if (userProfile) {
          const newProfile = { ...userProfile, ...updates };
          setUserProfile(newProfile);
      }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const response = await sendMessage(text, documents, userProfile, messages, memories);
      setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text,
          timestamp: new Date(),
          groundingMetadata: response.groundingMetadata
      }]);

      if (response.approvalRequests && response.approvalRequests.length > 0) {
          const newApprovals: ApprovalItem[] = response.approvalRequests.map((req: any) => {
             const isEmail = req.type === 'email';
             const args = req.payload.args;
             return {
                 id: Date.now().toString() + Math.random().toString(),
                 type: req.type,
                 title: isEmail ? `Draft: ${args.subject}` : `Event: ${args.summary}`,
                 description: isEmail ? 'Review generated email draft.' : 'Review calendar event details.',
                 status: 'pending',
                 generatedContent: isEmail ? args.body : `Event: ${args.summary}\nTime: ${args.startTime} - ${args.endTime}\nDesc: ${args.description}`,
                 metadata: {
                     recipient: args.to,
                     date: args.startTime,
                 },
                 executionPayload: req.payload
             };
          });
          setApprovals(prev => [...newApprovals, ...prev]);
      }

      if (response.generatedTasks && response.generatedTasks.length > 0) {
          const newTasks: TaskItem[] = response.generatedTasks.map((t: any) => ({
              id: Date.now().toString() + Math.random().toString(),
              text: t.text,
              status: 'todo',
              category: t.category,
              priority: t.priority || 'medium',
              due: 'Today'
          }));
          setTasks(prev => [...prev, ...newTasks]);
      }

      if (response.generatedMemories && response.generatedMemories.length > 0) {
          const newMemories: MemoryItem[] = response.generatedMemories.map((m: any) => ({
              id: Date.now().toString() + Math.random().toString(),
              category: m.category,
              key: m.key,
              value: m.value,
              timestamp: new Date().toISOString()
          }));
          setMemories(prev => [...prev, ...newMemories]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "I apologize, but I'm having trouble executing that request.",
          timestamp: new Date()
      }]);
    } finally {
        setIsStreaming(false);
    }
  };

  const handleAddDocument = (doc: DocumentItem) => {
      setDocuments(prev => [...prev, doc]);
  };

  const handleRemoveDocument = (id: string) => {
      setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleDeleteMemory = (id: string) => {
      setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
      return t;
    }));

    const task = tasks.find(t => t.id === id);
    if (task && task.status === 'todo') {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            text: `[SYSTEM LOG]: User completed task: "${task.text}"`,
            timestamp: new Date()
        }]);
    }
  };

  const handleClearCompletedTasks = () => {
      setTasks(prev => prev.filter(t => t.status !== 'done'));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        text: `[SYSTEM LOG]: User cleared all completed tasks from the board.`,
        timestamp: new Date()
    }]);
  };

  const handleApprove = async (id: string) => {
    const item = approvals.find(i => i.id === id);
    if (!item) return;

    if (item.executionPayload) {
        const { functionName, args } = item.executionPayload;
        try {
            if (functionName === 'draftEmail') {
                await sendGmail(args.to, args.subject, args.body);
            } else if (functionName === 'bookMeeting') {
                await createEvent({
                    summary: args.summary,
                    description: args.description,
                    start: { dateTime: args.startTime },
                    end: { dateTime: args.endTime }
                });
            }
        } catch (e) {
            console.error("Execution failed", e);
            alert("Failed to execute action. Please check your Google connection.");
            return;
        }
    }

    setApprovals(prev => prev.filter(i => i.id !== id));
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `Action approved and executed: ${item.title}.`,
        timestamp: new Date()
    }]);
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.filter(i => i.id !== id));
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `[SYSTEM]: User rejected approval item: ${approvals.find(i => i.id === id)?.title}`,
        timestamp: new Date()
    }]);
  };

  // --- RENDER ---

  if (authLoading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-900 animate-spin" />
             <p className="text-stone-400 text-xs font-serif">Authenticating...</p>
        </div>
    </div>;
  }

  // Show Landing only if NOT logged in and we are in landing state
  if (!session && showLanding) {
      return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!session) {
    if (authMode === 'signup') {
        return (
            <SignUpPage 
                onSignUp={handleSignUp} 
                onSwitchToLogin={() => setAuthMode('login')} 
            />
        );
    }
    return (
        <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignUp={() => setAuthMode('signup')}
        />
    );
  }

  if (!hasCompletedOnboarding) {
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="relative h-screen flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <Layout 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            onLogout={handleLogout}
            approvalsCount={approvals.length}
            tasksCount={tasks.filter(t => t.status === 'todo').length}
        >
        {currentView === View.CHAT ? (
            <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isStreaming={isStreaming}
            onStartVoice={() => setIsVoiceMode(true)}
            />
        ) : (
            <>
                {currentView === View.DASHBOARD && (
                    <DailyBrief 
                        tasks={tasks} 
                        approvalsCount={approvals.length} 
                        onToggleTask={handleTaskToggle}
                        onClearCompleted={handleClearCompletedTasks}
                    />
                )}
                {currentView === View.APPROVALS && (
                    <ApprovalQueue 
                    items={approvals} 
                    onApprove={handleApprove} 
                    onReject={handleReject} 
                    />
                )}
                {currentView === View.TASKS && (
                     <DailyBrief 
                        tasks={tasks} 
                        approvalsCount={approvals.length}
                        onToggleTask={handleTaskToggle}
                        onClearCompleted={handleClearCompletedTasks}
                    />
                )}
                {currentView === View.EMAIL && <EmailClient />}
                {currentView === View.CALENDAR && <CalendarView />}
                {currentView === View.PHONE && <PhoneView />}
                {currentView === View.DOCS && (
                    <DocsView 
                        documents={documents} 
                        onAddDocument={handleAddDocument} 
                        onRemoveDocument={handleRemoveDocument} 
                    />
                )}
                {currentView === View.SETTINGS && (
                    <SettingsView 
                        userProfile={userProfile} 
                        onUpdateProfile={handleUpdateProfile} 
                        memories={memories}
                        onDeleteMemory={handleDeleteMemory}
                    />
                )}

                <FloatingChat 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    isStreaming={isStreaming}
                    onExpand={() => setCurrentView(View.CHAT)}
                />
            </>
        )}
        </Layout>
      </div>

      {isVoiceMode && (
          <VoiceMode 
            isOpen={isVoiceMode} 
            onClose={() => setIsVoiceMode(false)}
            userProfile={userProfile}
          />
      )}
    </div>
  );
};

export default App;
