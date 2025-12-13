
import React from 'react';
import { View } from '../types';
import { MessageSquare, LayoutDashboard, CheckSquare, ListTodo, Settings, User, Mail, Calendar as CalendarIcon, FileText, Phone, LogOut } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout?: () => void;
  children: React.ReactNode;
  approvalsCount?: number;
  tasksCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onNavigate, 
  onLogout, 
  children,
  approvalsCount = 0,
  tasksCount = 0
}) => {
  
  const NavItem = ({ view, icon: Icon, label, count }: { view: View; icon: React.ElementType; label: string; count?: number }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-stone-100 text-stone-900 font-medium' 
            : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
        <span className="text-sm flex-1 text-left">{label}</span>
        {count !== undefined && count > 0 && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isActive ? 'bg-stone-200 text-stone-800' : 'bg-stone-100 text-stone-500'}`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-100 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">AskHeaven<span className="text-stone-400">.io</span></h1>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Assistant</h3>
            <div className="space-y-0.5">
              <NavItem view={View.CHAT} icon={MessageSquare} label="Chat" />
              <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Daily Brief" />
              <NavItem view={View.APPROVALS} icon={CheckSquare} label="Approvals" count={approvalsCount} />
              <NavItem view={View.TASKS} icon={ListTodo} label="Tasks" count={tasksCount} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Workspace</h3>
            <div className="space-y-0.5">
              <NavItem view={View.EMAIL} icon={Mail} label="Inbox" />
              <NavItem view={View.CALENDAR} icon={CalendarIcon} label="Calendar" />
              <NavItem view={View.PHONE} icon={Phone} label="Phone" />
              <NavItem view={View.DOCS} icon={FileText} label="Docs & Drive" />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-stone-100">
           <button 
             onClick={() => onNavigate(View.SETTINGS)}
             className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors mb-1 ${currentView === View.SETTINGS ? 'bg-stone-100 text-stone-900 font-medium' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
           >
             <Settings size={18} className={currentView === View.SETTINGS ? 'text-stone-900' : 'text-stone-400'} />
             <span className="text-sm">Settings</span>
           </button>
           
           <div className="flex items-center gap-3 px-3 py-3 mt-2 group relative">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                 <User size={16} className="text-stone-500" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-stone-900 truncate">Alex Mercer</p>
                 <p className="text-xs text-stone-400 truncate">Pro Member</p>
              </div>
              
              {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-red-500 transition-all"
                    title="Sign Out"
                  >
                      <LogOut size={16} />
                  </button>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-stone-50/50">
        {children}
      </main>
    </div>
  );
};
