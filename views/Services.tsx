
import React, { useState, useEffect, useMemo } from 'react';
import { ServiceProvider, ServiceItem, HiredService } from '../types';
import { fetchTransportRealtimeInfo, fetchMaritimeAdvisory } from '../services/geminiService';

interface ServicesProps {
  balance: number;
  handlePayment: (amount: number, serviceInfo?: { serviceName: string, providerName: string }) => boolean;
  formatPrice: (p: number) => string;
  hiredServices: HiredService[];
  onConfirmCompletion: (id: string) => void;
}

const BUS_COMPANIES = [
  { 
    id: 't1', 
    name: 'Macon Transportes', 
    description: 'Líder em transporte interprovincial em Angola.',
    url: 'https://macon.ao/',
    logo: '🚌'
  },
  { 
    id: 't2', 
    name: 'Girassol', 
    description: 'Conforto e segurança nas rotas nacionais.',
    url: 'https://girassol.co.ao/',
    logo: '🌻'
  },
  { 
    id: 't3', 
    name: 'Rosalina Express', 
    description: 'Excelência e pontualidade em cada viagem.',
    url: 'https://rosalinaexpress.com/',
    logo: '🌹'
  }
];

const AIRLINES = [
  {
    id: 'a1',
    name: 'TAAG',
    fullName: 'Linhas Aéreas de Angola',
    description: 'Companhia de bandeira com voos nacionais e internacionais.',
    url: 'https://www.taag.com/',
    logo: '✈️',
    destinations: ['Lisboa', 'São Paulo', 'Cabinda', 'Lubango']
  },
  {
    id: 'a2',
    name: 'Fly Angola',
    fullName: 'Fly Angola',
    description: 'Conectando as províncias com eficiência.',
    url: 'https://flyangola.com/',
    logo: '🛩️',
    destinations: ['Luanda', 'Benguela', 'Saurimo']
  }
];

const MARITIME_COMPANIES = [
  {
    id: 'm1',
    name: 'Sécil Marítima',
    fullName: 'Sécil Marítima (Catamarãs)',
    description: 'Transporte de passageiros Luanda - Kapossoca e Ferry para Cabinda.',
    url: 'https://secilmaritima.ao/',
    logo: '🚢',
    routes: ['Luanda - Kapossoca', 'Luanda - Cabinda', 'Luanda - Soyo']
  },
  {
    id: 'm2',
    name: 'Porto de Luanda',
    fullName: 'Empresa Portuária de Luanda',
    description: 'Serviços logísticos, carga e terminais portuários.',
    url: 'https://www.portoluanda.co.ao/',
    logo: '⚓',
    routes: ['Logística Internacional', 'Cabotagem Nacional']
  }
];

const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: 's1',
    name: 'Carlos Oliveira',
    specialty: 'Eletricista Certificado',
    location: 'Maianga, Rua 5',
    province: 'Luanda',
    rating: 4.9,
    totalRatings: 124,
    completedJobs: 450,
    imageUrl: 'https://picsum.photos/seed/person1/200/200',
    phone: '923000000',
    whatsapp: '923000000',
    bio: 'Especialista em instalações com mais de 10 anos de experiência.',
    catalog: [
      { id: 'i1', name: 'Instalação AC 12k', description: 'Montagem completa split', howItWorks: 'Realizamos furação e carga.', price: 15000, duration: '2h', imageUrl: 'https://picsum.photos/seed/ac/200/200' },
    ]
  }
];

