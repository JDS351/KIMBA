
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
  const [scope, setScope] = useState<NewsScope>('Nacional');
  const [isNovidades, setIsNovidades] = useState(false);
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
      const data = await fetchCuratedNews(userInterests, scope, '', isNovidades, 5);
      setNews(data || []);
      setLoading(false);
      setActiveSlide(0);
      setItemLimit(5);
    };
    loadNews();
  }, [userInterests, scope, isNovidades]);

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
    if (!readIds.includes(item.id)) {
      setReadIds(prev => [...prev, item.id]);
    }
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
          <h2 className="text-xl font-bold tracking-[0.1em] uppercase">Editorial</h2>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] font-black text-[#E41B17] uppercase tracking-widest animate-pulse">Social Search Ativo</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-b border-gray-100 dark:border-gray-900 pb-1 overflow-x-auto no-scrollbar">
           <button onClick={() => { setIsNovidades(false); setScope('Nacional'); }} className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${!isNovidades && scope === 'Nacional' ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}>Nacional</button>
           <button onClick={() => { setIsNovidades(false); setScope('Internacional'); }} className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${!isNovidades && scope === 'Internacional' ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}>Internacional</button>
           <button onClick={() => setIsNovidades(true)} className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap flex items-center space-x-1 transition-all ${isNovidades ? 'text-[#E41B17] border-b-2 border-[#E41B17]' : 'text-gray-400'}`}>Novidades</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-10 animate-pulse">
          <div className="bg-gray-100 dark:bg-gray-900 aspect-[21/9] rounded-[2.5rem] w-full" />
          <div className="space-y-4">
             <div className="h-6 bg-gray-100 dark:bg-gray-900 rounded-full w-3/4" />
             <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-full w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {featuredNews.length > 0 && (
            <section className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
              <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                {featuredNews.map((item) => (
                  <div key={item.id} className="min-w-full relative aspect-[16/9] md:aspect-[21/9] cursor-pointer group">
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      onClick={(e) => { e.stopPropagation(); setZoomedImage(item.imageUrl); }}
                    />
                    <div onClick={() => handleOpenNews(item)} className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div onClick={() => handleOpenNews(item)} className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-[#E41B17] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Destaque</span>
                        <span className="bg-black/40 backdrop-blur-lg text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                          {item.source}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter line-clamp-2">{item.title}</h3>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setZoomedImage(item.imageUrl); }}
                      className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 15 6 6m-6-6v4.8m0-4.8h-4.8M9 9l-6-6m6 6V4.2M9 9H4.2"/></svg>
                    </button>
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
            {regularNews.map((item, index) => {
              const isRead = readIds.includes(item.id);
              const showAd = (index + 1) % 5 === 0;

              return (
                <React.Fragment key={item.id}>
                  <article 
                    className={`group cursor-pointer flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 news-read-transition relative ${isRead ? 'news-is-read' : ''}`}
                  >
                    <div className="relative overflow-hidden rounded-[2rem] aspect-[16/9] md:w-60 bg-gray-50 dark:bg-gray-900 shrink-0">
                      <img 
                        src={item.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 cursor-zoom-in" 
                        onClick={(e) => { e.stopPropagation(); setZoomedImage(item.imageUrl); }}
                      />
                      <div onClick={() => handleOpenNews(item)} className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      
                      <div onClick={() => handleOpenNews(item)} className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                        <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{item.source}</span>
                      </div>
                      
                      {isRead && (
                        <div className="absolute bottom-4 left-4 bg-[#FFCC00] text-black p-1 rounded-full shadow-lg">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 flex-1" onClick={() => handleOpenNews(item)}>
                      <div className="flex items-center space-x-3">
                        <span className="bg-[#E41B17] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/10">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-2 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                           <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                           <span>{item.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-black group-hover:text-[#E41B17] transition-colors leading-tight tracking-tighter">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed font-medium">
                          {item.summary}
                        </p>
                      </div>

                      {isRead && (
                        <span className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
                          Conteúdo lido com sucesso
                        </span>
                      )}
                    </div>
                  </article>
                  
                  {showAd && (
                    <div className="py-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <AdBanner />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <button 
            onClick={handleSeeMore}
            disabled={loadingMore}
            className="w-full py-6 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center justify-center space-x-3 group active:scale-[0.98] transition-all"
          >
            {loadingMore ? (
              <div className="w-5 h-5 border-3 border-[#E41B17] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-[#E41B17]">Carregar mais 20 histórias</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-300 group-hover:text-[#E41B17] group-hover:translate-y-1 transition-all"><path d="m6 9 6 6 6-6"/></svg>
              </>
            )}
          </button>
        </div>
      )}

      {selectedNews && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-y-auto animate-in fade-in slide-in-from-bottom-10 duration-500 no-scrollbar">
           <header className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-xl p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-900">
              <button onClick={() => setSelectedNews(null)} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 bg-[#E41B17] rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Live AI Curator</span>
              </div>
              <button className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              </button>
           </header>

           <div className="max-w-3xl mx-auto pb-32">
              <div className="relative group">
                <img 
                  src={selectedNews.imageUrl} 
                  className="w-full aspect-video object-cover cursor-zoom-in" 
                  onClick={() => setZoomedImage(selectedNews.imageUrl)}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
              </div>

              <div className="px-8 py-10 space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="bg-[#E41B17] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-red-500/20">
                         {selectedNews.category}
                       </span>
                       <div className="flex items-center space-x-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                            {selectedNews.source}
                          </span>
                       </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter leading-tight text-black dark:text-white">{selectedNews.title}</h1>
                 </div>

                 <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 space-y-6">
                    <div className="flex items-center space-x-3 text-[#E41B17]">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Resumo Inteligente KIMBA</h4>
                    </div>
                    {loadingSummary ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-4/6" />
                      </div>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap border-l-4 border-[#E41B17] pl-6">
                        {aiSummary}
                      </p>
                    )}
                 </div>

                 <div className="text-base leading-relaxed text-gray-600 dark:text-gray-400 font-medium space-y-6 px-2">
                    {selectedNews.content || selectedNews.summary}
                 </div>

                 <div className="pt-10 border-t border-gray-100 dark:border-gray-900 space-y-6">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Fontes de Grounding</h5>
                    <div className="grid gap-3">
                       {selectedNews.groundingSources?.map((source: any, idx: number) => source.web && (
                         <a key={idx} href={source.web.uri} target="_blank" className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 group">
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate mr-4">{source.web.title}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#E41B17] group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                         </a>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           
           <button 
            onClick={() => setSelectedNews(null)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white dark:bg-white dark:text-black px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all z-50"
           >
             Fechar Artigo
           </button>
        </div>
      )}
    </div>
  );
};

export default News;
