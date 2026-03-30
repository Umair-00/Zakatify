-- Enable pgvector extension for embedding similarity search
-- Run this in the Supabase SQL Editor

create extension if not exists vector;

-- Stores chunked zakat knowledge base with embeddings
create table public.zakat_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536) not null,
  source text not null check (source in ('book', 'rules')),
  source_location text,
  section_title text,
  chunk_index integer not null,
  token_count integer,
  created_at timestamptz default now()
);

-- Stores chat conversations per user
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_chat_conversations_user on public.chat_conversations(user_id);

-- Stores individual messages within a conversation
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamptz default now()
);

create index idx_chat_messages_conversation on public.chat_messages(conversation_id);

-- Vector similarity search function
create or replace function match_zakat_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  source text,
  source_location text,
  section_title text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    zc.id,
    zc.content,
    zc.source,
    zc.source_location,
    zc.section_title,
    1 - (zc.embedding <=> query_embedding) as similarity
  from public.zakat_chunks zc
  where 1 - (zc.embedding <=> query_embedding) > match_threshold
  order by zc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- HNSW index for fast similarity search
create index idx_zakat_chunks_embedding on public.zakat_chunks
  using hnsw (embedding vector_cosine_ops);

-- RLS policies
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Users can only access their own conversations
create policy "Users can view own conversations"
  on public.chat_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.chat_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.chat_conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.chat_conversations for delete
  using (auth.uid() = user_id);

-- Users can access messages through conversation ownership
create policy "Users can view messages in own conversations"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_conversations
      where id = chat_messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_conversations
      where id = chat_messages.conversation_id
      and user_id = auth.uid()
    )
  );

-- Auto-update updated_at on conversations
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update public.chat_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_chat_message_insert
  after insert on public.chat_messages
  for each row
  execute function update_conversation_timestamp();
