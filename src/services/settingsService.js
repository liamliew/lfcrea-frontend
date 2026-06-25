import { supabase } from '../lib/supabase';

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();
  return { data: data?.value ?? null, error };
}
