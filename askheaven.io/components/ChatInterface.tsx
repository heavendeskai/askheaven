
import React, { useRef, useEffect, useState } from 'react';
import { Send, Mic, Sparkles, StopCircle, MicOff, Globe, ExternalLink, Phone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Button } from './ui/Button';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStartVoice: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isStreaming, onStartVoice }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Legacy WebSpeech API for text input (simple dictation)
  const toggleVoiceInput = () => {
    if (isListening) {
        setIsListening(false);
        return;
    }
    if (!('webkitSpeechRecognition' in window)) {
        alert("Dictation is not supported in this browser.");
        return;
    }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-white/50 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center px-6 z-10 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white">
            <Sparkles size={14} />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-stone-900">AskHeaven<span className="text-stone-400">.io</span></h2>
            <p className="text-xs text-stone-500">
                {isStreaming ? 'Consulting reliable sources...' : 'Ready'}
            </p>
          </div>
        </div>
        
        {/* Project Vox Entry Point */}
        <Button 
            onClick={onStartVoice}
            className="rounded-full px-4 py-2 bg-stone-900 text-white hover:bg-black shadow-sm flex items-center gap-2 text-xs font-medium"
        >
            <Phone size={14} className="animate-pulse" /> Call Heaven
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 sm:px-6 lg:px-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
            <div className="w-16 h-16 rounded-2xl bg-stone-200 mb-6 flex items-center justify-center text-stone-400">
               <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-serif text-stone-800 mb-2">Executive Command.</h3>
            <p className="max-w-md text-stone-600">
              I can check market trends, research companies, read your strategy docs, and manage your day.
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-stone-900 text-stone-50 rounded-br-none'
                  : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                 <>
                 <ReactMarkdown 
                    className="prose prose-sm prose-stone max-w-none"
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-stone-900" {...props} />,
                    }}
                 >
                    {msg.text}
                 </ReactMarkdown>
                 
                 {msg.groundingMetadata?.web && msg.groundingMetadata.web.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-stone-100">
                         <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-2">
                             <Globe size={12} /> Sources
                         </div>
                         <div className="flex flex-wrap gap-2">
                             {msg.groundingMetadata.web.map((source, idx) => (
                                 <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-2 py-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-[10px] text-stone-600 transition-colors max-w-xs truncate"
                                 >
                                     <span className="truncate max-w-[150px]">{source.title}</span>
                                     <ExternalLink size={8} className="opacity-50" />
                                 </a>
                             ))}
                         </div>
                     </div>
                 )}
                 </>
              ) : (
                <span className="whitespace-pre-wrap">{msg.text}</span>
              )}
            </div>
            <div className="text-[10px] text-stone-300 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Heaven'} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex justify-start">
                 <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 flex items-end p-2 transition-shadow duration-200 focus-within:shadow-xl focus-within:border-stone-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Heaven..."
              className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-stone-800 placeholder-stone-400 text-sm scrollbar-hide"
              rows={1}
            />
            <div className="flex items-center gap-1 pb-1.5 pr-1">
              <button 
                onClick={toggleVoiceInput}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
                title="Dictation"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <Button 
                onClick={() => handleSubmit()} 
                disabled={!input.trim() || isStreaming}
                size="sm"
                className="rounded-xl px-3"
              >
                 {isStreaming ? <StopCircle size={18} className="animate-pulse" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
          <p className="text-center text-[10px] text-stone-400 mt-2">
             Connected to Calendar, Email & Google Live Search
          </p>
        </div>
      </div>
    </div>
  );
};
