
import React, { useState, useRef, useMemo } from 'react';
import { Product } from '../types';
import { Icons } from '../constants';
import { generateProductImageSuggestion } from '../services/geminiService';
import AdBanner from '../components/AdBanner';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Café de Angola Premium (500g)',
    price: 4500,
    seller: 'Fazenda Ganda',
    imageUrl: 'https://picsum.photos/seed/coffee/500/500',
    verified: true,
    description: 'Café arábica de alta qualidade cultivado nas montanhas de Angola.',
    technicalFeatures: 'Tipo: Arábica; Peso: 500g; Torra: Média.',
    mainBenefits: 'Sabor intenso, aroma persistente e energia para o dia todo.'
  },
  {
    id: 'p2',
    name: 'Planner Kimba 2024 Digital',
    price: 2500,
    seller: 'Kimba Design',
    imageUrl: 'https://picsum.photos/seed/planner/500/500',
    verified: false,
    description: 'Otimize a sua produtividade com o nosso planner digital exclusivo.',
    technicalFeatures: 'Formato: PDF Interativo; Compatibilidade: Tablet/Desktop.',
    mainBenefits: 'Organização completa e design minimalista focado em resultados.'
  }
];

interface StoreProps {
  formatPrice: (p: number) => string;
}

const Store: React.FC<StoreProps> = ({ formatPrice }) => {
  const [showListingForm, setShowListingForm] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: Photo, 3: AI Selection
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    technicalFeatures: '',
    mainBenefits: '',
    location: '',
    units: '',
    deliveryTime: '',
    price: ''
  });

  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setOriginalPhoto(base64);
        setStep(3);
        setIsGeneratingIA(true);
        
        // Extrair apenas os dados base64 (removendo o prefixo data:image/...)
        const base64Data = base64.split(',')[1];
        const suggestion = await generateProductImageSuggestion(base64Data, formData.name, file.type);
        
        setAiSuggestion(suggestion);
        setIsGeneratingIA(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      seller: 'Tu (Vendedor)',
      imageUrl: selectedPhoto || originalPhoto || `https://picsum.photos/seed/${formData.name}/500/500`,
      verified: false,
      description: formData.description,
      technicalFeatures: formData.technicalFeatures,
      mainBenefits: formData.mainBenefits
    };
    setProducts([newProduct, ...products]);
    resetForm();
  };

  const resetForm = () => {
    setShowListingForm(false);
    setStep(1);
    setFormData({ 
      name: '', 
      type: '', 
      description: '', 
      technicalFeatures: '', 
      mainBenefits: '', 
      location: '', 
      units: '', 
      deliveryTime: '', 
      price: '' 
    });
    setOriginalPhoto(null);
    setAiSuggestion(null);
    setSelectedPhoto(null);
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.seller.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (showListingForm) {
    return (
      <div className="py-6 space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-24">
        <div className="flex items-center space-x-4">
          <button 
            onClick={resetForm}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-2xl font-black tracking-tighter uppercase">Divulgar Produto</h2>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nome do Produto</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all" placeholder="Ex: Artesanato de Madeira" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tipo</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all">
                    <option value="">Selecionar</option>
                    <option value="fisico">Físico</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Preço (Kz)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Descrição Geral</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all resize-none" placeholder="Uma breve visão geral..." />
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#E41B17] uppercase tracking-widest mb-1 ml-1">Características Técnicas</label>
                  <textarea name="technicalFeatures" value={formData.technicalFeatures} onChange={handleInputChange} rows={3} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all resize-none" placeholder="Especificações, materiais, dimensões, etc." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#FFCC00] uppercase tracking-widest mb-1 ml-1">Benefícios Principais</label>
                  <textarea name="mainBenefits" value={formData.mainBenefits} onChange={handleInputChange} rows={3} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E41B17] transition-all resize-none" placeholder="Por que o cliente deve comprar este produto?" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Localização</label>
                  <input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm" placeholder="Luanda..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Unidades</label>
                  <input type="number" name="units" value={formData.units} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Prazo de Entrega</label>
                <input name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange} className="w-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm" placeholder="Ex: 24h" />
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.price}
              className="w-full py-4 bg-[#E41B17] text-white font-black rounded-3xl text-sm shadow-lg disabled:bg-gray-200 transition-all"
            >
              PRÓXIMO: FOTOGRAFAR
            </button>
          </div>
        )}

        {/* Step 2: Camera Capture */}
        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 text-center py-10">
            <div className="w-48 h-48 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 mx-auto flex items-center justify-center text-[#E41B17]">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black">Tire uma foto do seu produto</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Fotos reais ajudam na confiança. A nossa IA cuidará do resto.</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoCapture}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2.5rem] shadow-xl active:scale-95 transition-all"
            >
              ABRIR CÂMERA
            </button>
          </div>
        )}

        {/* Step 3: AI Selection */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="text-center">
              <h3 className="text-xl font-black">Escolha a melhor apresentação</h3>
              <p className="text-sm text-gray-500">Selecione a foto que será exibida no mercado.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Original Photo */}
              <div 
                onClick={() => setSelectedPhoto(originalPhoto)}
                className={`relative rounded-[2.5rem] overflow-hidden border-4 transition-all cursor-pointer ${selectedPhoto === originalPhoto ? 'border-[#E41B17] scale-[1.02]' : 'border-transparent opacity-70'}`}
              >
                <img src={originalPhoto!} className="w-full aspect-video object-cover" />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">FOTO ORIGINAL</div>
              </div>

              {/* AI Suggestion */}
              <div 
                onClick={() => aiSuggestion && setSelectedPhoto(aiSuggestion)}
                className={`relative rounded-[2.5rem] overflow-hidden border-4 transition-all cursor-pointer min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${selectedPhoto === aiSuggestion ? 'border-[#FFCC00] scale-[1.02]' : 'border-transparent opacity-70'}`}
              >
                {isGeneratingIA ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFCC00]">Estúdio IA a processar...</p>
                  </div>
                ) : aiSuggestion ? (
                  <>
                    <img src={aiSuggestion} className="w-full aspect-video object-cover" />
                    <div className="absolute top-4 left-4 bg-[#FFCC00] text-black text-[10px] font-black px-3 py-1 rounded-full">KIMBA AI STUDIO</div>
                  </>
                ) : (
                  <p className="text-xs font-bold text-gray-400">Falha ao gerar sugestão IA</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!selectedPhoto && !originalPhoto}
              className="w-full py-5 bg-[#E41B17] text-white font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-all mt-6"
            >
              FINALIZAR E DIVULGAR
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Mercado</h2>
        <div className="flex space-x-2">
           <button 
            onClick={() => setShowListingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#E41B17] text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/10"
           >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              <span>Vender</span>
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E41B17] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input 
          type="text" 
          placeholder="O que estás a procurar hoje?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17]/20 focus:bg-white dark:focus:bg-black rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-medium outline-none transition-all shadow-sm"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* AdBanner fixado abaixo da barra de pesquisa */}
      <AdBanner />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group cursor-pointer space-y-3">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all group-hover:shadow-lg">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.verified && (
                  <div className="absolute top-3 left-3 bg-[#FFCC00] p-1.5 rounded-full shadow-md">
                    <Icons.Check />
                  </div>
                )}
              </div>
              <div className="px-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {product.seller}
                </div>
                <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#E41B17] transition-colors">
                  {product.name}
                </h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-[#E41B17]">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum produto encontrado.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-[10px] font-black text-[#E41B17] uppercase tracking-widest hover:underline"
          >
            Limpar Pesquisa
          </button>
        </div>
      )}
    </div>
  );
};

export default Store;
