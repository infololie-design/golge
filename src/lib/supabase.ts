import { createClient } from '@supabase/supabase-js';

// Vercel'in ayarlarından bu bilgileri çekeceğiz (Güvenlik için)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
