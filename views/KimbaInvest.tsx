
import React, { useState, useEffect } from 'react';
import { Asset, InvestmentInsight } from '../types';
import { generateInvestmentInsight, fetchRealTimeMarketData } from '../services/geminiService';

const INITIAL_ASSETS: Asset[] = [
  { 
    id: '1', symbol: 'OT-10Y', name: 'Obrigações Tesouro (10 Anos)', price: 100.25, change: 0.15, type: 'BODIVA', 
    volume24h: '12.4M Kz', marketCap: '450B Kz', high24h: 101.00, low24h: 99.80,
    sourceUrl: 'https://www.bodiva.ao/', providerName: 'BODIVA' 
  },
  { 
    id: '2', symbol: 'BAI', name: 'Banco Angolano de Investimentos', price: 21500, change: 1.2, type: 'BODIVA', 
    volume24h: '45.2M Kz', marketCap: '2.1T Kz', high24h: 21800, low24h: 21200,
    sourceUrl: 'https://www.bodiva.ao/', providerName: 'BODIVA' 
  },
  { 
    id: '5', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 512.40, change: 0.85, type: 'Internacional', category: 'ETF', 
    volume24h: '4.2B USD', marketCap: '1.2T USD', high24h: 515.00, low24h: 508.40,
    sourceUrl: 'https://pepperstone.com/', providerName: 'Pepperstone' 
  },
  { 
    id: '8', symbol: 'GOLD', name: 'Ouro (XAU/USD)', price: 2345.60, change: 0.45, type: 'Commodity', category: 'Matéria-Prima', 
    volume24h: '185M Oz', marketCap: '14T USD', high24h: 2360.00, low24h: 2338.00,
    sourceUrl: 'https://www.blackrock.com/', providerName: 'Blackrock' 
  },
  { 
    id: '11', symbol: 'BTC', name: 'Bitcoin', price: 67450, change: -2.4, type: 'Crypto', category: 'Moeda', 
    volume24h: '35B USD', marketCap: '1.3T USD', high24h: 69200, low24h: 66800,
    sourceUrl: 'https://www.binance.com/', providerName: 'Binance' 
  }
];

interface KimbaInvestProps {
  formatPrice: (p: number) => string;
}

