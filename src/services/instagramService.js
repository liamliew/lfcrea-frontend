import { supabase } from '../lib/supabase';

export async function getInstagramPosts() {
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  return { data, error };
}
