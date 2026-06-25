import { supabase } from '../lib/supabase';

export async function createBooking(bookingData) {
  const { error } = await supabase
    .from('bookings')
    .insert([bookingData]);
  return { error };
}
