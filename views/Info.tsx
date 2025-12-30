
import React, { useEffect, useState } from 'react';
import { fetchCuratedNews } from '../services/geminiService';
import { NewsItem } from '../types';

interface InfoProps {
  userInterests: string[];
}

const Info: React.FC<InfoProps> = ({ userInterests }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await fetchCuratedNews(userInterests);
      setNews(data || []);
      setLoading(false);
    };
    loadNews();
  }, [userInterests]);

  if (loading) {
    return (
      <div className="pt-8 space-y-6">
        {[1, 2, 3].map(n => (
          <div key={n} className="animate-pulse space-y-4">
            <div className="bg-gray-200 dark:bg-gray-800 h-48 rounded-3xl w-full" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black tracking-tighter">O QUE HÁ DE NOVO</h2>
        <span className="text-[10px] font-bold text-[#E41B17] uppercase tracking-widest">
          IA Curadoria
        </span>
      </div>

      <div className="grid gap-8">
        {news.map((item) => (
          <article 
            key={item.id} 
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-3xl mb-4">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-56 object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#E41B17] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {item.category}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <span>{item.source}</span>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span>{item.timestamp}</span>
              </div>
              <h3 className="text-xl font-bold leading-tight group-hover:text-[#E41B17] transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                {item.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Info;
