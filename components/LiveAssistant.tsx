
import React, { useEffect, useRef, useState } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getLiveClient } from '../services/geminiService';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import { Mic, MicOff, Video, VideoOff, X, Activity } from 'lucide-react';

interface LiveAssistantProps {
  onClose: () => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [volume, setVolume] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // FIX: Removed fixed sampleRate to support mobile devices
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputContextRef.current.createMediaStreamSource(stream);
      const analyser = inputContextRef.current.createAnalyser();
      const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(inputContextRef.current.destination);

      const pcmData = new Float32Array(analyser.fftSize);
      const updateVolume = () => {
        analyser.getFloatTimeDomainData(pcmData);
        let sum = 0;
        for(let i=0; i<pcmData.length; i++) sum += pcmData[i] * pcmData[i];
        setVolume(Math.sqrt(sum / pcmData.length) * 100);
        if(isActive) requestAnimationFrame(updateVolume);
      };
      
      const liveClient = getLiveClient();
      
      sessionRef.current = liveClient.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus("Connected. Listening...");
            setIsActive(true);
            updateVolume();

            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            if (canvasRef.current && videoRef.current) {
               const ctx = canvasRef.current.getContext('2d');
               frameIntervalRef.current = window.setInterval(() => {
                 if (!isVideoOn || !videoRef.current || !ctx) return;
                 
                 canvasRef.current!.width = videoRef.current.videoWidth;
                 canvasRef.current!.height = videoRef.current.videoHeight;
                 ctx.drawImage(videoRef.current, 0, 0);
                 
                 const base64Data = canvasRef.current!.toDataURL('image/jpeg', 0.5).split(',')[1];
                 sessionRef.current?.then(session => {
                   session.sendRealtimeInput({
                     media: { data: base64Data, mimeType: 'image/jpeg' }
                   });
                 });
               }, 1000); 
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
             setStatus("Disconnected");
             setIsActive(false);
          },
          onerror: (err) => {
            console.error(err);
            setStatus("Error occurred");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a helpful, witty, and knowledgeable AI assistant. Keep responses concise and conversational.",
        }
      });

    } catch (err) {
      console.error("Failed to start session:", err);
      setStatus("Failed to access media devices.");
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close();
    }
    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
    }
    sessionRef.current = null;
    setIsActive(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden p-6 flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className={`w-5 h-5 ${isActive ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
                Live Assistant
            </h2>
            <button onClick={stopSession} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
            </button>
        </div>

        <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <video 
                ref={videoRef} 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isVideoOn ? 'block' : 'hidden'}`} 
            />
            {!isVideoOn && (
                <div className="flex flex-col items-center justify-center gap-4">
                    <div 
                        className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center transition-all duration-75"
                        style={{ transform: `scale(${1 + volume/200})` }}
                    >
                        <div className="w-24 h-24 rounded-full bg-indigo-500/40 flex items-center justify-center">
                            <Mic className="w-10 h-10 text-indigo-200" />
                        </div>
                    </div>
                    <p className="text-gray-400 font-medium">{status}</p>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-full transition-all ${!isVideoOn ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            
            <button 
                onClick={stopSession}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors"
            >
                End Session
            </button>
        </div>

      </div>
    </div>
  );
};

export default LiveAssistant;
