
import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { CloudSun, Clock, CheckCircle2, Circle, Target, StickyNote, Sun, Moon, Coffee, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface DailyBriefProps {
  tasks: TaskItem[];
  approvalsCount?: number;
  onToggleTask: (id: string) => void;
  onClearCompleted?: () => void;
}

export const DailyBrief: React.FC<DailyBriefProps> = ({ tasks, approvalsCount = 0, onToggleTask, onClearCompleted }) => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setTimeOfDay('morning');
    else if (hour < 16) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const strategicTasks = tasks.filter(t => t.category === 'strategic');
  const errandTasks = tasks.filter(t => t.category === 'errand');
  const completedCount = tasks.filter(t => t.status === 'done').length;

  const getGreeting = () => {
      if (timeOfDay === 'morning') return "Good morning.";
      if (timeOfDay === 'afternoon') return "Good afternoon.";
      return "Good evening.";
  };

  const getFocusMessage = () => {
      if (timeOfDay === 'morning') return "Let's align on your primary objectives before the day gets noisy.";
      if (timeOfDay === 'afternoon') return "A good time to clear tactical errands and check pending approvals.";
      return "Let's review what we accomplished and clear the board for tomorrow.";
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
            <h1 className="text-3xl font-serif text-stone-900 mb-2">{getGreeting()}</h1>
            <p className="text-stone-500 font-medium flex items-center gap-2">
                {timeOfDay === 'morning' && <Sun size={14} className="text-amber-500" />}
                {timeOfDay === 'afternoon' && <Coffee size={14} className="text-stone-600" />}
                {timeOfDay === 'evening' && <Moon size={14} className="text-indigo-500" />}
                {dateString}
            </p>
        </div>
        <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">System Mode</div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                timeOfDay === 'morning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                timeOfDay === 'afternoon' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
                {timeOfDay === 'morning' ? 'Strategic Planning' : timeOfDay === 'afternoon' ? 'Tactical Execution' : 'End of Day Review'}
            </div>
        </div>
      </header>

      {/* Dynamic Insight Banner */}
      <div className="mb-10 bg-white border-l-4 border-stone-800 rounded-r-xl p-4 shadow-sm flex items-center justify-between">
          <p className="text-stone-600 text-sm">
             {getFocusMessage()}
          </p>
          {approvalsCount > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md ml-4 whitespace-nowrap">
                  {approvalsCount} Approvals Pending
              </span>
          )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Strategic - Highlighted in Morning */}
              <section className={`${timeOfDay === 'morning' ? 'opacity-100' : 'opacity-80'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-stone-900" />
                    <h2 className="text-lg font-medium text-stone-900">Focus Objectives</h2>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    {strategicTasks.length === 0 && (
                        <div className="p-6 text-center text-stone-400 text-sm italic">No strategic objectives set for today.</div>
                    )}
                    {strategicTasks.map((task, idx) => (
                        <div 
                        key={task.id} 
                        className={`p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group ${idx !== strategicTasks.length -1 ? 'border-b border-stone-50' : ''}`}
                        onClick={() => onToggleTask(task.id)}
                        >
                            <button className={`transition-colors ${task.status === 'done' ? 'text-stone-300' : 'text-stone-400 group-hover:text-stone-900'}`}>
                                {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                {task.text}
                            </span>
                            {task.priority === 'high' && task.status !== 'done' && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">HIGH</span>
                            )}
                        </div>
                    ))}
                </div>
              </section>

              {/* Evening Summary Card */}
              {timeOfDay === 'evening' && (
                  <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
                      <h3 className="text-lg font-serif mb-2">Daily Summary</h3>
                      <div className="flex items-center gap-8 mb-6">
                          <div>
                              <div className="text-3xl font-bold">{completedCount}</div>
                              <div className="text-xs text-stone-400 uppercase tracking-wider">Completed</div>
                          </div>
                          <div>
                              <div className="text-3xl font-bold text-amber-400">{tasks.length - completedCount}</div>
                              <div className="text-xs text-stone-400 uppercase tracking-wider">Remaining</div>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <Button 
                            className="bg-white text-stone-900 hover:bg-stone-200" 
                            onClick={onClearCompleted}
                          >
                             Clear Completed
                          </Button>
                          <Button variant="secondary" className="bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white">
                             Reschedule Remaining
                          </Button>
                      </div>
                  </div>
              )}
          </div>

          {/* Side Column - Tactical Reminders */}
          <div className="space-y-6">
              
              {/* Tactical Widget - Highlighted in Afternoon */}
              <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <StickyNote size={18} className={timeOfDay === 'afternoon' ? 'text-amber-600' : 'text-stone-400'} />
                        <h2 className="text-lg font-medium text-stone-900">Tactical</h2>
                    </div>
                    {/* Only show clear button in afternoon/evening if items are done */}
                    {completedCount > 0 && timeOfDay !== 'morning' && (
                        <button 
                            onClick={onClearCompleted}
                            className="text-xs text-stone-400 hover:text-stone-900 underline"
                        >
                            Clear Done
                        </button>
                    )}
                </div>
                
                <div className={`rounded-2xl border p-4 min-h-[300px] shadow-sm relative overflow-hidden transition-colors duration-500 ${
                    timeOfDay === 'afternoon' 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-stone-50 border-stone-100'
                }`}>
                    {/* Dotted lines effect */}
                    <div className={`absolute top-0 left-8 bottom-0 border-l-2 border-dashed ${timeOfDay === 'afternoon' ? 'border-amber-200' : 'border-stone-200'}`}></div>
                    
                    <div className="relative z-10 space-y-3">
                        {errandTasks.length === 0 && (
                            <div className="text-stone-400 text-sm italic pt-4 pl-4">Tactical list is clear.</div>
                        )}
                        {errandTasks.map(task => (
                            <div 
                                key={task.id}
                                onClick={() => onToggleTask(task.id)}
                                className="flex items-start gap-3 group cursor-pointer"
                            >
                                <button className={`mt-0.5 ${task.status === 'done' ? 'text-stone-300' : (timeOfDay === 'afternoon' ? 'text-amber-600' : 'text-stone-400')}`}>
                                    {task.status === 'done' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>
                                <span className={`text-sm leading-snug ${task.status === 'done' ? 'line-through text-stone-300' : 'text-stone-700'}`}>
                                    {task.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};
