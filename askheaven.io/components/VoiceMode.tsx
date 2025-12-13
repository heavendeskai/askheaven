
import React, { useEffect, useRef, useState } from 'react';
import { UserContext } from '../types';
import { connectToLiveSession } from '../services/gemini';
import { Mic, MicOff, PhoneOff, Activity, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './ui/Button';

interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserContext | null;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ isOpen, onClose, userProfile }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'listening' | 'speaking' | 'executing' | 'disconnected'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  // Use ref to track muted state in audio processor closure
  const isMutedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

  // Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Sync ref with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      // 1. Initialize Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // For visualizer

      // 2. Initialize Microphone
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      inputSourceRef.current.connect(analyserRef.current); // Connect mic to visualizer

      // 3. Setup Processor for sending audio (Downsampling happens via Context sampleRate naturally if set, but we buffer here)
      // Note: ScriptProcessor is deprecated but reliable for raw PCM extraction without AudioWorklets setup in pure React
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination); // Essential for processor to run

      // 4. Start Live Session
      const sessionPromise = connectToLiveSession(
        userProfile,
        (audioChunk) => queueAudio(audioChunk),
        (newStatus) => {
            if (newStatus === 'connected') setStatus('listening');
            else if (newStatus === 'executing') setStatus('executing');
            else if (newStatus === 'disconnected') onClose();
            else if (newStatus === 'interrupted') {
                // Stop current audio immediately
                if (currentSourceRef.current) {
                    try {
                        currentSourceRef.current.stop();
                    } catch (e) { /* ignore */ }
                    currentSourceRef.current = null;
                }
                // Clear queue
                audioQueueRef.current = [];
                isPlayingRef.current = false;
                // Reset timeline
                if (audioContextRef.current) {
                    nextStartTimeRef.current = audioContextRef.current.currentTime;
                }
                setStatus('listening');
            }
        }
      );

      sessionRef.current = sessionPromise;

      processorRef.current.onaudioprocess = (e) => {
        if (isMutedRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToInt16(inputData);
        
        sessionPromise.then(session => {
             // Send raw PCM with mimeType using correct object structure
             session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: arrayBufferToBase64(pcmData)
                }
             });
        });
      };

      startVisualizer();

    } catch (e) {
      console.error("Voice Mode Error", e);
      setError("Failed to access microphone or connect to Heaven.");
      setStatus('disconnected');
    }
  };

  const cleanup = () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (sessionRef.current) {
        sessionRef.current.then((s: any) => s.close());
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  // --- AUDIO OUTPUT HANDLING ---

  const queueAudio = (buffer: ArrayBuffer) => {
    audioQueueRef.current.push(buffer);
    if (!isPlayingRef.current) {
      playQueue();
    }
  };

  const playQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      setStatus('listening'); // Back to listening when done speaking
      return;
    }

    isPlayingRef.current = true;
    setStatus('speaking');

    const buffer = audioQueueRef.current.shift()!;
    // Create AudioBuffer from raw PCM
    const audioBuffer = audioContextRef.current.createBuffer(1, buffer.byteLength / 2, 24000); // Model output is usually 24k
    const channelData = audioBuffer.getChannelData(0);
    const view = new Int16Array(buffer);
    for (let i = 0; i < view.length; i++) {
        channelData[i] = view[i] / 32768;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    currentSourceRef.current = source;

    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    
    source.onended = () => {
        playQueue();
    };
  };

  // --- HELPER: PCM CONVERSION ---
  const convertFloat32ToInt16 = (buffer: Float32Array) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    }
    return buf.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // --- VISUALIZER ---
  const startVisualizer = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Breathing Orb Logic
          let average = 0;
          for(let i = 0; i < bufferLength; i++) {
              average += dataArray[i];
          }
          average = average / bufferLength;

          const radius = 50 + (average * 0.5); // Pulse size
          
          // Gradient Orb
          const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
          
          if (status === 'speaking') {
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
              gradient.addColorStop(1, 'rgba(200, 230, 255, 0.2)');
          } else if (status === 'listening') {
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
              gradient.addColorStop(1, 'rgba(255, 200, 200, 0.1)'); // Subtle red tint for recording
          } else if (status === 'executing') {
               gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
               gradient.addColorStop(1, 'rgba(100, 255, 100, 0.3)'); // Green for action
          } else {
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
          }

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Outer Ring Particles
          if (status === 'speaking' || status === 'listening') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (average/255)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
      };

      draw();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md flex flex-col items-center justify-between h-[80vh] relative">
         
         {/* Status Header */}
         <div className="text-center space-y-2 mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-white/80 text-xs font-medium tracking-wide">
                <Activity size={12} className={status !== 'disconnected' ? 'animate-pulse' : ''} />
                {status === 'connecting' && 'Establishing Neural Link...'}
                {status === 'connected' && 'Link Stable'}
                {status === 'listening' && 'Listening...'}
                {status === 'speaking' && 'Speaking...'}
                {status === 'executing' && 'Executing Task...'}
                {status === 'disconnected' && 'Connection Lost'}
            </div>
            {error && <p className="text-red-400 text-xs bg-red-900/20 px-2 py-1 rounded">{error}</p>}
         </div>

         {/* Center Visualizer */}
         <div className="relative w-full aspect-square flex items-center justify-center">
             <canvas 
                ref={canvasRef} 
                width={400} 
                height={400} 
                className="w-full h-full"
             />
             {status === 'connecting' && (
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-20 h-20 border-t-2 border-white rounded-full animate-spin opacity-50"></div>
                 </div>
             )}
         </div>

         {/* Tips */}
         <div className="text-white/50 text-sm text-center max-w-xs h-10">
            {status === 'listening' && "You can interrupt me at any time."}
            {status === 'speaking' && "..."}
            {status === 'executing' && "I am working on that now."}
         </div>

         {/* Controls */}
         <div className="flex items-center gap-6 mb-12">
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-stone-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
             >
                 {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>

             <button 
                onClick={onClose}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
             >
                 <PhoneOff size={32} />
             </button>
             
             <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                 <Volume2 size={24} />
             </div>
         </div>
      </div>
    </div>
  );
};
