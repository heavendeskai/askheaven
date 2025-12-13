
import React from 'react';
import { UserContext, MemoryItem } from '../types';
import { Button } from './ui/Button';
import { Shield, MessageSquare, Activity, Lock, Mail, Calendar, HardDrive, Smartphone, Zap, Sliders, CheckCircle2, Clock, Brain, Trash2, Key } from 'lucide-react';

interface SettingsViewProps {
  userProfile: UserContext | null;
  onUpdateProfile: (updates: Partial<UserContext>) => void;
  memories?: MemoryItem[];
  onDeleteMemory?: (id: string) => void;
}

const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative ${active ? 'bg-stone-900' : 'bg-stone-200'}`}
  >
    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-stone-50 flex items-center gap-3">
      <div className="p-2 bg-stone-50 rounded-lg text-stone-500">
         <Icon size={18} />
      </div>
      <h3 className="font-medium text-stone-900">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, onUpdateProfile, memories = [], onDeleteMemory }) => {
  if (!userProfile) return null;

  return (
    <div className="flex h-full flex-col">
       {/* Header */}
       <div className="px-8 py-6 bg-white border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif text-stone-900">Control Plane</h2>
            <p className="text-sm text-stone-500">Configure Heaven's behavior and neural links.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
              <Activity size={12} /> Systems Nominal
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          
          <Section title="Neural Vault (Long-Term Memory)" icon={Brain}>
             <div className="mb-4 text-sm text-stone-500">
                Heaven automatically learns facts, preferences, and details about your life to better serve you.
                Review or delete these memories below.
             </div>
             
             {memories.length === 0 ? (
                 <div className="text-center p-8 bg-stone-50 rounded-xl border border-stone-100 border-dashed text-stone-400 text-sm italic">
                    The vault is empty. Tell Heaven about your preferences to fill it.
                 </div>
             ) : (
                 <div className="grid md:grid-cols-2 gap-4">
                     {memories.map(mem => (
                         <div key={mem.id} className="bg-white border border-stone-200 rounded-xl p-3 flex justify-between items-start group hover:shadow-sm transition-shadow">
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                         mem.category === 'person' ? 'bg-purple-100 text-purple-700' :
                                         mem.category === 'preference' ? 'bg-pink-100 text-pink-700' :
                                         mem.category === 'project' ? 'bg-blue-100 text-blue-700' :
                                         'bg-stone-100 text-stone-600'
                                     }`}>
                                         {mem.category}
                                     </span>
                                     <span className="text-xs text-stone-400">{new Date(mem.timestamp).toLocaleDateString()}</span>
                                 </div>
                                 <div className="text-xs font-semibold text-stone-900 mb-0.5">{mem.key}</div>
                                 <div className="text-xs text-stone-600 leading-snug">{mem.value}</div>
                             </div>
                             {onDeleteMemory && (
                                 <button 
                                    onClick={() => onDeleteMemory(mem.id)}
                                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Forget Memory"
                                 >
                                     <Trash2 size={14} />
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>
             )}
          </Section>

          <Section title="Behavioral Protocol" icon={Sliders}>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                         <Shield size={16} className="text-stone-400" />
                         Gatekeeper Mode
                      </div>
                      <p className="text-xs text-stone-500 mt-1 max-w-md">
                         When enabled (High Strictness), Heaven aggressively declines low-priority invites and filters spam. Disabling allows more open access.
                      </p>
                   </div>
                   <Toggle 
                      active={userProfile.strictness === 'high'} 
                      onClick={() => onUpdateProfile({ strictness: userProfile.strictness === 'high' ? 'low' : 'high' })} 
                   />
                </div>
                
                <div className="w-full h-px bg-stone-50" />

                <div className="flex items-center justify-between">
                   <div>
                      <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                         <MessageSquare size={16} className="text-stone-400" />
                         Concise Briefings
                      </div>
                      <p className="text-xs text-stone-500 mt-1 max-w-md">
                         Prefer bullet points and action-oriented language over conversational filler.
                      </p>
                   </div>
                   <Toggle 
                      active={userProfile.verbosity !== 'conversational'} 
                      onClick={() => onUpdateProfile({ verbosity: userProfile.verbosity === 'conversational' ? 'concise' : 'conversational' })} 
                   />
                </div>

                <div className="w-full h-px bg-stone-50" />

                <div className="flex items-center justify-between">
                   <div>
                      <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                         <Clock size={16} className="text-stone-400" />
                         Check-in Frequency
                      </div>
                      <p className="text-xs text-stone-500 mt-1 max-w-md">
                         How often Heaven actively prompts you to review tasks (Morning/Noon/Evening).
                      </p>
                   </div>
                   <div className="flex bg-stone-100 rounded-lg p-1">
                      {['low', 'medium', 'high'].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => onUpdateProfile({ checkInFrequency: freq as any })}
                            className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${userProfile.checkInFrequency === freq ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                            {freq}
                          </button>
                      ))}
                   </div>
                </div>
             </div>
          </Section>

          <Section title="Neural Integrations" icon={Zap}>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-stone-100 rounded-xl p-4 flex items-center justify-between bg-stone-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100">
                         <Mail size={16} className="text-red-500" />
                      </div>
                      <div>
                         <div className="text-sm font-medium text-stone-900">Gmail</div>
                         <div className="text-[10px] text-stone-500">Read/Write/Draft</div>
                      </div>
                   </div>
                   <div className="text-green-600">
                      <CheckCircle2 size={18} />
                   </div>
                </div>

                <div className="border border-stone-100 rounded-xl p-4 flex items-center justify-between bg-stone-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100">
                         <Calendar size={16} className="text-blue-500" />
                      </div>
                      <div>
                         <div className="text-sm font-medium text-stone-900">Calendar</div>
                         <div className="text-[10px] text-stone-500">Schedule/Audit</div>
                      </div>
                   </div>
                   <div className="text-green-600">
                      <CheckCircle2 size={18} />
                   </div>
                </div>

                <div className="border border-stone-100 rounded-xl p-4 flex items-center justify-between bg-stone-50/50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100">
                         <HardDrive size={16} className="text-yellow-500" />
                      </div>
                      <div>
                         <div className="text-sm font-medium text-stone-900">Drive</div>
                         <div className="text-[10px] text-stone-500">RAG Context</div>
                      </div>
                   </div>
                   <div className="text-green-600">
                      <CheckCircle2 size={18} />
                   </div>
                </div>

                <div className="border border-stone-100 rounded-xl p-4 flex items-center justify-between bg-stone-50/50 opacity-70">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100">
                         <Smartphone size={16} className="text-stone-400" />
                      </div>
                      <div>
                         <div className="text-sm font-medium text-stone-900">Twilio</div>
                         <div className="text-[10px] text-stone-500">Not Connected</div>
                      </div>
                   </div>
                   <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Connect</Button>
                </div>
             </div>
          </Section>

          <Section title="Account & Subscription" icon={Lock}>
             <div className="flex justify-between items-center mb-4">
                <div>
                   <div className="text-sm font-medium text-stone-900">{userProfile.name}</div>
                   <div className="text-xs text-stone-500 capitalize">{userProfile.role === 'business' ? 'Executive Account' : 'Household Account'}</div>
                </div>
                <div className="text-xs font-bold text-stone-900 bg-amber-100 text-amber-800 px-3 py-1 rounded-full uppercase tracking-wider">
                    {userProfile.subscriptionTier === 'premium' ? 'Platinum' : 'Silver'}
                </div>
             </div>
             <div className="p-4 bg-stone-900 text-white rounded-xl flex justify-between items-center">
                 <div className="text-xs">
                    <p className="opacity-70 mb-1">API Usage</p>
                    <p className="font-mono">14,203 / 50,000 Tokens</p>
                 </div>
                 <Button size="sm" className="bg-white text-stone-900 hover:bg-stone-200 border-none">Upgrade Plan</Button>
             </div>
          </Section>

       </div>
    </div>
  );
};
