
import React, { useState, useEffect, useRef } from 'react';
import { View, Interest, Currency, HiredService, Transaction, Property } from './types';
import Navigation from './components/Navigation';
import ChatBot from './components/ChatBot';
import Onboarding from './views/Onboarding';
import News from './views/News';
import Contents from './views/Contents';
import Store from './views/Store';
import RealEstate from './views/RealEstate';
import Services from './views/Services';
import Profile from './views/Profile';
import Wallet from './views/Wallet';
import KimbaInvest from './views/KimbaInvest';
import { getUserProfile, upsertUserProfile, syncHiredServices, syncTransactions, getProperties } from './services/supabaseService';

const EXCHANGE_RATE = 830; 

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Penthouse Luxo Talatona',
    type: 'Apartamento',
    status: 'Venda',
    price: 450000000,
    location: 'Talatona, Condomínio Dolce Vita',
    province: 'Luanda',
    area: 320,
    bedrooms: 4,
    bathrooms: 5,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    seller: 'KIMBA Imobiliária',
    verified: true,
    coordinates: { lat: -8.9167, lng: 13.1833 }
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.ONBOARDING);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('Kimbista');
  const [userEmail, setUserEmail] = useState<string>('');
  const [balance, setBalance] = useState<number>(0); 
  const [currency, setCurrency] = useState<Currency>('AOA');
  const [hiredServices, setHiredServices] = useState<HiredService[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [loadingProps, setLoadingProps] = useState(true);

  // Estados para Gesto Grab & Pull (Top Down)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    const initApp = async () => {
      const savedFavorites = localStorage.getItem('kimba_favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      const savedEmail = localStorage.getItem('kimba_email');
      
      if (savedEmail) {
        setUserEmail(savedEmail);
        const profile = await getUserProfile(savedEmail);
        if (profile) {
          setUserName(profile.name);
          setUserInterests(profile.interests || []);
          setBalance(profile.balance || 0);
          setCurrency(profile.currency || 'AOA');
          if (profile.favorites && profile.favorites.length > 0) setFavorites(profile.favorites);
          setView(View.NEWS);
          setIsSynced(true);
        } else {
          const savedName = localStorage.getItem('kimba_name');
          const savedInterests = localStorage.getItem('kimba_interests');
          if (savedName) setUserName(savedName);
          if (savedInterests) setUserInterests(JSON.parse(savedInterests));
          setView(View.NEWS);
        }
      }
      
      const data = await getProperties();
      setProperties(data && data.length > 0 ? data : MOCK_PROPERTIES);
      setLoadingProps(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (userEmail && isSynced) {
      upsertUserProfile({ email: userEmail, name: userName, interests: userInterests, balance: balance, currency: currency, favorites: favorites });
      syncHiredServices(userEmail, hiredServices);
      syncTransactions(userEmail, transactions);
    }
  }, [balance, hiredServices, transactions, userInterests, currency, favorites]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = "bg-black text-white transition-colors duration-500";
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = "bg-white text-black transition-colors duration-500";
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Lógica de Gesto Grab & Pull no Topo
  const handleTouchStart = (e: React.TouchEvent) => {
    if (view === View.ONBOARDING || view === View.INVEST) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;
    
    // Só permite puxar para baixo
    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const threshold = window.innerHeight * 0.25;
    
    if (dragOffset > threshold) {
      setView(View.INVEST);
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const formatPrice = (priceAOA: number) => {
    if (currency === 'USD') return `$ ${(priceAOA / EXCHANGE_RATE).toFixed(2)}`;
    return `Kz ${priceAOA.toLocaleString()}`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const newFavs = isFav ? prev.filter(favId => favId !== id) : [...prev, id];
      localStorage.setItem('kimba_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleOnboardingComplete = async (data: { name: string, email: string, interests: string[] }) => {
    setUserName(data.name);
    setUserEmail(data.email);
    setUserInterests(data.interests);
    localStorage.setItem('kimba_name', data.name);
    localStorage.setItem('kimba_email', data.email);
    localStorage.setItem('kimba_interests', JSON.stringify(data.interests));
    await upsertUserProfile({ email: data.email, name: data.name, interests: data.interests, balance: 0, currency: 'AOA', favorites: [] });
    setIsSynced(true);
    setView(View.NEWS);
  };

  const renderView = () => {
    switch (view) {
      case View.ONBOARDING: return <Onboarding onComplete={handleOnboardingComplete} />;
      case View.NEWS: return <News userInterests={userInterests} />;
      case View.CONTENTS: return <Contents formatPrice={formatPrice} />;
      case View.STORE: return <Store formatPrice={formatPrice} />;
      case View.INVEST: return <KimbaInvest formatPrice={formatPrice} />;
      case View.REAL_ESTATE: return <RealEstate formatPrice={formatPrice} properties={properties} setProperties={setProperties} loading={loadingProps} favorites={favorites} toggleFavorite={toggleFavorite} />;
      case View.SERVICES: return <Services balance={balance} handlePayment={() => true} formatPrice={formatPrice} hiredServices={hiredServices} onConfirmCompletion={() => {}} />;
      case View.WALLET: return <Wallet balance={balance} currency={currency} transactions={transactions} onDeposit={() => {}} onWithdraw={() => true} onBack={() => setView(View.PROFILE)} />;
      case View.PROFILE: return <Profile isDarkMode={isDarkMode} toggleTheme={toggleTheme} userName={userName} interests={userInterests} balance={balance} currency={currency} formatPrice={formatPrice} onCurrencyChange={(c) => setCurrency(c)} goToWallet={() => setView(View.WALLET)} favorites={favorites} allProperties={properties} toggleFavorite={toggleFavorite} resetApp={() => { localStorage.clear(); window.location.reload(); }} />;
      default: return <News userInterests={userInterests} />;
    }
  };

  const isInvest = view === View.INVEST;
  const pullThresholdReached = dragOffset > window.innerHeight * 0.25;

  return (
    <div className={`min-h-screen transition-all duration-700 overflow-hidden flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {view !== View.ONBOARDING && (
        <>
          <header className={`sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b shrink-0 ${isDarkMode ? 'bg-black/80 border-gray-900' : 'bg-white/80 border-gray-100'}`}>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl font-black tracking-tighter transition-colors duration-500 ${isInvest ? 'text-[#D4AF37]' : 'text-[#E41B17]'}`}>
                  KIMBA
                </h1>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1">
                {isInvest ? 'Wealth Management' : 'Conhecimento que gera movimento'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {isInvest && (
                <button 
                  onClick={() => setView(View.NEWS)}
                  className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
                >
                  Voltar
                </button>
              )}
              <button onClick={() => setView(View.PROFILE)} className={`w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden border hover:scale-105 active:scale-95 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                <span className={`text-sm font-black ${isInvest ? 'text-[#D4AF37]' : 'text-[#E41B17]'}`}>{userName[0]}</span>
              </button>
            </div>
          </header>

          {/* Manípulo Pull-Down Kimba Invest */}
          {!isInvest && view !== View.ONBOARDING && (
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full flex flex-col items-center py-2 cursor-grab active:cursor-grabbing z-[41] select-none"
            >
              <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#D4AF37] opacity-60 animate-heartbeat" />
              </div>
              <span className="text-[6px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1.5 transition-opacity opacity-40 group-hover:opacity-100">
                Puxar para Invest
              </span>
            </div>
          )}
        </>
      )}

      {/* Cortina Dourada de Arrastar */}
      {isDragging && (
        <div 
          className="fixed top-0 left-0 right-0 z-[100] pointer-events-none transition-all duration-75 flex flex-col items-center justify-end pb-12"
          style={{ 
            height: `${dragOffset}px`, 
            background: `linear-gradient(to bottom, #D4AF37 0%, #D4AF37DD 70%, #D4AF3700 100%)`,
            boxShadow: `0 10px 40px -10px #D4AF3755`
          }}
        >
          <div className={`px-6 py-2 rounded-full border-2 transition-all duration-300 flex items-center space-x-3 ${pullThresholdReached ? 'bg-black text-[#D4AF37] border-[#D4AF37] scale-110 shadow-2xl' : 'bg-white/20 text-white border-white/40'}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`${pullThresholdReached ? 'rotate-180' : ''} transition-transform`}><path d="m6 9 6 6 6-6"/></svg>
             <span className="text-[10px] font-black uppercase tracking-widest">
               {pullThresholdReached ? 'SOLTE PARA INVESTIR' : 'CONTINUE A PUXAR'}
             </span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 relative overflow-y-auto no-scrollbar transition-opacity duration-500">
        {renderView()}
      </main>

      {view !== View.ONBOARDING && (
        <>
          <Navigation currentView={view} setView={setView} />
          <ChatBot />
        </>
      )}

      {isInvest && (
        <button 
          onClick={() => setView(View.NEWS)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black text-[#D4AF37] border border-[#D4AF37]/30 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all animate-in slide-in-from-bottom-4"
        >
          SAIR DO MODO INVEST
        </button>
      )}
    </div>
  );
};

export default App;
