import { supabase } from '../lib/supabase';

export async function getBlockedHours(dateString) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-calendar-availability`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: dateString }),
    });
    if (!res.ok) return { data: [], error: new Error(`HTTP ${res.status}`) };
    const json = await res.json();
    return { data: Array.isArray(json) ? json : (json.blockedHours ?? []), error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}
