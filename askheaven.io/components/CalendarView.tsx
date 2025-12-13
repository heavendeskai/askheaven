
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal, Video, Calendar as CalendarIcon, LogIn, Plus, X, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { 
  initializeGapiClient, 
  initializeGisClient, 
  handleAuthClick, 
  listEvents, 
  createEvent,
  CalendarEvent 
} from '../services/gmail';

export const CalendarView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ summary: '', start: '', end: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeGapiClient();
        await initializeGisClient();
        // Optimistically try to fetch, if it fails, we need auth
        try {
            await fetchEvents(currentDate);
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Failed to initialize Google API", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        fetchEvents(currentDate);
    }
  }, [currentDate, isAuthenticated]);

  const fetchEvents = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const fetchedEvents = await listEvents(startOfDay.toISOString(), endOfDay.toISOString());
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
      throw err;
    }
  };

  const handleLogin = async () => {
    try {
      await handleAuthClick();
      setIsAuthenticated(true);
      fetchEvents(currentDate);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.summary || !newEvent.start || !newEvent.end) return;
    
    setIsCreating(true);
    const event = {
      summary: newEvent.summary,
      description: newEvent.description,
      start: { dateTime: new Date(newEvent.start).toISOString() },
      end: { dateTime: new Date(newEvent.end).toISOString() },
    };

    try {
      await createEvent(event);
      setIsModalOpen(false);
      setNewEvent({ summary: '', start: '', end: '', description: '' });
      fetchEvents(currentDate); 
    } catch (err) {
      alert("Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  const changeDay = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // --- Grid Calculation ---
  // We display 8 AM to 9 PM (13 hours).
  const START_HOUR = 8;
  const END_HOUR = 21;
  const HOURS_COUNT = END_HOUR - START_HOUR;
  const PIXELS_PER_HOUR = 100; // slightly smaller to fit better
  
  const getEventStyle = (event: CalendarEvent) => {
    if (!event.start.dateTime || !event.end.dateTime) return { display: 'none' };
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    // Calculate minutes from START_HOUR
    const startMinutesFromBase = (startHour - START_HOUR) * 60 + startMin;
    const durationMinutes = (endHour - startHour) * 60 + (endMin - startMin);

    const top = (startMinutesFromBase / 60) * PIXELS_PER_HOUR;
    const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

    return {
        top: `${top + 16}px`,
        height: `${Math.max(height, 32)}px`,
        position: 'absolute' as 'absolute',
        left: '1rem',
        right: '1rem'
    };
  };

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center bg-stone-50">
           <Loader2 className="animate-spin text-stone-400" size={32} />
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="text-stone-600" size={24} />
            </div>
            <h2 className="text-2xl font-serif text-stone-900 mb-2">Connect Your Calendar</h2>
            <p className="text-stone-500 mb-8">
                Allow Heaven to manage your schedule, detect conflicts, and book appointments.
            </p>
            <Button onClick={handleLogin} className="w-full justify-center py-3">
                Connect Google Calendar
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-stone-50/50 relative">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <div>
              <h2 className="text-2xl font-serif text-stone-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-stone-500 text-sm">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
              </p>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border border-stone-200 p-1">
                 <button onClick={() => changeDay(-1)} className="p-1 hover:bg-stone-100 rounded"><ChevronLeft size={18} className="text-stone-500" /></button>
                 <button onClick={() => changeDay(1)} className="p-1 hover:bg-stone-100 rounded"><ChevronRight size={18} className="text-stone-500" /></button>
              </div>
              <Button variant="secondary" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} className="mr-2" /> New Event
              </Button>
           </div>
        </div>

        {/* Calendar Grid (Day View) */}
        <div className="flex-1 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-y-auto relative flex">
            
            {/* Time Column */}
            <div className="w-16 border-r border-stone-100 flex flex-col pt-4 bg-stone-50/30">
                {['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'].map(time => (
                    <div key={time} className="h-[100px] text-xs text-stone-400 text-center relative border-b border-transparent">
                        <span className="-top-2 relative bg-stone-50/30 px-1">{time}</span>
                    </div>
                ))}
            </div>

            {/* Events Column */}
            <div className="flex-1 relative pt-4 min-h-[1400px]">
                {/* Grid Lines */}
                {Array.from({ length: 13 }).map((_, i) => (
                    <div key={i} className="absolute w-full border-t border-stone-100 h-[100px]" style={{ top: `${i * 100 + 16}px` }}></div>
                ))}

                {/* Events */}
                {events.map(event => {
                    const style = getEventStyle(event);
                    if (style.display === 'none') return null; // Skip non-time events
                    
                    return (
                        <div key={event.id} className="absolute bg-white border border-stone-200 border-l-4 border-l-stone-800 rounded-r-lg p-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden group animate-in zoom-in-95 duration-500" style={style}>
                            <div className="flex justify-between items-start h-full">
                                <div>
                                    <div className="font-medium text-stone-900 text-sm">{event.summary}</div>
                                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                                        <Clock size={12} /> 
                                        {new Date(event.start.dateTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                        {new Date(event.end.dateTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    {event.location && <div className="text-xs text-stone-400 mt-1 truncate">{event.location}</div>}
                                </div>
                                <a href={event.htmlLink} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-stone-100 rounded">
                                    <MoreHorizontal size={16} className="text-stone-400" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Assistant Side Panel */}
      <div className="w-80 bg-white border-l border-stone-100 p-6 hidden xl:block">
         <h3 className="text-sm font-serif font-semibold text-stone-900 mb-6">Heaven's Notes</h3>
         <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
             <p className="text-xs text-stone-600 leading-relaxed">
                 You have {events.length} events scheduled for today. 
                 {events.length > 4 ? " It looks like a busy day; consider blocking some focus time." : " You have some open slots for deep work."}
             </p>
         </div>
      </div>
    </div>
  );
};
