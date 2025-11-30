
import React, { useState, useRef, useEffect } from 'react';
import { generateMusic, findYoutubeVideo } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import { Play, Square, Loader2, Music, Search, Radio, Disc, Mic2, ListMusic, Trash2, Plus } from 'lucide-react';

// Initial Playlist Data
const INITIAL_PLAYLIST = [
  { title: "Naatu Naatu - RRR", videoId: "OsU0CGZoV8E" },
  { title: "Samajavaragamana - Ala Vaikunthapurramuloo", videoId: "s_2sJ_4_3sY" },
  { title: "Inkem Inkem Inkem Kaavaale - Geetha Govindam", videoId: "V_Lp106sVgw" },
  { title: "Butta Bomma - Ala Vaikunthapurramuloo", videoId: "2lAe1cqCOXo" },
  { title: "Oo Antava Mava - Pushpa", videoId: "8ZygpG0k4a4" },
  { title: "Ramuloo Ramulaa - Ala Vaikunthapurramuloo", videoId: "bMrbZ6_I8sk" },
  { title: "Saami Saami - Pushpa", videoId: "H3NIDTz2tcc" },
  { title: "Vachinde - Fidaa", videoId: "s3G9y8s38kE" },
  { title: "Seeti Maar - DJ", videoId: "K63c5u5_Ycs" },
  { title: "Srivalli - Pushpa", videoId: "hcMzwMrr1tE" },
];

interface Song {
  title: string;
  videoId: string;
}

const MusicModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'PLAYER'>('PLAYER');
  
  // Generator State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingGen, setIsPlayingGen] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  
  // Player State
  const [playlist, setPlaylist] = useState<Song[]>(INITIAL_PLAYLIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(INITIAL_PLAYLIST[0].videoId);
  const [currentTrackName, setCurrentTrackName] = useState<string>(INITIAL_PLAYLIST[0].title);

  // Audio Context (Generator)
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // FIX: Do not force sampleRate in constructor. Use default system rate to support all devices (especially Android).
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop audio when tab changes
  useEffect(() => {
    stopAudio();
  }, [activeTab]);

  // --- GENERATOR LOGIC ---

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlayingGen(false);
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current!.getByteFrequencyData(dataArray);
        ctx.fillStyle = 'rgb(15, 23, 42)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#ec4899');
            gradient.addColorStop(1, '#8b5cf6');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);
            x += barWidth + 1;
        }
    };
    draw();
  };

  const playGenAudio = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    stopAudio();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    source.connect(analyser);
    analyser.connect(audioContextRef.current.destination);
    sourceRef.current = source;
    source.start(0);
    setIsPlayingGen(true);
    drawVisualizer();
    source.onended = () => {
        setIsPlayingGen(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGenError(null);
    stopAudio();
    audioBufferRef.current = null;
    try {
      const result = await generateMusic(prompt);
      const rawBytes = decode(result.data);
      if (audioContextRef.current) {
          // Decode data into a buffer. The buffer will effectively be 24kHz (as passed here),
          // but the context can be running at 48kHz. The node handles resampling automatically.
          const buffer = await decodeAudioData(rawBytes, audioContextRef.current, 24000, 1);
          audioBufferRef.current = buffer;
          playGenAudio();
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "Failed to generate audio.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PLAYER LOGIC ---

  const handleSearchSong = async () => {
    if(!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await findYoutubeVideo(searchQuery);
      if(result && result.videoId) {
        // Set current song
        setCurrentVideoId(result.videoId);
        setCurrentTrackName(result.title);
        
        // Add to playlist if it's not already there
        setPlaylist(prev => {
            const exists = prev.some(s => s.videoId === result.videoId);
            if (!exists) {
                return [{ title: result.title, videoId: result.videoId }, ...prev];
            }
            return prev;
        });
        setSearchQuery(''); // Clear search box for cleaner UX
      } else {
        alert("Could not find a video for this song. Please try a different query.");
      }
    } catch(e) {
      console.error(e);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeFromPlaylist = (e: React.MouseEvent, videoIdToRem: string) => {
    e.stopPropagation(); // Prevent playing the song when clicking delete
    setPlaylist(prev => prev.filter(s => s.videoId !== videoIdToRem));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Header / Tabs */}
        <div className="p-0 bg-slate-800 border-b border-slate-700 flex flex-col md:flex-row items-center justify-between">
            <div className="p-4 flex items-center gap-2">
                <span className="text-pink-400 text-xl">🎵</span>
                <h2 className="text-lg font-semibold text-white">Music Hub</h2>
            </div>
            <div className="flex w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('PLAYER')}
                  className={`flex-1 md:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'PLAYER' ? 'bg-slate-700 text-white border-b-2 border-pink-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  <Disc className="w-4 h-4" />
                  Music Player
                </button>
                <button 
                  onClick={() => setActiveTab('GENERATOR')}
                  className={`flex-1 md:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'GENERATOR' ? 'bg-slate-700 text-white border-b-2 border-pink-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  <Mic2 className="w-4 h-4" />
                  AI Voice Generator
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'PLAYER' ? (
             <div className="h-full flex flex-col lg:flex-row">
                {/* Main Player Area */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                    {/* Search */}
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSong()}
                            placeholder="Search any song to add & play..." 
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
                          />
                          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                       </div>
                       <button 
                         onClick={handleSearchSong}
                         disabled={isSearching}
                         className="px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                       >
                         {isSearching ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Plus className="w-5 h-5"/> Play</>}
                       </button>
                    </div>

                    {/* Video Player */}
                    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative ring-1 ring-white/10">
                        {currentVideoId ? (
                           <iframe 
                             key={currentVideoId}
                             width="100%" 
                             height="100%" 
                             src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`} 
                             title="YouTube video player" 
                             frameBorder="0" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                           ></iframe>
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-slate-600">
                              <Radio className="w-16 h-16 mb-4 opacity-50"/>
                              <p>Select a song to play</p>
                           </div>
                        )}
                    </div>
                    
                    {currentTrackName && (
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-between">
                           <div>
                               <h3 className="text-white font-semibold flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                 Now Playing
                               </h3>
                               <p className="text-pink-400 mt-1 font-medium text-lg">{currentTrackName}</p>
                           </div>
                           <Disc className="w-10 h-10 text-slate-700 animate-spin-slow" />
                        </div>
                    )}
                </div>

                {/* Playlist Sidebar */}
                <div className="w-full lg:w-96 bg-slate-800/30 border-l border-slate-700 flex flex-col h-[400px] lg:h-full">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                        <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                           <ListMusic className="w-4 h-4 text-pink-500" /> Current Playlist
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                       {playlist.length === 0 && (
                           <div className="text-center p-8 text-slate-500 text-sm">
                               Playlist is empty. Search to add songs!
                           </div>
                       )}
                       {playlist.map((song, idx) => (
                          <div 
                            key={`${song.videoId}-${idx}`}
                            className={`group w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 relative cursor-pointer ${currentVideoId === song.videoId ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'hover:bg-slate-700 text-slate-300'}`}
                            onClick={() => {
                                setCurrentVideoId(song.videoId);
                                setCurrentTrackName(song.title);
                            }}
                          >
                             <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${currentVideoId === song.videoId ? 'bg-white/20' : 'bg-slate-800 text-slate-500'}`}>
                                {idx + 1}
                             </span>
                             <div className="flex-1 min-w-0 pr-6">
                                <div className="font-medium truncate text-sm">{song.title}</div>
                             </div>
                             
                             {currentVideoId === song.videoId && <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0"></div>}
                             
                             <button 
                                onClick={(e) => removeFromPlaylist(e, song.videoId)}
                                className={`absolute right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${currentVideoId === song.videoId ? 'text-pink-200 hover:bg-pink-700' : 'text-slate-400 hover:bg-slate-600 hover:text-red-400'}`}
                                title="Remove from playlist"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                </div>
             </div>
          ) : (
            <div className="h-full p-8 flex flex-col items-center justify-center gap-8 overflow-y-auto">
                {/* Visualizer Area */}
                <div className="w-full max-w-2xl aspect-video bg-black rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative group">
                    <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={450} 
                        className="w-full h-full object-cover opacity-80"
                    />
                    {!isPlayingGen && !isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Music className="w-24 h-24 text-slate-700" />
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                            <Loader2 className="w-16 h-16 text-pink-500 animate-spin mb-4" />
                            <p className="text-white font-medium animate-pulse">Generating audio...</p>
                        </div>
                    )}
                    {genError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-6 text-center">
                            <p className="text-red-400 font-medium">{genError}</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="w-full max-w-2xl space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter text to convert to speech..."
                            className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            Generate
                        </button>
                    </div>
                    
                    {audioBufferRef.current && (
                        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <button 
                                onClick={playGenAudio}
                                className={`p-4 rounded-full ${isPlayingGen ? 'bg-slate-700 text-slate-400' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'}`}
                            >
                                <Play className="w-6 h-6 fill-current" />
                            </button>
                            <button 
                                onClick={stopAudio}
                                className={`p-4 rounded-full ${!isPlayingGen ? 'bg-slate-700 text-slate-400' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'}`}
                            >
                                <Square className="w-6 h-6 fill-current" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default MusicModule;
