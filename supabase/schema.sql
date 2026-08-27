-- Çete Savaşları / tariklab.com — Supabase şema
-- SQL Editor'de TEK SEFERDE çalıştır.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_username text not null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  constraint profiles_username_len check (char_length(username) between 3 and 24)
);

create unique index if not exists profiles_username_unique
  on public.profiles (username);

create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  progress bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "saves own read" on public.saves;
create policy "saves own read"
  on public.saves for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
begin
  uname := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));
  if uname is null or char_length(uname) < 3 then
    raise exception 'USERNAME_REQUIRED';
  end if;
  insert into public.profiles (id, username, display_username, email_verified)
  values (
    new.id,
    uname,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_username'), ''), uname),
    new.email_confirmed_at is not null
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_profile_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set email_verified = (new.email_confirmed_at is not null)
    where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_verified on auth.users;
create trigger on_auth_user_verified
  after update of email_confirmed_at on auth.users
  for each row execute function public.sync_profile_verified();

create or replace function public.username_taken(u text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where username = lower(trim(u))
  );
$$;

create or replace function public.email_for_username(u text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select au.email::text
  from public.profiles p
  join auth.users au on au.id = p.id
  where p.username = lower(trim(u))
  limit 1;
$$;

create or replace function public.upsert_save(p_state jsonb, p_progress bigint)
returns table (state jsonb, progress bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = uid and p.email_verified
  ) then
    raise exception 'EMAIL_NOT_VERIFIED';
  end if;
  insert into public.saves (user_id, state, progress, updated_at)
  values (uid, p_state, p_progress, now())
  on conflict (user_id) do update
    set state = excluded.state,
        progress = excluded.progress,
        updated_at = now()
    where public.saves.progress <= excluded.progress;
  return query select s.state, s.progress from public.saves s where s.user_id = uid;
end;
$$;

create or replace function public.delete_own_save()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.saves where user_id = auth.uid();
$$;

revoke all on function public.username_taken(text) from public;
revoke all on function public.email_for_username(text) from public;
revoke all on function public.upsert_save(jsonb, bigint) from public;
revoke all on function public.delete_own_save() from public;

grant execute on function public.username_taken(text) to anon, authenticated;
grant execute on function public.email_for_username(text) to anon, authenticated;
grant execute on function public.upsert_save(jsonb, bigint) to authenticated;
grant execute on function public.delete_own_save() to authenticated;
