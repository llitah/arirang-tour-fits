import { Redis } from "@upstash/redis";

// Aceita tanto as variáveis padrão do Upstash quanto as que a Vercel
// injeta automaticamente quando você conecta um banco "KV" pelo marketplace.
const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";

const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

if (!url || !token) {
  console.warn(
    "[arirang-looks] Redis não configurado. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN nas variáveis de ambiente do projeto."
  );
}

export const redis = new Redis({ url, token });
