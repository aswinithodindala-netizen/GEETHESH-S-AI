
import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, AlertTriangle, Share2 } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const shareText = `Check out Geethesh's AI: ${url}`;

  const handleCopy = () => {
    // Copy the branded text + URL
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Geethesh's AI",
          text: "Check out Geethesh's AI - Your Personal Intelligence Hub",
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
        // Fallback to copy if native share not supported
        handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Get Mobile App</h3>
          <p className="text-slate-400 text-sm mb-6">
            Scan this code to get the <strong>App Link</strong> for Android.
          </p>

          <div className="p-4 bg-white rounded-xl mb-6 shadow-inner relative">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`} 
              alt="QR Code" 
              className="w-40 h-40 mix-blend-multiply"
            />
          </div>

          <div className="w-full space-y-3">
             {/* Native Share Button (Preferred on Mobile) */}
             <button 
                onClick={handleNativeShare}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
             >
                <Share2 className="w-4 h-4" />
                Share App Link
             </button>

             {/* Manual Copy Input */}
             <div className="w-full relative">
                <input 
                type="text" 
                readOnly 
                value={shareText}
                className="w-full bg-slate-950 border border-slate-700 text-slate-400 text-xs rounded-lg pl-3 pr-10 py-3 focus:outline-none"
                />
                <button 
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-800 rounded-md transition-colors"
                >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
             </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-left mt-4">
            <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-200/80">
                <strong>Install as APK:</strong> Open this link in Chrome on Android, tap the menu (3 dots), and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
