
import { createClient } from '@supabase/supabase-js';
import { HiredService, Property, Currency, Transaction } from '../types';

// Nota: Em produção, estas chaves devem vir de process.env
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

// Mock de verificação para evitar erros se as chaves não estiverem configuradas
const isSupabaseConfigured = supabaseUrl !== 'https://your-project.supabase.co';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function getUserProfile(email: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
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
    // Fallback local se não houver Supabase
    localStorage.setItem('kimba_profile', JSON.stringify(profile));
    return profile;
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'email' })
    .select()
    .single();
  return data;
}

export async function syncHiredServices(email: string, services: HiredService[]) {
  if (!supabase) return;
  await supabase
    .from('hired_services')
    .upsert(services.map(s => ({ ...s, user_email: email })), { onConflict: 'id' });
}

export async function syncTransactions(email: string, transactions: Transaction[]) {
  if (!supabase) return;
  await supabase
    .from('transactions')
    .upsert(transactions.map(t => ({ ...t, user_email: email })), { onConflict: 'id' });
}

export async function getProperties() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
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
