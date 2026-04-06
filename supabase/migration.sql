-- ============================================================
-- Recipe Pilot — Supabase Database Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  revenue_cat_id text,
  daily_requests int default 0,
  last_request_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Usage limit check function (called from app via RPC)
create or replace function public.check_usage_limit(user_uuid uuid)
returns json as $$
declare
  profile_row public.profiles%rowtype;
  max_free int := 10;
  today date := current_date;
begin
  select * into profile_row from public.profiles where id = user_uuid;

  if not found then
    return json_build_object('allowed', false, 'remaining', 0, 'is_premium', false);
  end if;

  -- Premium users have unlimited access
  if profile_row.is_premium then
    return json_build_object('allowed', true, 'remaining', -1, 'is_premium', true);
  end if;

  -- Reset count if it's a new day
  if profile_row.last_request_date is null or profile_row.last_request_date < today then
    update public.profiles
      set daily_requests = 1, last_request_date = today, updated_at = now()
      where id = user_uuid;
    return json_build_object('allowed', true, 'remaining', max_free - 1, 'is_premium', false);
  end if;

  -- Check limit
  if profile_row.daily_requests >= max_free then
    return json_build_object('allowed', false, 'remaining', 0, 'is_premium', false);
  end if;

  -- Increment usage
  update public.profiles
    set daily_requests = daily_requests + 1, updated_at = now()
    where id = user_uuid;

  return json_build_object(
    'allowed', true,
    'remaining', max_free - profile_row.daily_requests - 1,
    'is_premium', false
  );
end;
$$ language plpgsql security definer;

-- 4. Saved recipes table (cloud sync)
create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_name text not null,
  cuisine text not null,
  recipe_data jsonb not null,
  created_at timestamptz default now(),
  unique (user_id, recipe_name, cuisine)
);

alter table public.saved_recipes enable row level security;

create policy "Users can read own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);
