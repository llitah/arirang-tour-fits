# Arirang Looks

App para Letícia e Stella organizarem, comparem e votarem em looks de shows
e viagens — com fotos, produtos/links de compra, comentários, notas de 1 a
10 e favoritos. Tudo fica salvo no **Supabase** (Postgres + Storage), então
nada depende do navegador: ao atualizar a página (ou abrir em outro
aparelho), os dados continuam lá.

Stack: Next.js (App Router) + React + TailwindCSS + Supabase + Vercel.

---

## 1. Configurar o Supabase

Você disse que já tem um projeto no Supabase — ótimo, só falta rodar as
migrations e criar o bucket.

1. Abra seu projeto em https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Rode, **nesta ordem**, o conteúdo de cada arquivo da pasta
   `supabase/migrations/`:
   1. `0001_init.sql` — cria as tabelas (`profiles`, `looks`, `look_images`,
      `products`, `votes`, `comments`, `favorites`) e os índices
   2. `0002_seed.sql` — insere os perfis **Letícia** e **Stella**
   3. `0003_policies.sql` — ativa Row Level Security e cria as policies
   4. `0004_storage.sql` — cria o bucket `looks` (público) e as policies de
      Storage
   5. `0005_realtime.sql` — habilita o Realtime nas tabelas (assim, quando
      uma pessoa adiciona/vota/comenta, a outra vê a atualização na hora,
      sem precisar recarregar)

   (Se preferir usar a CLI do Supabase: `supabase db push` com os arquivos
   dentro de `supabase/migrations/` também funciona, pois já seguem o
   padrão de nomes da CLI.)

4. Confirme que o bucket **looks** apareceu em **Storage** e está marcado
   como público.

5. Em **Settings → API**, copie:
   - **Project URL** → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Rodar localmente (opcional)

```bash
npm install
cp .env.example .env.local
# cole as duas variáveis do passo anterior em .env.local
npm run dev
```

Abra http://localhost:3000

---

## 3. Publicar / atualizar na Vercel

1. Suba este projeto para o repositório GitHub já conectado ao seu projeto
   Vercel (ou importe do zero em **Add New → Project**).
2. Em **Settings → Environment Variables**, garanta que existem:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Faça o deploy (push para a branch principal, ou **Deploy** manual).

Pronto — o mesmo link de sempre (`seu-projeto.vercel.app`) agora lê e
escreve direto no Supabase.

---

## Como funciona

- **Sem login/senha**: ao abrir o app pela primeira vez em um aparelho, a
  pessoa escolhe "Letícia" ou "Stella" — essa escolha fica no
  `localStorage` daquele navegador. Todo o resto (looks, fotos, votos,
  comentários, favoritos) é 100% Supabase.
- **Adicionar um look**: o formulário salva a linha em `looks`, envia cada
  foto para o bucket `looks` no Storage e grava as linhas em
  `look_images` (com a ordem escolhida no drag-and-drop) e `products`.
- **Buscar looks**: ao abrir a página, o app consulta a tabela `looks`
  (com `look_images`, `products`, `votes`, `comments`, `favorites`
  aninhados numa única query) e mantém tudo sincronizado via Supabase
  Realtime.
- **Votar**: 1 voto por pessoa por look, com nota de 1 a 10. Votar de novo
  atualiza o voto (`ON CONFLICT` na tabela `votes`), não duplica.
- **Excluir um look**: apaga as fotos do Storage e, por causa do
  `ON DELETE CASCADE`, o banco remove sozinho as linhas de `look_images`,
  `products`, `votes`, `comments` e `favorites` relacionadas.
- **Duplicar um look**: cria uma cópia com os mesmos dados/produtos/fotos
  (referenciando os mesmos arquivos no Storage), sem copiar comentários e
  votos.

---

## Segurança (RLS)

Todas as tabelas têm Row Level Security **ativado**, com policies em
`0003_policies.sql`. Como o app não tem uma tela de login de verdade (só a
escolha local do nome), as policies liberam leitura/escrita para a chave
anônima — é isso que permite Letícia e Stella usarem o app direto pelo
link, sem cadastro.

Se um dia vocês quiserem impedir, por exemplo, que uma pessoa edite/exclua
um look criado pela outra, o caminho é adicionar **Supabase Auth** (login
por e-mail/magic link) e trocar as policies para usar `auth.uid()` em vez
de `using (true)`. O restante do app (services, hooks, componentes) não
precisa mudar — só as policies e a tela de identificação.

---

## Estrutura do código

```
app/                     rotas do Next.js (App Router)
  layout.tsx             layout raiz + ToastProvider
  page.tsx                → renderiza <AppShell />
  globals.css             design system (cores, glass, animações)

components/              UI (React + Tailwind)
  AppShell.tsx            orquestrador: perfil, filtros, grid, modais
  PersonPicker.tsx         tela "quem é você"
  FiltersBar.tsx           busca + filtros + ordenação
  LookGrid.tsx / LookCard.tsx / LookCardSkeleton.tsx
  LookFormModal.tsx        criar/editar look (fotos, produtos, campos)
  LookDetailModal.tsx      ver look: nota, quem votou, produtos, comentários
  ImageUploader.tsx        upload múltiplo + drag-and-drop para reordenar
  ImageLightbox.tsx        zoom em tela cheia
  ProductsEditor.tsx       lista de produtos (marca, preço, link)
  ui/Toast.tsx             mensagens de sucesso/erro
  ui/ConfirmDialog.tsx     confirmação antes de excluir

hooks/
  useProfile.ts            perfil atual (Letícia/Stella) + localStorage
  useLooks.ts               lista de looks + filtros + Realtime

services/                 toda a comunicação com Supabase mora aqui
  looks.ts / images.ts / products.ts / votes.ts / comments.ts /
  favorites.ts / profiles.ts

types/database.ts         tipos TypeScript das tabelas
lib/supabase/client.ts    cliente Supabase (browser)
lib/theme.ts               cores do design
lib/utils/format.ts        formatação de preço/data

supabase/migrations/      SQL: tabelas, policies, bucket, realtime
```

Nenhum dado de look/voto/comentário/favorito fica em `useState` como fonte
de verdade — o estado em React é sempre um reflexo do que está no
Supabase (recarregado após cada gravação e também via Realtime).
