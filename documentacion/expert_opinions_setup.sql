-- Expert Opinions Feature - Database Setup
-- Run this SQL in your Supabase SQL Editor to enable the expert opinions feature

-- Create expert_opinions table
create table if not exists public.expert_opinions (
  id uuid primary key default gen_random_uuid(),
  message_id text not null,
  expert_id uuid references auth.users(id) on delete cascade not null,
  opinion_text text not null,
  rating integer check (rating >= 1 and rating <= 5),
  helpful_votes integer default 0,
  unhelpful_votes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.expert_opinions enable row level security;

-- RLS Policies
-- Anyone can view opinions
create policy "Anyone can view expert opinions"
  on public.expert_opinions
  for select
  to authenticated
  using (true);

-- Authenticated users can create opinions
create policy "Authenticated users can create opinions"
  on public.expert_opinions
  for insert
  to authenticated
  with check (auth.uid() = expert_id);

-- Users can update any opinion (for ratings and votes)
create policy "Users can update any opinion for ratings"
  on public.expert_opinions
  for update
  to authenticated
  using (true);

-- Create indexes for faster queries
create index if not exists expert_opinions_message_id_idx on public.expert_opinions(message_id);
create index if not exists expert_opinions_expert_id_idx on public.expert_opinions(expert_id);
create index if not exists expert_opinions_created_at_idx on public.expert_opinions(created_at desc);

-- Add trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_expert_opinions_updated_at
  before update on public.expert_opinions
  for each row
  execute function public.update_updated_at_column();

-- Instructions:
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase Dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. The expert opinions feature will be ready to use
