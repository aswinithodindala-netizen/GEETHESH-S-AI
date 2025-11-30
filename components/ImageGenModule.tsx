
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Image as ImageIcon, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ImageGenModuleProps {
  // No props needed now
}

const ImageGenModule: React.FC<ImageGenModuleProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);
    try {
      const url = await generateImage(prompt, aspectRatio);
      setGeneratedImage(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
       <div className="p-4 bg-slate-800 border-b border-slate-700">
         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-pink-400">🎨</span>
            Thumbnail Creator
         </h2>
       </div>

       <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Controls */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Describe your thumbnail</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic city with neon lights, cyberpunk style, high detail..."
                        className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {['1:1', '16:9', '4:3', '3:4'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    aspectRatio === ratio 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {isLoading ? 'Dreaming...' : 'Generate Thumbnail'}
                </button>
            </div>

            {/* Preview */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative group min-h-[300px]">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="text-slate-500 animate-pulse">Creating masterpiece...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center max-w-sm">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-red-300">{error}</p>
                    </div>
                ) : generatedImage ? (
                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                        <img 
                            src={generatedImage} 
                            alt="Generated" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <a 
                            href={generatedImage} 
                            download={`thumbnail-${Date.now()}.png`}
                            className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Your creation will appear here</p>
                    </div>
                )}
            </div>
          </div>
       </div>
    </div>
  );
};

export default ImageGenModule;
