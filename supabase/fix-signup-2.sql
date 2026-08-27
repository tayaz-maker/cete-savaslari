-- Signup 500 fix: auth.users trigger'ını kapat.
-- Profil, kullanıcı mail onaylayıp girince oluşur.

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_verified on auth.users;

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_username text;
alter table public.profiles add column if not exists email_verified boolean not null default false;

-- boş username satırı kalmasın diye gevşet (eski tablo farklıysa)
alter table public.profiles alter column username drop not null;
alter table public.profiles alter column display_username drop not null;

grant usage on schema public to anon, authenticated, supabase_auth_admin;
grant select on table public.profiles to anon, authenticated, supabase_auth_admin;
grant insert, update on table public.profiles to authenticated, supabase_auth_admin;
grant select, insert, update, delete on table public.saves to authenticated;

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
  ) or exists(
    select 1 from auth.users
    where lower(coalesce(raw_user_meta_data->>'username','')) = lower(trim(u))
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
  from auth.users au
  left join public.profiles p on p.id = au.id
  where p.username = lower(trim(u))
     or lower(coalesce(au.raw_user_meta_data->>'username','')) = lower(trim(u))
  limit 1;
$$;

create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  meta jsonb;
  mail text;
  confirmed boolean;
  uname text;
begin
  if uid is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  select raw_user_meta_data, email, (email_confirmed_at is not null)
    into meta, mail, confirmed
  from auth.users where id = uid;
  uname := lower(trim(coalesce(meta->>'username', '')));
  if uname is null or char_length(uname) < 3 then
    uname := lower(split_part(coalesce(mail, 'oyuncu'), '@', 1));
  end if;
  uname := substr(regexp_replace(uname, '[^a-z0-9._-]', '', 'g'), 1, 24);
  if char_length(uname) < 3 then
    uname := 'u' || substr(replace(uid::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, username, display_username, email_verified)
  values (
    uid,
    uname,
    coalesce(nullif(trim(meta->>'display_username'), ''), uname),
    coalesce(confirmed, false)
  )
  on conflict (id) do update
    set email_verified = excluded.email_verified,
        username = coalesce(public.profiles.username, excluded.username),
        display_username = coalesce(public.profiles.display_username, excluded.display_username);
end;
$$;

grant execute on function public.username_taken(text) to anon, authenticated;
grant execute on function public.email_for_username(text) to anon, authenticated;
grant execute on function public.ensure_profile() to authenticated;
