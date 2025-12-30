
import React, { useEffect, useState, useMemo } from 'react';
import { fetchCuratedNews, summarizeNewsArticle } from '../services/geminiService';
import { NewsItem, NewsScope } from '../types';
import AdBanner from '../components/AdBanner';
import ImageModal from '../components/ImageModal';

interface NewsProps {
  userInterests: string[];
}

const News: React.FC<NewsProps> = ({ userInterests }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Scopes: 'Nacional' | 'Internacional' | 'Novidades'
  const [activeTab, setActiveTab] = useState<'Nacional' | 'Internacional' | 'Novidades'>('Nacional');
  
  // Sub-scope for Novidades: 'Nacional' (Local) | 'Internacional'
  const [novidadesScope, setNovidadesScope] = useState<NewsScope>('Nacional');
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [itemLimit, setItemLimit] = useState(5);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [readIds, setReadIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kimba_read_news');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kimba_read_news', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const isNovidades = activeTab === 'Novidades';
      const scope = isNovidades ? novidadesScope : activeTab as NewsScope;
      
      const data = await fetchCuratedNews(userInterests, scope, '', isNovidades, 5);
      setNews(data || []);
      setLoading(false);
      setActiveSlide(0);
      setItemLimit(5);
    };
    loadNews();
  }, [userInterests, activeTab, novidadesScope]);

  useEffect(() => {
    if (news.length > 1 && !selectedNews) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % Math.min(news.length, 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [news, selectedNews]);

  const handleSeeMore = async () => {
    setLoadingMore(true);
    const isNovidades = activeTab === 'Novidades';
    const scope = isNovidades ? novidadesScope : activeTab as NewsScope;
    
    const moreData = await fetchCuratedNews(userInterests, scope, '', isNovidades, 20);
    setNews(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filteredMore = moreData.filter(n => !existingIds.has(n.id));
      return [...prev, ...filteredMore];
    });
    setItemLimit(prev => prev + 20);
    setLoadingMore(false);
  };

  const handleOpenNews = async (item: NewsItem) => {
    setSelectedNews(item);
    setAiSummary(null);
    setLoadingSummary(true);
    if (!readIds.includes(item.id)) setReadIds(prev => [...prev, item.id]);
    const summary = await summarizeNewsArticle(item.title, item.content || item.summary);
    setAiSummary(summary);
    setLoadingSummary(false);
  };

  const featuredNews = useMemo(() => news.slice(0, 3), [news]);
  const regularNews = useMemo(() => news.slice(3), [news]);

  return (
    <div className="py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {zoomedImage && <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />}

      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black tracking-[0.1em] uppercase">
            {activeTab === 'Novidades' ? 'Trends & Novidades' : 'Editorial'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] font-black text-[#E41B17] uppercase tracking-widest animate-pulse">
              {activeTab === 'Novidades' ? 'Crawl Ativo: Social & Trends' : 'Search Ativo: Grounding'}
            </span>
          </div>
        </div>

        {/* Main Unified Header: Nacional | Internacional | Novidades */}
        <div className="flex items-center space-x-8 border-b border-gray-100 dark:border-gray-900 overflow-x-auto no-scrollbar pb-0.5">
           <button 
            onClick={() => setActiveTab('Nacional')} 
            className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'Nacional' ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}
           >
             Nacional
           </button>
           <button 
            onClick={() => setActiveTab('Internacional')} 
            className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'Internacional' ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}
           >
             Internacional
           </button>
           <button 
            onClick={() => setActiveTab('Novidades')} 
            className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${activeTab === 'Novidades' ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}
           >
             Novidades
             <div className="absolute top-[-4px] right-[-8px] w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
           </button>
        </div>

        {/* Secondary Navigation for Novidades: Local | Internacional */}
        {activeTab === 'Novidades' && (
          <div className="animate-in slide-in-from-top-2">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-3xl w-fit border border-gray-100 dark:border-gray-800">
               <button 
                onClick={() => setNovidadesScope('Nacional')}
                className={`px-8 py-2.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${novidadesScope === 'Nacional' ? 'bg-white dark:bg-black text-[#E41B17] shadow-sm' : 'text-gray-400'}`}
               >
                 Local
               </button>
               <button 
                onClick={() => setNovidadesScope('Internacional')}
                className={`px-8 py-2.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${novidadesScope === 'Internacional' ? 'bg-white dark:bg-black text-[#E41B17] shadow-sm' : 'text-gray-400'}`}
               >
                 Internacional
               </button>
            </div>
            <p className="mt-3 text-[7px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">
               Motor de busca: Redes Sociais, Magazines, Blogs e Sites Oficiais
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-10 animate-pulse">
          <div className="bg-gray-100 dark:bg-gray-900 aspect-[21/9] rounded-[2.5rem] w-full" />
          <div className="space-y-4 px-2">
             <div className="h-6 bg-gray-100 dark:bg-gray-900 rounded-full w-3/4" />
             <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-full w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {featuredNews.length > 0 && (
            <section className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10">
              <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                {featuredNews.map((item) => (
                  <div key={item.id} className="min-w-full relative aspect-[16/9] md:aspect-[21/9] cursor-pointer group">
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onClick={(e) => { e.stopPropagation(); setZoomedImage(item.imageUrl); }} />
                    <div onClick={() => handleOpenNews(item)} className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div onClick={() => handleOpenNews(item)} className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl ${activeTab === 'Novidades' ? 'bg-[#FFCC00] text-black' : 'bg-[#E41B17] text-white'}`}>
                           {activeTab === 'Novidades' ? 'VIRAL' : 'HOT'}
                        </span>
                        <span className="bg-black/40 backdrop-blur-lg text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">{item.source}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter line-clamp-2 uppercase italic">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-8 flex space-x-2">
                 {featuredNews.map((_, i) => (
                   <div key={i} className={`h-1 rounded-full transition-all ${activeSlide === i ? 'w-6 bg-[#FFCC00]' : 'w-2 bg-white/30'}`} />
                 ))}
              </div>
            </section>
          )}

          <div className="grid gap-12 pb-10">
            {regularNews.map((item) => {
              const isRead = readIds.includes(item.id);
              return (
                <article key={item.id} className={`group cursor-pointer flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 news-read-transition relative ${isRead ? 'news-is-read' : ''}`}>
                  <div className="relative overflow-hidden rounded-[2rem] aspect-[16/9] md:w-60 bg-gray-50 dark:bg-gray-900 shrink-0">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setZoomedImage(item.imageUrl); }} />
                    <div onClick={() => handleOpenNews(item)} className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{item.source}</span>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1" onClick={() => handleOpenNews(item)}>
                    <div className="flex items-center space-x-3">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${activeTab === 'Novidades' ? 'bg-orange-500/10 text-orange-500' : 'bg-[#E41B17] text-white'}`}>
                        {item.category}
                      </span>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.timestamp}</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black group-hover:text-[#E41B17] transition-colors leading-tight tracking-tighter uppercase">{item.title}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">{item.summary}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <AdBanner />

          <button onClick={handleSeeMore} disabled={loadingMore} className="w-full py-6 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center justify-center space-x-3 active:scale-[0.98] transition-all">
            {loadingMore ? (
               <div className="w-5 h-5 border-3 border-[#E41B17] border-t-transparent rounded-full animate-spin" />
            ) : (
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Sincronizar mais {activeTab === 'Novidades' ? 'tendências' : 'fatos'}
               </span>
            )}
          </button>
        </div>
      )}

      {selectedNews && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-y-auto animate-in fade-in slide-in-from-bottom-10 no-scrollbar">
           <header className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-xl p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-900">
              <button onClick={() => setSelectedNews(null)} className="p-3 rounded-2xl">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <div className="flex flex-col items-center text-center">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">{activeTab === 'Novidades' ? 'TRENDS & FOFOFAS' : 'KIMBA FEED'}</span>
                 <span className="text-[7px] font-bold text-[#E41B17] uppercase tracking-widest line-clamp-1">{selectedNews.source}</span>
              </div>
              <div className="w-10" />
           </header>
           <div className="max-w-3xl mx-auto pb-32">
              <img src={selectedNews.imageUrl} className="w-full aspect-video object-cover" />
              <div className="px-8 py-10 space-y-10">
                 <div className="space-y-6">
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${activeTab === 'Novidades' ? 'bg-[#FFCC00] text-black' : 'bg-[#E41B17] text-white'}`}>
                       {selectedNews.category}
                    </span>
                    <h1 className="text-4xl font-black tracking-tighter leading-tight uppercase italic">{selectedNews.title}</h1>
                 </div>
                 
                 <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-800"><path d="M12 2v20M2 12h20"/></svg>
                    </div>
                    {loadingSummary ? (
                       <p className="animate-pulse text-xs font-black text-gray-400">Analisando o que está em alta...</p>
                    ) : (
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-[#E41B17] uppercase tracking-widest mb-1">Resumo Inteligente</p>
                          <p className="text-sm font-medium leading-relaxed italic">"{aiSummary}"</p>
                       </div>
                    )}
                 </div>
                 
                 <div className="text-base leading-relaxed text-gray-600 dark:text-gray-400 font-medium space-y-6">
                    {selectedNews.content || selectedNews.summary}
                 </div>
                 
                 <div className="pt-8 border-t border-gray-100 dark:border-gray-900">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Fontes de Grounding:</p>
                    <div className="flex flex-wrap gap-3">
                       {selectedNews.groundingSources?.map((source, idx) => source.web && (
                         <a key={idx} href={source.web.uri} target="_blank" className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl text-[9px] font-black text-[#E41B17] border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all">
                            {source.web.title}
                         </a>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           <button onClick={() => setSelectedNews(null)} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
              Fechar Artigo
           </button>
        </div>
      )}
    </div>
  );
};

export default News;
