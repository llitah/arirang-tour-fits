-- Habilita o Realtime (usado pelo app para uma pessoa ver na hora o que a
-- outra adicionou/votou/comentou, sem precisar recarregar a página).
alter publication supabase_realtime add table
  public.looks,
  public.look_images,
  public.products,
  public.votes,
  public.comments,
  public.favorites;
