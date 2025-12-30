
import { createClient } from '@supabase/supabase-js';
import { HiredService, Property, Currency, Transaction, Product } from '../types';

// Em ambiente de produção, estas variáveis devem ser configuradas externamente.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Mock de verificação para evitar erros se as chaves não estiverem configuradas
const isSupabaseConfigured = supabaseUrl !== 'https://your-project.supabase.co';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Perfis de Utilizador
 */
export async function getUserProfile(email: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  if (error) console.error("Erro ao buscar perfil:", error);
  return data;
}

export async function upsertUserProfile(profile: { 
  email: string, 
  name: string, 
  interests: string[], 
  balance: number, 
  currency: Currency,
  favorites?: string[]
}) {
  if (!supabase) {
    localStorage.setItem('kimba_profile', JSON.stringify(profile));
    return profile;
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'email' })
    .select()
    .single();
  if (error) console.error("Erro ao upsert perfil:", error);
  return data;
}

/**
 * Mercado / Loja
 */
export async function getProducts() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error("Erro ao buscar produtos:", error);
  return data;
}

export async function upsertProduct(product: Product) {
  if (!supabase) return product;
  const { data, error } = await supabase
    .from('products')
    .upsert([product], { onConflict: 'id' })
    .select()
    .single();
  if (error) console.error("Erro ao salvar produto:", error);
  return data;
}

/**
 * Imobiliário
 */
export async function getProperties() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error("Erro ao buscar propriedades:", error);
  return data;
}

export async function createProperty(property: Omit<Property, 'id'>) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();
  return data;
}

/**
 * Serviços e Transações
 */
export async function syncHiredServices(email: string, services: HiredService[]) {
  if (!supabase) return;
  const { error } = await supabase
    .from('hired_services')
    .upsert(services.map(s => ({ ...s, user_email: email })), { onConflict: 'id' });
  if (error) console.error("Erro ao sincronizar serviços:", error);
}

export async function syncTransactions(email: string, transactions: Transaction[]) {
  if (!supabase) return;
  const { error } = await supabase
    .from('transactions')
    .upsert(transactions.map(t => ({ ...t, user_email: email })), { onConflict: 'id' });
  if (error) console.error("Erro ao sincronizar transações:", error);
}
