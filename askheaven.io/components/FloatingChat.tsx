
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, X, Maximize2, ChevronDown, MessageSquare } from 'lucide-react';
import { Message } from '../types';
import { Button } from './ui/Button';

interface FloatingChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onExpand: () => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ messages, onSendMessage, isStreaming, onExpand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-stone-900 text-white rounded-full shadow-xl shadow-stone-900/20 flex items-center justify-center hover:scale-105 transition-transform z-40 group"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-stone-900/20 border border-stone-200 flex flex-col z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Header */}
      <div className="h-14 border-b border-stone-100 flex items-center justify-between px-4 bg-stone-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center text-white">
            <Sparkles size={12} />
          </div>
          <span className="font-serif font-medium text-stone-900">AskHeaven<span className="text-stone-400">.io</span></span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onExpand} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg" title="Expand to Full View">
            <Maximize2 size={14} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-stone-900 text-stone-50 rounded-br-none'
                  : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
            <div className="text-[10px] text-stone-300 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex justify-start">
                 <div className="bg-white border border-stone-100 rounded-xl rounded-bl-none px-3 py-2 shadow-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-stone-100 bg-white rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
                className="flex-1 bg-stone-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-stone-200"
                placeholder="Ask quickly..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button size="sm" type="submit" disabled={!input.trim() || isStreaming} className="w-10 px-0">
                <Send size={14} />
            </Button>
        </form>
      </div>
    </div>
  );
};
