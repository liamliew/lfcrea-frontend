import { supabase } from '../lib/supabase';

export async function getNavItems() {
  const { data, error } = await supabase
    .from('nav_items')
    .select('*')
    .order('sort_order', { ascending: true });
  return { data, error };
}
