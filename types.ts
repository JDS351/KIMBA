
export enum View {
  NEWS = 'NEWS',
  CONTENTS = 'CONTENTS',
  STORE = 'STORE',
  REAL_ESTATE = 'REAL_ESTATE',
  SERVICES = 'SERVICES',
  PROFILE = 'PROFILE',
  ONBOARDING = 'ONBOARDING',
  WALLET = 'WALLET',
  INVEST = 'INVEST'
}

export type Currency = 'AOA' | 'USD';
export type NewsScope = 'Nacional' | 'Internacional';
export type NotificationStatus = 'notificar' | 'silenciar';

export interface Interest {
  id: string;
  label: string;
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  category: string;
  imageUrl: string;
  timestamp: string;
  isVerified: boolean;
  groundingSources?: GroundingChunk[];
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: 'BODIVA' | 'Internacional' | 'Crypto' | 'Commodity';
  category?: 'ETF' | 'Moeda' | 'Matéria-Prima';
  description?: string;
  volume24h?: string;
  high24h?: number;
  low24h?: number;
  marketCap?: string;
  sourceUrl: string;
  providerName: string;
}

export interface InvestmentInsight {
  title: string;
  analysis: string;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto';
  recommendation: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: number | 'Gratuito';
  rating: number;
  imageUrl: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  seller: string;
  imageUrl: string;
  verified: boolean;
  description?: string;
  technicalFeatures?: string;
  mainBenefits?: string;
}

export interface Property {
  id: string;
  title: string;
  type: 'Casa' | 'Apartamento' | 'Terreno' | 'Comercial';
  status: 'Venda' | 'Aluguer';
  price: number;
  location: string;
  province: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl: string;
  seller: string;
  verified: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text?: string; inlineData?: { data: string; mimeType: string } }[];
  isThinking?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  howItWorks: string;
  price: number;
  duration: string;
  imageUrl: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  province: string;
  rating: number;
  totalRatings: number;
  completedJobs: number;
  imageUrl: string;
  phone: string;
  whatsapp: string;
  bio: string;
  catalog: ServiceItem[];
}

export interface HiredService {
  id: string;
  serviceName: string;
  providerName: string;
  price: number;
  date: string;
  status: 'retido' | 'concluido' | 'cancelado';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  description: string;
  date: string;
  timestamp: number;
}
