# Arirang Looks

App para Letícia e Stella planejarem os looks dos shows 28, 30 e 31 —
com fotos, comentários, votação, comparação, wishlist, checklist e moodboard.

Este projeto é um app Next.js normal (não é mais um "artifact" do Claude).
Os dados ficam salvos num banco Redis gratuito, então tudo que uma pessoa
adicionar aparece para a outra ao abrir ou atualizar o site.

## 1. Criar o banco de dados (gratuito, ~2 minutos)

1. Crie uma conta em https://upstash.com (pode entrar com GitHub/Google).
2. Crie um banco **Redis** novo (região mais próxima do Brasil, ex: `us-east-1` ou `sa-east-1` se disponível).
3. Na página do banco, copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

(Alternativa: dentro da própria Vercel, aba **Storage → Marketplace Database Providers → Upstash**, que já cria o banco e preenche as variáveis de ambiente automaticamente no projeto.)

## 2. Rodar localmente (opcional)

```bash
npm install
cp .env.example .env.local
# cole as duas variáveis do passo 1 dentro de .env.local
npm run dev
```

Abra http://localhost:3000

## 3. Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub (pode ser privado).
2. Em https://vercel.com, clique em **Add New → Project** e importe esse repositório.
3. Em **Environment Variables**, adicione:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   (os mesmos valores do passo 1 — se você usou a integração Upstash pela própria Vercel, isso já estará preenchido.)
4. Clique em **Deploy**.

Pronto — a Vercel te dá uma URL (algo como `arirang-looks.vercel.app`).
Mandem esse link para as duas usarem no celular ou computador.

## Como funciona o acesso das duas pessoas

- Não há senha/login: na primeira vez que abrir o link, cada uma escolhe
  "Letícia" ou "Stella" na tela inicial — essa escolha fica salva só
  naquele aparelho (`localStorage`), então não precisa escolher de novo.
- Todos os looks, comentários, votos, wishlist, checklist e moodboard ficam
  no banco Redis (compartilhado), então o que uma pessoa criar aparece
  para a outra.
- O app atualiza sozinho ao voltar para a aba/app e a cada ~20 segundos;
  também há um botão de atualizar (ícone de seta circular) no topo para
  forçar a sincronização na hora.

## Fotos da galeria

As fotos enviadas pela galeria são comprimidas no navegador e guardadas
no mesmo banco Redis (uma chave por imagem), então também ficam
disponíveis para as duas. Bancos gratuitos do Upstash têm limite de
armazenamento (normalmente 256 MB) — suficiente para várias centenas de
fotos comprimidas, mas evitem subir vídeos ou fotos muito pesadas sem
necessidade.
