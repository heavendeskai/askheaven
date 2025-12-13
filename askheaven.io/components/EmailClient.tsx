
import React, { useState, useEffect } from 'react';
import { Search, Star, Archive, MoreHorizontal, Paperclip, Reply, Sparkles, LogIn, RefreshCw, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { 
  initializeGapiClient, 
  initializeGisClient, 
  handleAuthClick, 
  handleSignoutClick, 
  listMessages, 
  getMessage, 
  sendMessage,
  getHeader,
  getBody,
  GmailMessage 
} from '../services/gmail';

// Simplified internal model for UI
interface EmailUI {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tag?: string;
  body: string;
  raw: GmailMessage;
}

export const EmailClient: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [emails, setEmails] = useState<EmailUI[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailUI | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeGapiClient();
        await initializeGisClient();
        // Check if token exists? GAPI doesn't persist token effectively across reloads without explicit check/signin.
        // We'll rely on user clicking "Connect" for this demo flow.
      } catch (err) {
        console.error("Failed to initialize Google API", err);
        setError("Could not initialize Google API services. Please ensure scripts are loaded.");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await handleAuthClick();
      setIsAuthenticated(true);
      await fetchEmails();
    } catch (err) {
      console.error("Login failed", err);
      setError("Failed to sign in. Please check your configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    handleSignoutClick();
    setIsAuthenticated(false);
    setEmails([]);
    setSelectedEmail(null);
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const messagesList = await listMessages(15);
      const emailDetailsPromises = messagesList.map(msg => getMessage(msg.id));
      const rawEmails = await Promise.all(emailDetailsPromises);
      
      const formattedEmails: EmailUI[] = rawEmails.map(msg => {
        const headers = msg.payload.headers;
        const from = getHeader(headers, 'From');
        const subject = getHeader(headers, 'Subject');
        const dateStr = getHeader(headers, 'Date');
        const body = getBody(msg.payload);
        const snippet = msg.snippet;
        const date = new Date(dateStr);
        
        // Simple formatting
        const timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const unread = msg.labelIds.includes('UNREAD');

        return {
          id: msg.id,
          sender: from.replace(/<.*>/, '').trim() || from, // Clean up name
          subject: subject || '(No Subject)',
          preview: snippet,
          time: timeDisplay,
          unread: unread,
          tag: unread ? 'New' : undefined,
          body: body,
          raw: msg
        };
      });
      
      setEmails(formattedEmails);
      if (formattedEmails.length > 0 && !selectedEmail) {
        setSelectedEmail(formattedEmails[0]);
      }
    } catch (err) {
      console.error("Fetch emails failed", err);
      setError("Failed to fetch emails.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;
    setIsSending(true);
    
    // Extract real email from header
    const fromHeader = getHeader(selectedEmail.raw.payload.headers, 'From');
    const match = fromHeader.match(/<(.+)>/);
    const toAddress = match ? match[1] : fromHeader;

    try {
      await sendMessage(toAddress, `Re: ${selectedEmail.subject}`, replyText);
      setReplyText('');
      alert("Reply sent successfully!");
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-stone-400" size={32} />
            <p className="text-stone-500 font-serif">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="text-stone-600" size={24} />
            </div>
            <h2 className="text-2xl font-serif text-stone-900 mb-2">Connect Your Inbox</h2>
            <p className="text-stone-500 mb-8">
                Heaven needs access to your Email to categorize priorities, draft responses, and manage your communication.
            </p>
            {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <Button onClick={handleLogin} className="w-full justify-center py-3">
                Connect Email
            </Button>
            <p className="mt-4 text-[10px] text-stone-400">
                Supports Gmail, Outlook, and IMAP via integration providers.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Email List Sidebar */}
      <div className="w-80 bg-white border-r border-stone-100 flex flex-col">
        <div className="p-4 border-b border-stone-100">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-serif font-semibold text-stone-900">Inbox</h2>
             <button onClick={fetchEmails} className="text-stone-400 hover:text-stone-600">
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-stone-50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-stone-200 placeholder-stone-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-stone-100' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium truncate pr-2 ${email.unread ? 'text-stone-900' : 'text-stone-600'}`}>
                  {email.sender}
                </span>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">{email.time}</span>
              </div>
              <div className="text-sm text-stone-800 mb-1 truncate">{email.subject}</div>
              <div className="text-xs text-stone-500 line-clamp-2">{email.preview}</div>
              {email.tag && (
                <div className="mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium bg-stone-100 text-stone-500`}>
                    {email.tag}
                  </span>
                </div>
              )}
            </div>
          ))}
          {emails.length === 0 && !isLoading && (
              <div className="p-8 text-center text-stone-400 text-sm">No emails found.</div>
          )}
        </div>
      </div>

      {/* Email Reading Pane */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail ? (
        <>
            {/* Toolbar */}
            <div className="h-16 border-b border-stone-100 flex items-center justify-between px-6">
            <div className="flex gap-2 text-stone-400">
                <button className="p-2 hover:bg-stone-50 rounded-lg"><Archive size={18} /></button>
                <button className="p-2 hover:bg-stone-50 rounded-lg"><Star size={18} /></button>
                <button className="p-2 hover:bg-stone-50 rounded-lg"><MoreHorizontal size={18} /></button>
            </div>
            <div className="flex gap-2 items-center">
                <span className="text-xs text-stone-400 flex items-center">Connected</span>
                <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-stone-800 ml-4 underline">Disconnect</button>
            </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-serif text-stone-900 mb-4">{selectedEmail.subject}</h1>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-medium">
                            {selectedEmail.sender[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-stone-900">{selectedEmail.sender}</div>
                            <div className="text-xs text-stone-500">to me</div>
                        </div>
                    </div>
                    <div className="text-xs text-stone-400">{selectedEmail.time}</div>
                </div>
            </div>

            {/* Heaven's Insight (Mock AI Layer for now - could be real later) */}
            <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100 relative">
                <div className="absolute -top-3 left-4 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Heaven Insight
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                    This email seems {selectedEmail.tag === 'New' ? 'recent' : 'relevant'}. I can help you draft a reply or schedule a follow-up.
                </p>
            </div>

            {/* Body */}
            <div className="prose prose-sm prose-stone max-w-none text-stone-800 whitespace-pre-wrap font-sans overflow-hidden break-words">
                {selectedEmail.body}
            </div>
            </div>

            {/* Reply Box */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                <div className="flex gap-4 text-stone-400 mb-2">
                    <Reply size={16} />
                    <span className="text-sm">Reply to {selectedEmail.sender}...</span>
                </div>
                <textarea 
                    className="w-full h-24 p-2 text-sm border-none focus:ring-0 resize-none text-stone-800 placeholder-stone-300"
                    placeholder="Type your message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2 border-t border-stone-100 pt-2">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Paperclip size={16} /></Button>
                    </div>
                    <Button size="sm" onClick={handleSendReply} disabled={isSending}>
                        {isSending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                        {isSending ? 'Sending...' : 'Send Reply'}
                    </Button>
                </div>
            </div>
            </div>
        </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400">
                Select an email to view
            </div>
        )}
      </div>
    </div>
  );
};
