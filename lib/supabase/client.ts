import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso aparece no console do navegador se as variáveis de ambiente
  // não estiverem configuradas na Vercel (ou no .env.local em dev).
  // eslint-disable-next-line no-console
  console.warn(
    "[arirang-looks] Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Cliente único, usado direto no navegador (não há login/sessão de Auth
// neste app, então persistSession fica desligado).
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: { persistSession: false },
});
