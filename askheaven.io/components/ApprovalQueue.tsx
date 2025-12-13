import React from 'react';
import { ApprovalItem } from '../types';
import { Button } from './ui/Button';
import { Check, X, Mail, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface ApprovalQueueProps {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ApprovalCard: React.FC<{ 
    item: ApprovalItem; 
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}> = ({ item, onApprove, onReject }) => {
    
  const getIcon = () => {
    switch (item.type) {
      case 'email': return <Mail className="text-stone-500" size={20} />;
      case 'calendar': return <Calendar className="text-stone-500" size={20} />;
      case 'purchase': return <CreditCard className="text-stone-500" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 bg-stone-50 rounded-lg border border-stone-100">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-stone-900 text-sm">{item.title}</h3>
            <span className="text-[10px] font-medium tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Review</span>
          </div>
          <p className="text-sm text-stone-500 mt-1 mb-3">{item.description}</p>
          
          {item.generatedContent && (
            <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-700 font-mono mb-4 border border-stone-100 whitespace-pre-wrap">
              {item.generatedContent}
            </div>
          )}

          {item.metadata && (
             <div className="flex gap-4 mb-4 text-xs text-stone-400">
                {item.metadata.recipient && <span>To: {item.metadata.recipient}</span>}
                {item.metadata.date && <span>When: {item.metadata.date}</span>}
             </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => onApprove(item.id)} className="bg-stone-900 hover:bg-black text-white px-5 rounded-lg">
              <Check size={14} className="mr-1.5" /> Approve
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onReject(item.id)} className="rounded-lg">
              <X size={14} className="mr-1.5" /> Reject
            </Button>
             <Button size="sm" variant="ghost" className="ml-auto text-xs">
              Edit <ChevronRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ items, onApprove, onReject }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Check size={24} className="text-stone-300" />
        </div>
        <p className="text-sm">All caught up. No pending approvals.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <header className="mb-8">
            <h2 className="text-2xl font-serif font-medium text-stone-900">Approvals Needed</h2>
            <p className="text-stone-500 text-sm mt-1">Review items before Heaven executes them.</p>
        </header>
      <div className="space-y-4">
        {items.map(item => (
          <ApprovalCard key={item.id} item={item} onApprove={onApprove} onReject={onReject} />
        ))}
      </div>
    </div>
  );
};