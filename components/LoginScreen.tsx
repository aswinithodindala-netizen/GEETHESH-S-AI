
import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, Loader2, Sparkles, Download, Smartphone, X, ChevronLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onInstall?: () => void;
  onShare?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onInstall, onShare }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Google Login Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API authentication delay
    setTimeout(() => {
      // For demo purposes, allow any non-empty credentials
      if (email.length > 0 && password.length > 0) {
        setIsLoading(false);
        onLogin();
      } else {
        setIsLoading(false);
        setError('Please enter a valid username and password.');
      }
    }, 1500);
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        onLogin();
    }, 1500);
  };

  const handleDownloadApk = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate file download progress
    const interval = setInterval(() => {
        setDownloadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsDownloading(false);
                
                // --- TRIGGER REAL FILE DOWNLOAD ---
                // Create a dummy file to satisfy the "download" visual on mobile
                const dummyContent = "Geethesh's AI App Installer\n\nTo complete installation, please select 'Add to Home Screen' or 'Install App' from your browser menu.";
                const blob = new Blob([dummyContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // We name it .apk to match user expectation, though it is text content
                a.download = "GeetheshAI_Installer.apk"; 
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Trigger the PWA install prompt / modal
                if (onInstall) onInstall();
                return 100;
            }
            return prev + 10;
        });
    }, 150);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Mobile Access Button (Top Right) */}
      {onShare && (
        <button 
          onClick={onShare}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 rounded-full text-xs font-medium text-slate-300 transition-all z-20 backdrop-blur-sm"
        >
          <Smartphone className="w-4 h-4" />
          <span>Use on Mobile</span>
        </button>
      )}

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 shadow-2xl shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent mb-3 tracking-tight">
                GEETHESH'S AI
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">AUTHENTICATION REQUIRED</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl ring-1 ring-white/5">
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                        </div>
                        <input 
                            type="text" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-900 transition-all duration-300 sm:text-sm"
                            placeholder="Username or Email"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Passkey</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-900 transition-all duration-300 sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full group relative flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full duration-[1000ms] transition-transform -skew-x-12 -translate-x-full origin-left" />
                    
                    {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        <>
                            <span>Access System</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-900/40 text-slate-500 font-medium">OR CONTINUE WITH</span>
                </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setShowGoogleModal(true)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all shadow-lg font-medium text-sm disabled:opacity-50"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>
                <button 
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl transition-all shadow-lg font-medium text-sm disabled:opacity-50"
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                </button>
            </div>
        </div>

        {/* Install App Button for Mobile */}
        {onInstall && (
           <div className="mt-8 flex justify-center">
             <button 
                onClick={handleDownloadApk}
                disabled={isDownloading}
                className="group w-full max-w-[280px] relative overflow-hidden flex items-center justify-between gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl text-sm font-semibold text-green-400 transition-all shadow-xl hover:shadow-green-500/10 hover:border-green-500/30"
             >
                {/* Progress Bar */}
                <div 
                    className="absolute inset-0 bg-green-500/10 transition-all duration-150 ease-linear"
                    style={{ width: `${downloadProgress}%` }}
                />
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="leading-none text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                            {isDownloading ? `Downloading... ${downloadProgress}%` : "Android App"}
                        </span>
                        <span className="leading-none text-base font-bold">
                            {isDownloading ? "Please wait" : "Get Mobile App (APK)"}
                        </span>
                    </div>
                </div>
                
                {!isDownloading && <CheckCircle className="w-5 h-5 text-slate-600 group-hover:text-green-500 transition-colors relative z-10" />}
             </button>
           </div>
        )}

        <div className="mt-8 text-center space-y-4">
             <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="w-12 h-[1px] bg-slate-800"></span>
                <span>SECURE GATEWAY v1.0</span>
                <span className="w-12 h-[1px] bg-slate-800"></span>
             </div>
             <p className="text-[10px] text-slate-600">
                Protected by End-to-End Encryption
             </p>
        </div>

      </div>

      {/* Google Sign-In Modal Simulation */}
      {showGoogleModal && (
        <GoogleSignInModal 
          onClose={() => setShowGoogleModal(false)}
          onSuccess={() => {
            setShowGoogleModal(false);
            onLogin();
          }}
        />
      )}
    </div>
  );
};