const Services: React.FC<ServicesProps> = ({ balance, handlePayment, formatPrice, hiredServices, onConfirmCompletion }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'hired' | 'transport'>('catalog');
  const [transportType, setTransportType] = useState<'road' | 'air' | 'maritime'>('road');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<any | null>(null);
  const [transportInfo, setTransportInfo] = useState<string | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [maritimeAdvisory, setMaritimeAdvisory] = useState<string | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);

  const handleTransportClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCheckTransport = async (provider: any, type: 'aéreo' | 'marítimo') => {
    setSelectedTransport(provider);
    setIsLoadingInfo(true);
    const info = await fetchTransportRealtimeInfo(provider.name, type);
    setTransportInfo(info);
    setIsLoadingInfo(false);
  };

  const handleGetAdvisory = async () => {
    setIsLoadingAdvisory(true);
    const advisory = await fetchMaritimeAdvisory();
    setMaritimeAdvisory(advisory);
    setIsLoadingAdvisory(false);
  };

  if (selectedProvider) {
    return (
      <div className="py-6 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-24">
        <button onClick={() => setSelectedProvider(null)} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 hover:text-[#E41B17] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
          <span>Voltar</span>
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
          <img src={selectedProvider.imageUrl} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white dark:border-black shadow-xl" />
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-black dark:text-white">{selectedProvider.name}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedProvider.specialty}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-black dark:text-white">Serviços</h2>

        <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-3.5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'catalog' ? 'bg-white dark:bg-black text-[#E41B17] shadow-md' : 'text-gray-400'}`}
          >
            Prestadores
          </button>
          <button 
            onClick={() => setActiveTab('transport')}
            className={`flex-1 py-3.5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'transport' ? 'bg-white dark:bg-black text-[#E41B17] shadow-md' : 'text-gray-400'}`}
          >
            Transporte
          </button>
          <button 
            onClick={() => setActiveTab('hired')}
            className={`flex-1 py-3.5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'hired' ? 'bg-white dark:bg-black text-[#E41B17] shadow-md' : 'text-gray-400'}`}
          >
            Contratações
          </button>
        </div>
      </div>

      {activeTab === 'transport' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full w-full max-w-sm mx-auto">
             <button 
              onClick={() => setTransportType('road')}
              className={`flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${transportType === 'road' ? 'bg-white dark:bg-black text-[#E41B17] shadow-sm' : 'text-gray-400'}`}
             >
               Estrada
             </button>
             <button 
              onClick={() => setTransportType('air')}
              className={`flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${transportType === 'air' ? 'bg-white dark:bg-black text-[#E41B17] shadow-sm' : 'text-gray-400'}`}
             >
               Aéreo
             </button>
             <button 
              onClick={() => setTransportType('maritime')}
              className={`flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${transportType === 'maritime' ? 'bg-white dark:bg-black text-[#E41B17] shadow-sm' : 'text-gray-400'}`}
             >
               Marítimo
             </button>
          </div>

          {transportType === 'road' && (
            <div className="grid grid-cols-1 gap-4">
              {BUS_COMPANIES.map(company => (
                <button 
                  key={company.id}
                  onClick={() => handleTransportClick(company.url)}
                  className="p-6 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center space-x-5 hover:border-[#E41B17] transition-all text-left"
                >
                  <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl">{company.logo}</div>
                  <div className="flex-1">
                    <h5 className="font-black text-sm text-black dark:text-white">{company.name}</h5>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">{company.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {transportType === 'air' && (
            <div className="grid gap-4">
                {AIRLINES.map(airline => (
                  <div key={airline.id} className="p-8 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{airline.logo}</div>
                        <div>
                          <h4 className="text-lg font-black text-black dark:text-white">{airline.name}</h4>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{airline.fullName}</p>
                        </div>
                      </div>
                      <button onClick={() => handleCheckTransport(airline, 'aéreo')} className="bg-[#FFCC00] text-black text-[8px] font-black uppercase px-4 py-2 rounded-full shadow-lg shadow-[#FFCC00]/20 active:scale-95 transition-all">Consultar IA</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {transportType === 'maritime' && (
            <div className="grid gap-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-[2.5rem] mb-2 space-y-4">
                   <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Rotas de Mar</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Informações sobre Catamarãs, Ferries e Logística Portuária.</p>
                   </div>
                   
                   {!maritimeAdvisory && !isLoadingAdvisory ? (
                     <button 
                      onClick={handleGetAdvisory}
                      className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-white dark:bg-blue-950/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900 active:scale-95 transition-all"
                     >
                       Ver Boletim Marítimo IA
                     </button>
                   ) : isLoadingAdvisory ? (
                     <div className="flex items-center space-x-2 animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-[9px] font-black text-blue-400 uppercase">Consultando Marégrafo...</span>
                     </div>
                   ) : (
                     <div className="bg-white dark:bg-black p-4 rounded-2xl border border-blue-100 dark:border-blue-900 animate-in fade-in zoom-in-95">
                        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300 italic leading-relaxed">
                          {maritimeAdvisory}
                        </p>
                        <button onClick={() => setMaritimeAdvisory(null)} className="mt-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">Fechar Boletim</button>
                     </div>
                   )}
                </div>
                {MARITIME_COMPANIES.map(company => (
                  <div key={company.id} className="p-8 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-[3rem] space-y-6 hover:border-blue-500 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-500/10 transition-colors">{company.logo}</div>
                        <div>
                          <h4 className="text-lg font-black text-black dark:text-white group-hover:text-blue-500 transition-colors">{company.name}</h4>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{company.fullName}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCheckTransport(company, 'marítimo')}
                        className="bg-blue-500 text-white text-[8px] font-black uppercase px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        IA Live Status
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {company.routes.map((route, ri) => (
                         <span key={ri} className="bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full text-[9px] font-bold text-gray-500 border border-gray-100 dark:border-gray-800 italic transition-colors group-hover:text-blue-500 group-hover:border-blue-500/30">{route}</span>
                       ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Informações de Transporte IA */}
      {selectedTransport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-black rounded-[3rem] w-full max-w-sm p-8 space-y-6 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[80vh]">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Terminal {selectedTransport.name}</h3>
                 <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">KIMBA IA Intelligence</p>
              </div>

              {isLoadingInfo ? (
                <div className="py-12 flex flex-col items-center space-y-4">
                   <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verificando rotas e sites oficiais...</p>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line border-l-4 border-blue-500 pl-6 italic">
                      {transportInfo}
                   </div>
                   <button onClick={() => setSelectedTransport(null)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black rounded-full text-[10px] uppercase tracking-widest active:scale-95 transition-all">Fechar</button>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {MOCK_PROVIDERS.map(provider => (
            <div 
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="flex items-center space-x-5 p-5 bg-white dark:bg-black rounded-[2.5rem] border border-gray-100 dark:border-gray-900 transition-all cursor-pointer hover:border-[#E41B17]/30 group"
            >
              <img src={provider.imageUrl} className="w-16 h-16 rounded-[1.5rem] object-cover group-hover:scale-105 transition-transform" />
              <div className="flex-1">
                <h4 className="font-bold text-base text-black dark:text-white group-hover:text-[#E41B17] transition-colors">{provider.name}</h4>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{provider.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hired' && (
        <div className="py-20 text-center space-y-4 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
           <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto text-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sem movimentos recentes.</p>
        </div>
      )}
    </div>
  );
};

export default Services;
