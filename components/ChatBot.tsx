
import React, { useState, useRef, useEffect } from 'react';
import { askKimbaAI } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: 'Olá, Kimbista! Sou o KIMBA AI. Como posso ajudar o seu movimento hoje?' }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { 
      role: 'user', 
      parts: [{ text: input }, ...(selectedImage ? [{ inlineData: selectedImage }] : [])] 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await askKimbaAI(messages, input, currentImg || undefined);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Dificuldades técnicas, kimbista. Tente novamente em breve.' }] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-[60] w-14 h-14 bg-[#E41B17] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        {loading && <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-36 top-20 md:left-auto md:right-6 md:w-96 bg-white dark:bg-black rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-900 z-[60] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center bg-black dark:bg-gray-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#E41B17] rounded-xl flex items-center justify-center font-black">K</div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">KIMBA AI</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold text-gray-400">PENSAMENTO PRO ATIVO</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                }`}>
                  {m.parts.map((p, pi) => (
                    <div key={pi}>
                      {p.text && <p className="whitespace-pre-wrap">{p.text}</p>}
                      {p.inlineData && <img src={`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`} className="mt-2 rounded-xl w-full" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-3xl space-y-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[#E41B17] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#E41B17] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#E41B17] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">KIMBA está a pensar...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-black space-y-4">
            {selectedImage && (
              <div className="relative inline-block">
                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-16 h-16 rounded-xl object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao KIMBA..."
                className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 text-xs outline-none shadow-sm dark:text-white"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="p-3 bg-[#E41B17] text-white rounded-2xl shadow-lg active:scale-90 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
