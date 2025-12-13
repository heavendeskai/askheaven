
import React, { useState } from 'react';
import { Phone, Voicemail, Play, Pause, Search, PhoneIncoming, PhoneOutgoing, PhoneMissed, MessageSquare } from 'lucide-react';
import { INITIAL_CALLS } from '../constants';
import { Button } from './ui/Button';

type PhoneTab = 'all' | 'voicemail' | 'texts';

export const PhoneView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PhoneTab>('all');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60 * 60 * 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getFilteredCalls = () => {
    if (activeTab === 'voicemail') {
      return INITIAL_CALLS.filter(c => c.voicemail);
    }
    // For 'texts', we'd return text message objects, but reusing structure for demo
    return INITIAL_CALLS;
  };

  const togglePlay = (id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null);
    } else {
      setIsPlaying(id);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar List */}
      <div className="w-96 bg-white border-r border-stone-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-serif font-semibold text-stone-900 text-xl mb-4">Communications</h2>
          
          {/* Tabs */}
          <div className="flex p-1 bg-stone-50 rounded-xl mb-4">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Recents
            </button>
            <button 
              onClick={() => setActiveTab('voicemail')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'voicemail' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Voicemail
            </button>
             <button 
              onClick={() => setActiveTab('texts')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'texts' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Texts
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input 
              type="text" 
              placeholder="Search number or name..." 
              className="w-full bg-stone-50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-stone-200 placeholder-stone-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'texts' ? (
              <div className="p-8 text-center text-stone-400">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No text messages yet.</p>
              </div>
          ) : (
            getFilteredCalls().map(call => (
                <div key={call.id} className="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            call.type === 'missed' ? 'bg-red-50 text-red-500' : 
                            call.type === 'incoming' ? 'bg-stone-100 text-stone-600' : 'bg-stone-100 text-stone-400'
                        }`}>
                            {call.type === 'missed' && <PhoneMissed size={14} />}
                            {call.type === 'incoming' && <PhoneIncoming size={14} />}
                            {call.type === 'outgoing' && <PhoneOutgoing size={14} />}
                        </div>
                        <div>
                            <div className={`text-sm font-medium ${call.type === 'missed' ? 'text-red-600' : 'text-stone-900'}`}>
                                {call.contact}
                            </div>
                            <div className="text-[11px] text-stone-400">{call.number}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-stone-400">{formatTime(call.timestamp)}</div>
                        {call.duration && <div className="text-[10px] text-stone-400 mt-0.5">{call.duration}</div>}
                    </div>
                </div>
                {call.voicemail && (
                    <div className="mt-3 bg-stone-50 rounded-lg p-3 border border-stone-100">
                        <div className="flex items-center gap-2 mb-2">
                             <button 
                                onClick={(e) => { e.stopPropagation(); togglePlay(call.id); }}
                                className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-black transition-colors"
                             >
                                 {isPlaying === call.id ? <Pause size={10} /> : <Play size={10} ml-0.5 />}
                             </button>
                             <div className="h-1 flex-1 bg-stone-200 rounded-full overflow-hidden">
                                 <div className={`h-full bg-stone-800 ${isPlaying === call.id ? 'w-1/2 animate-pulse' : 'w-0'}`}></div>
                             </div>
                             <span className="text-[10px] text-stone-500">0:42</span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2 italic">"{call.voicemail.transcript}"</p>
                    </div>
                )}
                </div>
            ))
          )}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 bg-stone-50/30 flex flex-col items-center justify-center text-stone-400">
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-sm text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="text-stone-600" size={24} />
            </div>
            <h3 className="text-lg font-serif text-stone-900 mb-2">Twilio Voice & SMS</h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                Connect your Twilio account to enable real-time call logging, AI call screening, and SMS management directly within Heaven.
            </p>
            <Button className="w-full justify-center">Add Twilio Integration</Button>
            <p className="mt-4 text-[10px] text-stone-400">
                This add-on connects Heaven to the telephone network for voice and text capabilities.
            </p>
         </div>
      </div>
    </div>
  );
};