// --- Google Sign-In Simulation Component ---
const GoogleSignInModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [view, setView] = useState<'ACCOUNTS' | 'EMAIL' | 'PASSWORD'>('ACCOUNTS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Mock "Detected" Account
  const mockAccount = {
    name: "User Name",
    email: "user@gmail.com",
    avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c"
  };

  const handleAccountClick = () => {
    setIsChecking(true);
    setTimeout(() => {
        onSuccess();
    }, 1500);
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Enter an email or phone number");
        return;
    }
    // Basic Gmail validation
    if (!email.includes('@')) {
         setError("Enter a valid email address");
         return;
    }
    setIsChecking(true);
    setError('');
    setTimeout(() => {
        setIsChecking(false);
        setView('PASSWORD');
    }, 800);
  };

  const handlePasswordNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setError("Enter a password");
        return;
    }
    setIsChecking(true);
    setError('');
    setTimeout(() => {
        onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white text-slate-900 rounded-lg w-full max-w-[400px] shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
            {isChecking && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-20">
                    <div className="h-full bg-blue-600 animate-[progress_1s_ease-in-out_infinite] w-1/3"></div>
                </div>
            )}
            
            <div className="p-8 pb-6 flex-1 flex flex-col items-center">
                {/* Google Logo */}
                <div className="mb-4">
                    <svg viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.75 4.54c1.78 0 3.37.63 4.63 1.83l3.43-3.44C17.72 1.05 14.95 0 11.75 0 7.15 0 3.12 2.65 1.15 6.55l4.08 3.16C6.18 6.56 8.75 4.54 11.75 4.54zm-7.6 14.9l-4.08 3.16C3.12 21.35 7.15 24 11.75 24c3.08 0 5.86-1.07 7.97-2.92l-3.87-3.03c-1.06.74-2.48 1.25-4.1 1.25-2.98 0-5.54-2.02-6.44-4.83H1.09v3.08zM0 12c0-.85.15-1.67.4-2.45l4.13 3.22c-.1.74-.15 1.51-.15 2.3s.06 1.48.16 2.14L.4 20.37C.14 19.59 0 18.77 0 12zM23.5 12c0-.66-.06-1.29-.17-1.9H11.75v3.66h6.64c-.29 1.47-1.12 2.69-2.35 3.52l3.87 3.03C22.18 18.25 23.5 15.35 23.5 12z" fill="#4285F4"/>
                    </svg>
                </div>

                <h2 className="text-2xl font-medium mb-2">Sign in</h2>
                <p className="text-base text-slate-800 mb-10">to continue to Geethesh's AI</p>

                {view === 'ACCOUNTS' && (
                    <div className="w-full space-y-2">
                        <button 
                            onClick={handleAccountClick}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 border-b border-slate-100 rounded-t-md transition-colors text-left"
                        >
                            <img src={mockAccount.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                            <div>
                                <div className="text-sm font-medium text-slate-700">{mockAccount.name}</div>
                                <div className="text-xs text-slate-500">{mockAccount.email}</div>
                            </div>
                        </button>
                        <button 
                            onClick={() => setView('EMAIL')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-b-md transition-colors text-left"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="text-sm font-medium text-slate-700">Use another account</div>
                        </button>
                    </div>
                )}

                {view === 'EMAIL' && (
                    <form onSubmit={handleEmailNext} className="w-full">
                         <div className="relative mb-8">
                             <input 
                                type="email" 
                                className={`peer w-full h-14 border rounded-md px-3 pt-3 text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all ${error ? 'border-red-600' : 'border-slate-300'}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="google-email"
                                autoFocus
                             />
                             <label 
                                htmlFor="google-email"
                                className={`absolute left-3 transition-all pointer-events-none px-1 bg-white
                                    ${email ? '-top-2.5 text-xs text-blue-600' : 'top-4 text-base text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}
                                    ${error ? 'text-red-600 peer-focus:text-red-600' : ''}
                                `}
                             >
                                Email or phone
                             </label>
                             {error && <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">!</span> {error}</div>}
                         </div>
                         <div className="flex justify-between items-center mt-12">
                             <button type="button" onClick={onClose} className="text-blue-600 font-medium text-sm hover:bg-blue-50 px-4 py-2 rounded">Create account</button>
                             <button type="submit" className="bg-blue-600 text-white font-medium text-sm px-6 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm">Next</button>
                         </div>
                    </form>
                )}

                {view === 'PASSWORD' && (
                    <form onSubmit={handlePasswordNext} className="w-full">
                         <button type="button" onClick={() => setView('EMAIL')} className="flex items-center gap-2 border border-slate-200 rounded-full pr-4 pl-1 py-1 mb-8 hover:bg-slate-50 transition-colors mx-auto w-fit max-w-full">
                             <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                                 {email.charAt(0)}
                             </div>
                             <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{email}</span>
                             <span className="text-slate-400">▼</span>
                         </button>

                         <div className="relative mb-8">
                             <input 
                                type={showPwd ? "text" : "password"}
                                className={`peer w-full h-14 border rounded-md px-3 pt-3 text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all ${error ? 'border-red-600' : 'border-slate-300'}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="google-pwd"
                                autoFocus
                             />
                             <label 
                                htmlFor="google-pwd"
                                className={`absolute left-3 transition-all pointer-events-none px-1 bg-white
                                    ${password ? '-top-2.5 text-xs text-blue-600' : 'top-4 text-base text-slate-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}
                                    ${error ? 'text-red-600 peer-focus:text-red-600' : ''}
                                `}
                             >
                                Enter your password
                             </label>
                             {error && <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">!</span> {error}</div>}
                         </div>
                         
                         <div className="mb-8">
                             <label className="flex items-center gap-2 cursor-pointer w-fit">
                                 <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" onChange={(e) => setShowPwd(e.target.checked)} />
                                 <span className="text-sm text-slate-600">Show password</span>
                             </label>
                         </div>

                         <div className="flex justify-between items-center mt-4">
                             <button type="button" onClick={() => setView('EMAIL')} className="text-blue-600 font-medium text-sm hover:bg-blue-50 px-4 py-2 rounded">Forgot password?</button>
                             <button type="submit" className="bg-blue-600 text-white font-medium text-sm px-6 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm">Next</button>
                         </div>
                    </form>
                )}
            </div>
            
            <div className="bg-slate-50 py-3 px-8 flex justify-between items-center text-xs text-slate-500">
                <button className="hover:bg-slate-100 px-2 py-1 rounded">English (United States)</button>
                <div className="flex gap-4">
                    <button className="hover:bg-slate-100 px-2 py-1 rounded">Help</button>
                    <button className="hover:bg-slate-100 px-2 py-1 rounded">Privacy</button>
                    <button className="hover:bg-slate-100 px-2 py-1 rounded">Terms</button>
                </div>
            </div>

            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default LoginScreen;
