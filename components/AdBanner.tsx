
import React from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  // IDs fornecidos pelo usuário
  const ADMOB_APP_ID = "ca-app-pub-4148837343603531~3706163830";
  const AD_UNIT_ID = "ca-app-pub-4148837343603531/4603494291";

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all ${className}`}
      data-ad-client={ADMOB_APP_ID}
      data-ad-slot={AD_UNIT_ID}
    >
      <div className="absolute top-2 right-4 flex items-center space-x-1">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Publicidade</span>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </div>

      <div className="flex items-center justify-center p-8 min-h-[100px]">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Parceiro KIMBA</p>
          <p className="text-[9px] text-gray-400 font-medium">Anúncio seguro verificado pela plataforma.</p>
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#E41B17]/5 to-transparent opacity-30" />
    </div>
  );
};

export default AdBanner;
