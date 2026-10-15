import { supabase } from '../lib/supabase';
import { mediaUrl } from '../lib/mediaUrl';

/**
 * @typedef {import('../lib/database.types').ServiceRow} ServiceRow
 * @typedef {import('../lib/database.types').ServiceDetail} ServiceDetail
 */

/**
 * Resolves a MinIO object key to a public URL.
 * Delegates to the shared portfolio helper.
 *
 * @param {string | null | undefined} imageKey
 * @returns {string | null}
 */
export function serviceImageUrl(imageKey) {
  return mediaUrl(imageKey);
}

/**
 * Active services ordered by sort_order.
 *
 * @returns {Promise<{ data: ServiceRow[] | null, error: unknown }>}
 */
export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return { data, error };
}

/**
 * One active service with its pricing and gallery rows, or null.
 *
 * @param {string} slug
 * @returns {Promise<{ data: ServiceDetail | null, error: unknown }>}
 */
export async function fetchServiceBySlug(slug) {
  const { data, error } = await supabase
    .from('services')
    .select('*, service_pricing(*), service_gallery(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .order('sort_order', { referencedTable: 'service_pricing', ascending: true })
    .order('sort_order', { referencedTable: 'service_gallery', ascending: true })
    .maybeSingle();

  return { data, error };
}
