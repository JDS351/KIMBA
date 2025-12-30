
import React, { useMemo } from 'react';
import { View } from '../types';
import { Icons } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const hasGlobalUnread = useMemo(() => {
    const savedNotifs = localStorage.getItem('kimba_notif_settings');
    if (savedNotifs) {
      const settings = JSON.parse(savedNotifs);
      return Object.values(settings).some(v => v === 'notificar');
    }
    return false;
  }, [currentView]);

  // Lista sem o Invest para liberar o gesto de pull-up
  const navItems = [
    { view: View.NEWS, label: 'Notícias', Icon: Icons.Info, badge: hasGlobalUnread },
    { view: View.CONTENTS, label: 'Educação', Icon: Icons.Contents, badge: false },
    { view: View.STORE, label: 'Loja', Icon: Icons.Store, badge: false },
    { view: View.REAL_ESTATE, label: 'Imóveis', Icon: Icons.RealEstate, badge: false },
    { view: View.SERVICES, label: 'Serviços', Icon: Icons.Services, badge: false },
    { view: View.PROFILE, label: 'Perfil', Icon: Icons.Profile, badge: false },
  ];

  if (currentView === View.INVEST) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-900 z-50 transition-all duration-500">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map(({ view, label, Icon, badge }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`flex flex-col items-center justify-center space-y-1 w-full transition-all duration-300 relative ${
                isActive ? 'text-[#E41B17] scale-105' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className={`relative ${isActive ? 'text-[#FFCC00]' : ''}`}>
                <Icon />
                {badge && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E41B17] rounded-full border-2 border-white dark:border-black animate-pulse" />
                )}
              </div>
              <span className="text-[7px] font-black tracking-tight uppercase">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
