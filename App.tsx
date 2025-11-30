
import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import FeatureCard from './components/FeatureCard';
import ChatModule from './components/ChatModule';
import ImageGenModule from './components/ImageGenModule';
import LiveAssistant from './components/LiveAssistant';
import LoginScreen from './components/LoginScreen';
import ShareModal from './components/ShareModal';
import { 
  BookOpen, 
  TrendingUp, 
  Image as ImageIcon, 
  FileEdit, 
  Mic, 
  Home, 
  Menu,
  LogOut,
  Globe,
  Download,
  X,
  Share2,
  CheckCircle,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    // PWA Install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        setShowInstallModal(true);
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Home', icon: Home },
    { id: ViewState.KNOWLEDGE, label: 'Knowledge Base', icon: Globe },
    { id: ViewState.EDUCATION, label: 'Education Hub', icon: BookOpen },
    { id: ViewState.FINANCE, label: 'Financial Advisor', icon: TrendingUp },
    { id: ViewState.THUMBNAIL, label: 'Thumbnail Creator', icon: ImageIcon },
    { id: ViewState.WRITER, label: 'Writer & PDF Tool', icon: FileEdit },
    { id: ViewState.VOICE_ASSISTANT, label: 'Live Assistant', icon: Mic },
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView(ViewState.DASHBOARD);
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.EDUCATION:
        return <ChatModule mode="EDUCATION" title="Education Hub" systemInstruction="You are an expert tutor specializing in all academic subjects. Provide clear, concise, and educational explanations suitable for students. Use formatting to make learning easier." />;
      case ViewState.FINANCE:
        return <ChatModule mode="FINANCE" title="Financial Advisor" systemInstruction="You are a professional financial advisor. Provide sound financial advice, budgeting tips, and market analysis. Always output data for charts in JSON format when relevant, following the schema: { title: string, data: [{ name: string, value: number }], summary: string }." />;
      case ViewState.WRITER:
        return <ChatModule mode="WRITER" title="Content Writer & PDF Tool" systemInstruction="You are a professional content writer and editor. Help users write articles, emails, stories, and correct grammar. You can also analyze uploaded text or PDF content if provided." />;
      case ViewState.KNOWLEDGE:
        return <ChatModule mode="KNOWLEDGE" title="Knowledge Base" systemInstruction="You are a knowledgeable assistant with access to a vast database of facts and information. Answer questions accurately and provide sources where possible." />;
      case ViewState.THUMBNAIL:
        return <ImageGenModule />;
      case ViewState.VOICE_ASSISTANT:
        return <LiveAssistant onClose={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.DASHBOARD:
      default:
        return (
          <div className="p-6 h-full overflow-y-auto">
             <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
               <p className="text-slate-400">Explore your personal AI tools below.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                <FeatureCard 
                  title="Knowledge Base" 
                  description="Ask anything and get accurate, fact-based answers instantly." 
                  icon={Globe} 
                  onClick={() => setView(ViewState.KNOWLEDGE)}
                  color="from-teal-500 to-emerald-600"
                />
                <FeatureCard 
                  title="Education Hub" 
                  description="Get help with homework, learn new concepts, and master any subject." 
                  icon={BookOpen} 
                  onClick={() => setView(ViewState.EDUCATION)}
                  color="from-blue-500 to-indigo-600"
                />
                <FeatureCard 
                  title="Financial Advisor" 
                  description="Plan your budget, analyze investments, and get financial insights." 
                  icon={TrendingUp} 
                  onClick={() => setView(ViewState.FINANCE)}
                  color="from-green-500 to-emerald-600"
                />
                <FeatureCard 
                  title="Thumbnail Creator" 
                  description="Generate stunning 3D thumbnails and artwork for your content." 
                  icon={ImageIcon} 
                  onClick={() => setView(ViewState.THUMBNAIL)}
                  color="from-pink-500 to-rose-600"
                />
                <FeatureCard 
                  title="Writer & PDF Tool" 
                  description="Generate blogs, stories, emails, and summarize PDF documents." 
                  icon={FileEdit} 
                  onClick={() => setView(ViewState.WRITER)}
                  color="from-purple-500 to-violet-600"
                />
                <FeatureCard 
                  title="Live Assistant" 
                  description="Have real-time voice and video conversations with AI." 
                  icon={Mic} 
                  onClick={() => setView(ViewState.VOICE_ASSISTANT)}
                  color="from-orange-500 to-red-600"
                />
             </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen 
            onLogin={() => setIsAuthenticated(true)} 
            onInstall={handleInstallClick}
            onShare={() => setShowShareModal(true)}
           />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <img src="https://cdn-icons-png.flaticon.com/512/12222/12222560.png" alt="Logo" className="w-10 h-10" />
           <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
             GEETHESH'S AI
           </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                view === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${view === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           {/* Full Access Badge */}
           <div className="p-3 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-indigo-500 rounded-lg">
                   <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Full Access Active</span>
              </div>
              <p className="text-[10px] text-indigo-200 ml-7">
                 All features unlocked
              </p>
           </div>

           <button 
             onClick={() => setShowShareModal(true)}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
           >
             <Share2 className="w-5 h-5" />
             <span className="font-medium">Share App</span>
           </button>
           
           <button 
            onClick={handleInstallClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-green-400 rounded-xl transition-colors"
           >
            <Download className="w-5 h-5" />
            <span className="font-medium">Get Android App</span>
           </button>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors"
           >
             <LogOut className="w-5 h-5" />
             <span className="font-medium">Sign Out</span>
           </button>
           <div className="pt-2 text-center">
             <p className="text-[10px] text-slate-600 font-mono">GEETHESH 1.0</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full lg:w-auto overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400">
               <Menu className="w-6 h-6" />
             </button>
             <span className="font-bold text-white">
                {navItems.find(i => i.id === view)?.label}
             </span>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/12222/12222560.png" alt="Logo" className="w-8 h-8" />
        </header>

        {/* Desktop Header Content (hidden on mobile mostly, except inside dashboard) */}
        <div className="flex-1 overflow-hidden relative p-4 lg:p-6">
           {renderContent()}
        </div>
      </main>

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowInstallModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Download className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Install Mobile App</h3>
               <p className="text-slate-400 text-sm mb-6">
                 Install <strong>Geethesh's AI</strong> on your Android device (APK-like experience):
               </p>
               <ol className="text-left text-sm text-slate-300 space-y-3 bg-slate-800/50 p-4 rounded-xl mb-6">
                 <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">1</span>
                    Tap the browser menu (3 dots)
                 </li>
                 <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">2</span>
                    Select "Install App" or "Add to Home Screen"
                 </li>
               </ol>
               <button 
                 onClick={() => setShowInstallModal(false)}
                 className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
               >
                 Got it
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
          <ShareModal onClose={() => setShowShareModal(false)} />
      )}

    </div>
  );
};

export default App;
