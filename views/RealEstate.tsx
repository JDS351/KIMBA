
import React, { useState } from 'react';
import { Property } from '../types';
import { analyzePropertySurroundings } from '../services/geminiService';

interface RealEstateProps {
  formatPrice: (p: number) => string;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  loading: boolean;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const RealEstate: React.FC<RealEstateProps> = ({ formatPrice, properties, setProperties, loading, favorites, toggleFavorite }) => {
  const [selectedPropForSurroundings, setSelectedPropForSurroundings] = useState<Property | null>(null);
  const [surroundingsInfo, setSurroundingsInfo] = useState<{text?: string, chunks: any[]} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleExplore = async (prop: Property) => {
    setSelectedPropForSurroundings(prop);
    setIsAnalyzing(true);
    const data = await analyzePropertySurroundings(prop.location, prop.coordinates?.lat, prop.coordinates?.lng);
    setSurroundingsInfo(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Imobiliário</h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">IA-Powered Maps Grounding</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
           <span className="text-[10px] font-black">{favorites.length}</span>
        </div>
      </div>

      <div className="grid gap-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center space-y-4">
             <div className="w-10 h-10 border-4 border-[#E41B17] border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">A Sincronizar com Angola...</p>
          </div>
        ) : properties.map(prop => {
          const isFavorited = favorites.includes(prop.id);
          return (
            <div key={prop.id} className="group bg-white dark:bg-black rounded-[3rem] overflow-hidden border border-gray-50 dark:border-gray-900 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E41B17]/5">
              <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={prop.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Botão Favoritar */}
                  <button 
                    onClick={() => toggleFavorite(prop.id)}
                    className={`absolute top-6 right-6 p-4 rounded-full backdrop-blur-xl transition-all duration-300 active:scale-75 shadow-lg ${isFavorited ? 'bg-[#E41B17] text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}
                  >
                    <svg 
                      width="20" height="20" viewBox="0 0 24 24" 
                      fill={isFavorited ? "currentColor" : "none"} 
                      stroke="currentColor" strokeWidth="2.5"
                      className={`${isFavorited ? 'animate-in zoom-in-50' : ''}`}
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </button>

                  <div className="absolute bottom-6 left-6">
                     <span className="bg-white/90 dark:bg-black/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                        {prop.status}
                     </span>
                  </div>
              </div>

              <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tighter leading-none">{prop.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prop.location}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[#E41B17] font-black text-xl leading-none">{formatPrice(prop.price)}</p>
                       <p className="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-tighter">IHT Incluído</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 border-y border-gray-50 dark:border-gray-900 py-4">
                     {prop.bedrooms && (
                       <div className="flex items-center space-x-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
                          <span className="text-[10px] font-black">{prop.bedrooms} Quartos</span>
                       </div>
                     )}
                     <div className="flex items-center space-x-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
                        <span className="text-[10px] font-black">{prop.area}m²</span>
                     </div>
                  </div>

                  <div className="flex space-x-3">
                     <button 
                      onClick={() => handleExplore(prop)}
                      className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center justify-center space-x-2 hover:bg-[#E41B17] hover:text-white transition-all active:scale-95"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 8v8"/></svg>
                       <span>Análise de Arredores IA</span>
                     </button>
                     <button className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] active:scale-95 transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                     </button>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surrounding Info Modal (Mantido do anterior) */}
      {selectedPropForSurroundings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-black rounded-[3rem] w-full max-w-sm p-8 space-y-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Insights do Local</h3>
                 <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Maps Grounding Ativado</p>
              </div>

              {isAnalyzing ? (
                <div className="py-10 flex flex-col items-center space-y-4">
                   <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-[8px] font-black uppercase tracking-widest text-blue-500">Mapeando zona com Gemini 2.5 Flash...</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">"{surroundingsInfo?.text}"</p>
                   <div className="space-y-2 pt-2">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Localizações Confirmadas:</p>
                      {surroundingsInfo?.chunks.map((chunk, ci) => chunk.maps && (
                        <a key={ci} href={chunk.maps.uri} target="_blank" className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:scale-[1.02] transition-all group">
                           <div className="w-8 h-8 bg-[#E41B17] rounded-lg flex items-center justify-center text-white group-hover:bg-[#FFCC00] transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                           </div>
                           <span className="text-[10px] font-bold text-black dark:text-white truncate">{chunk.maps.title}</span>
                        </a>
                      ))}
                   </div>
                   <button onClick={() => setSelectedPropForSurroundings(null)} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95">Fechar</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default RealEstate;