const KimbaInvest: React.FC<KimbaInvestProps> = ({ formatPrice }) => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [insight, setInsight] = useState<InvestmentInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [marketFilter, setMarketFilter] = useState<'Nacional' | 'Internacional'>('Nacional');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Global, BODIVA & Crypto (as fallback) via Gemini Search
  const syncMarketData = async () => {
    setIsSyncing(true);
    // Buscamos todos os símbolos para garantir que mesmo se as APIs específicas falharem, o Gemini tente buscar
    const symbols = assets.map(a => a.symbol);
    const liveData = await fetchRealTimeMarketData(symbols);
    
    if (Object.keys(liveData).length > 0) {
      setAssets(prev => prev.map(asset => {
        if (liveData[asset.symbol]) {
          return {
            ...asset,
            price: liveData[asset.symbol].price,
            change: liveData[asset.symbol].change
          };
        }
        return asset;
      }));
    }
    setIsSyncing(false);
  };

  // Sync Crypto via CoinGecko (pode falhar por CORS em dev)
  const syncCryptoData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Falha no fetch CoinGecko');

      const data = await res.json();
      const mapping: Record<string, string> = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana' };
      
      setAssets(prev => prev.map(asset => {
        const cgId = mapping[asset.symbol];
        if (cgId && data[cgId]) {
          return {
            ...asset,
            price: data[cgId].usd,
            change: parseFloat(data[cgId].usd_24h_change.toFixed(2))
          };
        }
        return asset;
      }));
    } catch (e) { 
      // Em caso de erro de rede/CORS, o syncMarketData (Gemini) atuará como fallback automático
      console.warn("Sincronização direta CoinGecko falhou. Usando inteligência KIMBA para cotações.");
    }
  };

  useEffect(() => {
    generateInvestmentInsight().then(setInsight).finally(() => setLoadingInsight(false));
    syncMarketData();
    syncCryptoData();
    
    const interval = setInterval(() => {
      syncCryptoData();
      if (Math.random() > 0.6) syncMarketData(); 
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const nationalAssets = assets.filter(a => a.type === 'BODIVA');
  const internationalAssets = assets.filter(a => a.type !== 'BODIVA');

  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Market Ticker */}
      <div className="bg-black text-white dark:bg-[#1A1A1A] py-3 -mx-4 overflow-hidden border-y border-[#D4AF37]/30">
        <div className="flex animate-marquee whitespace-nowrap space-x-12">
          {[...assets, ...assets].map((asset, idx) => (
            <div key={`${asset.id}-${idx}`} className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase text-[#D4AF37]">{asset.symbol}</span>
              <span className="text-[10px] font-bold text-gray-400">
                {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-[8px] font-black ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-[#D4AF37]">Wealth Hub</h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${isSyncing ? 'bg-yellow-500 animate-spin' : 'bg-green-500 animate-pulse'}`} />
            {isSyncing ? 'Sincronizando Terminais...' : `Dados Live — ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
      </div>

      {/* AI Analyst Card */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-black p-8 rounded-[2.5rem] border border-[#D4AF37]/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/></svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">The Gold Analyst</h3>
            </div>
          </div>
          {!loadingInsight && (
            <div className="space-y-3">
              <h4 className="text-lg font-black text-white leading-tight">{insight?.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-[#D4AF37] pl-4">"{insight?.analysis}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => setMarketFilter('Nacional')}
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${marketFilter === 'Nacional' ? 'bg-white dark:bg-black text-[#D4AF37] shadow-xl' : 'text-gray-400'}`}
        >
          Nacional (BODIVA)
        </button>
        <button 
          onClick={() => setMarketFilter('Internacional')}
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${marketFilter === 'Internacional' ? 'bg-white dark:bg-black text-[#D4AF37] shadow-xl' : 'text-gray-400'}`}
        >
          Internacional (Global)
        </button>
      </div>

      {/* Asset Grid */}
      <div className="space-y-10 px-1">
        {marketFilter === 'Nacional' ? (
          <div className="grid gap-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">BODIVA — Angola</h3>
            {nationalAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} formatPrice={formatPrice} onClick={() => setSelectedAsset(asset)} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-2">ETFs — Pepperstone</h3>
              {internationalAssets.filter(a => a.category === 'ETF').map(asset => (
                <AssetCard key={asset.id} asset={asset} formatPrice={formatPrice} onClick={() => setSelectedAsset(asset)} />
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] px-2">Commodities — Blackrock</h3>
              {internationalAssets.filter(a => a.category === 'Matéria-Prima').map(asset => (
                <AssetCard key={asset.id} asset={asset} formatPrice={formatPrice} onClick={() => setSelectedAsset(asset)} />
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] px-2">Crypto — Binance (via CoinGecko)</h3>
              {internationalAssets.filter(a => a.type === 'Crypto').map(asset => (
                <AssetCard key={asset.id} asset={asset} formatPrice={formatPrice} onClick={() => setSelectedAsset(asset)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 space-y-8 shadow-2xl border-t sm:border border-gray-100 dark:border-gray-900 overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="flex justify-between items-start">
                 <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-inner">
                       {selectedAsset.symbol[0]}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">{selectedAsset.symbol}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedAsset.name}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedAsset(null)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="flex items-center space-x-2 mb-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço em Tempo Real</p>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                       </div>
                       <p className="text-4xl font-black text-black dark:text-white">
                          {selectedAsset.type === 'BODIVA' ? formatPrice(selectedAsset.price) : `$ ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                       </p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl font-black text-xs ${selectedAsset.change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                       {selectedAsset.change >= 0 ? '▲' : '▼'} {Math.abs(selectedAsset.change)}%
                    </div>
                 </div>

                 {/* Professional Graph Area */}
                 <div className="relative w-full h-56 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] p-6 flex flex-col justify-between border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Y Axis */}
                    <div className="absolute left-4 top-4 bottom-10 flex flex-col justify-between text-[7px] font-black text-gray-400 uppercase pointer-events-none z-10">
                       <span>{Math.round(selectedAsset.price * 1.05)}</span>
                       <span>{Math.round(selectedAsset.price * 0.95)}</span>
                    </div>

                    {/* Chart Canvas */}
                    <div className="flex-1 flex items-end ml-4 mb-2 relative">
                       {/* Linha Horizontal Tracejada (Estilo TradingView) */}
                       <div 
                        className={`absolute left-0 right-0 border-t border-dashed transition-all duration-700 pointer-events-none z-20 ${selectedAsset.change >= 0 ? 'border-green-500' : 'border-red-500'}`}
                        style={{ bottom: `${(selectedAsset.change > 0 ? 30 : 10) * 2.5}%` }}
                       />

                       <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible relative z-10">
                          <path 
                            d={`M 0 30 Q 15 ${selectedAsset.change > 0 ? '15' : '35'}, 30 20 T 60 25 T 90 10 T 100 ${selectedAsset.change > 0 ? '5' : '38'}`} 
                            fill="none" 
                            stroke={selectedAsset.change >= 0 ? '#10b981' : '#ef4444'} 
                            strokeWidth="1.2" 
                            strokeLinecap="round"
                          />
                          <path 
                            d={`M 0 30 Q 15 ${selectedAsset.change > 0 ? '15' : '35'}, 30 20 T 60 25 T 90 10 T 100 ${selectedAsset.change > 0 ? '5' : '38'} V 40 H 0 Z`} 
                            fill={`url(#gradient-${selectedAsset.id})`} 
                            opacity="0.1" 
                          />
                          <defs>
                             <linearGradient id={`gradient-${selectedAsset.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={selectedAsset.change >= 0 ? '#10b981' : '#ef4444'} />
                                <stop offset="100%" stopColor="transparent" />
                             </linearGradient>
                          </defs>
                       </svg>
                    </div>

                    {/* X Axis */}
                    <div className="flex justify-between items-center ml-4 border-t border-gray-100 dark:border-gray-800 pt-2 z-10">
                       {['D-7', 'D-5', 'D-3', 'D-1', 'Hoje'].map((day, idx) => (
                         <span key={idx} className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{day}</span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Advanced Metrics */}
              <div className="grid grid-cols-2 gap-4">
                 <MetricBox label="Volume (24h)" value={selectedAsset.volume24h || 'N/A'} />
                 <MetricBox label="Capitalização" value={selectedAsset.marketCap || 'N/A'} />
                 <MetricBox label="Máxima Diária" value={selectedAsset.type === 'BODIVA' ? formatPrice(selectedAsset.high24h || 0) : `$ ${(selectedAsset.high24h || 0).toLocaleString()}`} />
                 <MetricBox label="Mínima Diária" value={selectedAsset.type === 'BODIVA' ? formatPrice(selectedAsset.low24h || 0) : `$ ${(selectedAsset.low24h || 0).toLocaleString()}`} />
              </div>

              <div className="pt-4">
                 <a href={selectedAsset.sourceUrl} target="_blank" rel="noopener" className="w-full flex items-center justify-between p-6 bg-black dark:bg-[#1A1A1A] rounded-[2.5rem] group hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Negociar Ativo</p>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">Terminal {selectedAsset.providerName}</p>
                       </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#D4AF37] group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                 </a>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-flex; animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
};

const MetricBox: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-black text-black dark:text-white truncate uppercase tracking-tighter">{value}</p>
  </div>
);

const AssetCard: React.FC<{ asset: Asset, formatPrice: (p: number) => string, onClick: () => void }> = ({ asset, formatPrice, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-900 flex items-center justify-between group hover:border-[#D4AF37]/40 transition-all shadow-sm cursor-pointer active:scale-[0.98]">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${
        asset.type === 'BODIVA' ? 'bg-[#E41B17]/10 text-[#E41B17]' : 
        asset.type === 'Crypto' ? 'bg-orange-500/10 text-orange-500' :
        asset.type === 'Commodity' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-blue-500/10 text-blue-500'
      }`}>
        {asset.symbol[0]}
      </div>
      <div>
        <h5 className="text-sm font-black text-black dark:text-white group-hover:text-[#D4AF37] transition-colors">{asset.name}</h5>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{asset.symbol} • {asset.providerName}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-black dark:text-white">
        {asset.type === 'BODIVA' ? formatPrice(asset.price) : `$ ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
      </p>
      <p className={`text-[10px] font-black ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {asset.change >= 0 ? '+' : ''}{asset.change}%
      </p>
    </div>
  </div>
);

export default KimbaInvest;
