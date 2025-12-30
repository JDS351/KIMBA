
import React from 'react';
import { INTERESTS } from '../constants';
import { Currency, Property } from '../types';

interface ProfileProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  userName: string;
  interests: string[];
  balance: number;
  currency: Currency;
  formatPrice: (p: number) => string;
  onCurrencyChange: (c: Currency) => void;
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
  interests, 
  balance, 
  currency, 
  formatPrice, 
  onCurrencyChange,
  goToWallet,
  favorites,
  allProperties,
  toggleFavorite,
  resetApp 
}) => {
  const favoriteProperties = allProperties.filter(p => favorites.includes(p.id));

  return (
    <div className="py-10 animate-in slide-in-from-bottom-4 duration-500 space-y-12 pb-24">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 px-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-[#E41B17] to-[#FFCC00] flex items-center justify-center text-white text-3xl font-black shadow-xl">
            {userName[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 bg-white dark:bg-black p-2.5 rounded-full border-2 border-gray-50 dark:border-gray-900 shadow-lg active:scale-90 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter leading-none">{userName}</h2>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-2">Nível Kimbista: Elite</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div 
        onClick={goToWallet}
        className="bg-black dark:bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-2xl shadow-[#E41B17]/10"
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-2">Conta Corrente Digital</p>
            <h3 className="text-5xl font-black tracking-tighter">
              {formatPrice(balance)}
            </h3>
          </div>
          <div className="mt-8 flex items-center space-x-3 text-[10px] font-black text-[#FFCC00] uppercase tracking-widest">
             <div className="w-8 h-8 rounded-full bg-[#FFCC00]/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </div>
             <span>Gerir Carteira & Levantamentos</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E41B17]/10 blur-3xl -mr-16 -mt-16" />
      </div>

      {/* Favorites Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Meus Imóveis Favoritos</h3>
          <span className="text-[10px] font-black text-[#E41B17] uppercase bg-red-50 dark:bg-red-950/20 px-4 py-1.5 rounded-full">{favoriteProperties.length} Itens</span>
        </div>
        
        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {favoriteProperties.map(prop => (
              <div key={prop.id} className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center p-4 space-x-6 animate-in fade-in slide-in-from-left-4 duration-300 transition-all group">
                <div className="relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden">
                  <img src={prop.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[8px] font-black text-[#E41B17] uppercase tracking-tighter">{prop.type}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{prop.location.split(',')[0]}</span>
                  </div>
                  <h4 className="text-sm font-black truncate leading-tight group-hover:text-[#E41B17] transition-colors">{prop.title}</h4>
                  <p className="text-[#E41B17] font-black text-xs mt-1.5">{formatPrice(prop.price)}</p>
                </div>
                <button 
                  onClick={() => toggleFavorite(prop.id)}
                  className="p-4 text-[#E41B17] hover:bg-white dark:hover:bg-black rounded-full transition-all shadow-sm active:scale-75"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] bg-gray-50/50 dark:bg-gray-900/10 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center text-gray-200">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">A tua seleção de sonho aparecerá aqui.</p>
          </div>
        )}
      </div>

      {/* Interests Summary */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Meus Domínios Técnicos</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {interests.map(id => {
            const label = INTERESTS.find(i => i.id === id)?.label;
            return (
              <span key={id} className="bg-gray-100 dark:bg-gray-900 px-6 py-3 rounded-full text-[10px] font-black tracking-widest uppercase text-black dark:text-white border border-gray-100 dark:border-gray-800">
                {label}
              </span>
            );
          })}
          <button 
            onClick={resetApp}
            className="w-10 h-10 bg-[#E41B17]/5 text-[#E41B17] flex items-center justify-center rounded-full active:scale-90 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Definições Avançadas</h3>
        <div className="space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-[2rem] transition-colors border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
                 {isDarkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                 ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                 )}
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Aparência: {isDarkMode ? 'Escuro' : 'Claro'}</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-[#E41B17]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isDarkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-[2rem] transition-colors border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center font-black text-base shadow-sm">
                $
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Moeda do Sistema</span>
            </div>
            <div className="flex bg-white dark:bg-black p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
               <button 
                onClick={() => onCurrencyChange('AOA')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currency === 'AOA' ? 'bg-[#E41B17] text-white shadow-lg' : 'text-gray-400'}`}
               >
                 AOA
               </button>
               <button 
                onClick={() => onCurrencyChange('USD')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currency === 'USD' ? 'bg-[#E41B17] text-white shadow-lg' : 'text-gray-400'}`}
               >
                 USD
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <button 
          onClick={resetApp}
          className="w-full py-6 rounded-[2rem] bg-gray-50 dark:bg-gray-900 text-[#E41B17] font-black tracking-[0.2em] text-[10px] uppercase active:scale-95 transition-all border border-gray-100 dark:border-gray-800"
        >
          Sair da Conta
        </button>
      </div>

      <div className="text-center space-y-2 pb-12">
         <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Versão Estável 2.0.1 (Luanda Build)</p>
         <p className="text-[9px] font-black text-[#E41B17] tracking-widest animate-pulse">KIMBA — ANGOLA PRIDE 🇦🇴</p>
      </div>
    </div>
  );
};

export default Profile;
