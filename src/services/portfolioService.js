import { supabase } from '../lib/supabase';

export async function getPortfolioCategories() {
  const { data, error } = await supabase
    .from('portfolio_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  return { data, error };
}

export async function getAllCategories() {
  const { data } = await getPortfolioCategories();
  return data ? data.map((c) => c.slug) : [];
}

export async function getPortfolioItems(category) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('date', { ascending: false });

  return { data, error };
}

export async function getPortfolioItem(id) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}
