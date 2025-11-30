
import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateTextResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface ChatModuleProps {
  mode: 'EDUCATION' | 'FINANCE' | 'WRITER' | 'KNOWLEDGE';
  title: string;
  systemInstruction: string;
}

const ChatModule: React.FC<ChatModuleProps> = ({ mode, title, systemInstruction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        text: `Hello! I am your AI ${title.toLowerCase()}. How can I assist you today?`,
        timestamp: Date.now()
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1];
        setSelectedFile({
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      image: selectedFile?.data,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentFile = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const isFinance = mode === 'FINANCE';
      
      const responseText = await generateTextResponse(
        userMsg.text,
        systemInstruction,
        currentFile ? { data: currentFile.data, mimeType: currentFile.mimeType } : undefined,
        isFinance
      );

      let chartData = undefined;
      let finalText = responseText;

      if (isFinance) {
        try {
            const parsed = JSON.parse(responseText);
            if (parsed.data && Array.isArray(parsed.data)) {
                chartData = parsed.data;
                finalText = parsed.summary || parsed.title || "Here is the financial analysis.";
            }
        } catch (e) {
            finalText = responseText;
        }
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: finalText || "I processed that for you.",
        timestamp: Date.now(),
        chartData
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request.",
        isError: true,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          {mode === 'EDUCATION' && <span className="text-blue-400">🎓</span>}
          {mode === 'FINANCE' && <span className="text-green-400">📈</span>}
          {mode === 'WRITER' && <span className="text-purple-400">✍️</span>}
          {mode === 'KNOWLEDGE' && <span className="text-teal-400">🧠</span>}
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-100 rounded-bl-none'
            }`}>
              {msg.image && (
                 <div className="mb-2 text-xs opacity-70 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3"/> Image Attached
                 </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {msg.text}
              </div>
              
              {msg.chartData && (
                <div className="mt-4 w-full h-64 bg-slate-800/50 rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        {selectedFile && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg w-fit">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-300 max-w-[200px] truncate">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                </button>
            </div>
        )}
        <div className="flex gap-2">
           <label className="cursor-pointer p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-xl transition-colors">
              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*, application/pdf, text/plain" />
              <Upload className="w-5 h-5" />
           </label>
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder={mode === 'WRITER' ? "Describe the content you need..." : "Ask a question..."}
             className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 focus:outline-none focus:border-indigo-500 transition-colors"
           />
           <button 
             onClick={handleSend}
             disabled={isLoading || (!input && !selectedFile)}
             className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
           >
             <Send className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;
