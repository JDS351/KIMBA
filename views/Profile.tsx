
import React, { useState } from 'react';
import { INTERESTS } from '../constants';
import { Currency, Property } from '../types';

interface ProfileProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  userName: string;
  userEmail?: string;
  interests: string[];
  balance: number;
  currency: Currency;
  formatPrice: (p: number) => string;
  onCurrencyChange: (c: Currency) => void;
  onUpdateName: (newName: string) => void;
  goToWallet: () => void;
  favorites: string[];
  allProperties: Property[];
  toggleFavorite: (id: string) => void;
  resetApp: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  isDarkMode, 
  toggleTheme, 
  userName, 
  userEmail,
  interests, 
  balance, 
  currency, 
  formatPrice, 
  onCurrencyChange,
  onUpdateName,
  goToWallet,
  favorites,
  allProperties,
  toggleFavorite,
  resetApp 
}) => {
  const favoriteProperties = allProperties.filter(p => favorites.includes(p.id));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    onUpdateName(tempName);
    setIsEditModalOpen(false);
  };

  return (
    <div className="py-10 animate-in slide-in-from-bottom-4 duration-500 space-y-12 pb-24">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 px-2">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-[#E41B17] to-[#FFCC00] flex items-center justify-center text-white text-3xl font-black shadow-xl group-hover:scale-105 transition-transform duration-500">
            {userName[0]}
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute -bottom-1 -right-1 bg-white dark:bg-black p-3 rounded-full border-2 border-gray-50 dark:border-gray-900 shadow-xl active:scale-90 transition-all text-[#E41B17]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-black tracking-tighter leading-none">{userName}</h2>
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Utilizador Verificado IA</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div 
        onClick={goToWallet}
        className="bg-black dark:bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-2xl shadow-[#E41B17]/10"
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-2">Total Disponível</p>
            <h3 className="text-5xl font-black tracking-tighter">
              {formatPrice(balance)}
            </h3>
          </div>
          <div className="mt-8 flex items-center space-x-3 text-[10px] font-black text-[#FFCC00] uppercase tracking-widest">
             <div className="w-8 h-8 rounded-full bg-[#FFCC00]/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </div>
             <span>Aceder à Carteira</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E41B17]/10 blur-3xl -mr-16 -mt-16 opacity-30" />
      </div>

      {/* Edit Profile Modal (Panel) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 space-y-10 shadow-2xl animate-in slide-in-from-bottom-10 border border-white/5">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Gestão de Perfil</h3>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Controlo de Identidade Digital</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <div className="space-y-6">
                 {/* Current Account Info */}
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Informações de Registo</p>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Principal</p>
                          <p className="text-[11px] font-bold text-black dark:text-white truncate">{userEmail}</p>
                       </div>
                       <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status de Identidade</p>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Documento Verificado</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Editar Nome Público</label>
                    <input 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all shadow-sm"
                      placeholder="Novo nome"
                    />
                 </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 font-black rounded-full uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveName}
                  className="flex-1 py-5 bg-[#E41B17] text-white font-black rounded-full uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Interests Summary */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Especialidades Selecionadas</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {interests.map(id => (
            <span key={id} className="bg-gray-100 dark:bg-gray-900 px-6 py-3 rounded-full text-[10px] font-black tracking-widest uppercase text-black dark:text-white border border-gray-100 dark:border-gray-800">
              {INTERESTS.find(i => i.id === id)?.label}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-8 space-y-4">
        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
          <span className="font-black text-xs uppercase tracking-widest">Interface: {isDarkMode ? 'Dark' : 'Light'}</span>
          <button 
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-[#E41B17]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isDarkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        <button 
          onClick={resetApp}
          className="w-full py-6 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 text-[#E41B17] font-black tracking-[0.2em] text-[10px] uppercase border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all"
        >
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default Profile;
