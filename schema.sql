-- Word Vault Multiplayer - Supabase SQL Editor: run entire file once.
-- API code alone holds the server secret. Browsers cannot read rooms, players,
-- or answers directly. The only anonymous-readable table is a room refresh signal.

create table if not exists public.vault_rooms (
  id uuid primary key default gen_random_uuid(),
  code varchar(6) not null unique,
  host_token_hash text not null,
  host_name varchar(24) not null default 'Teacher',
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'reveal', 'finished')),
  mode text not null default 'individual' check (mode in ('individual', 'teams')),
  question_count integer not null default 16 check (question_count in (16, 32)),
  question_index integer not null default 0 check (question_index >= 0),
  seconds_per_question integer not null default 30 check (seconds_per_question between 15 and 90),
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vault_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vault_rooms(id) on delete cascade,
  token_hash text not null unique,
  nickname varchar(24) not null,
  team text not null default 'A' check (team in ('A','B')),
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, nickname)
);
create index if not exists vault_players_room_idx on public.vault_players(room_id);

create table if not exists public.vault_answers (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.vault_rooms(id) on delete cascade,
  player_id uuid not null references public.vault_players(id) on delete cascade,
  question_index integer not null,
  choice integer not null check (choice between 0 and 3),
  correct boolean not null,
  points integer not null,
  answered_at timestamptz not null default now(),
  unique (player_id, question_index)
);
create index if not exists vault_answers_round_idx on public.vault_answers(room_id, question_index);

create table if not exists public.vault_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.vault_rooms(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists vault_events_room_idx on public.vault_events(room_id);

-- No direct anonymous access to sensitive tables, even if they're accidentally exposed.
alter table public.vault_rooms enable row level security;
alter table public.vault_players enable row level security;
alter table public.vault_answers enable row level security;
alter table public.vault_events enable row level security;
revoke all on public.vault_rooms, public.vault_players, public.vault_answers from anon, authenticated;
revoke all on public.vault_events from anon, authenticated;
grant select on public.vault_events to anon;
create policy "Public non-sensitive room notifications" on public.vault_events
  for select to anon using (true);

-- A single SQL transaction locks the room, preventing race-condition double-scoring
-- and stale answers across rounds. Only the Vercel server should call these functions.
create or replace function public.vault_submit(
  p_room uuid,
  p_player uuid,
  p_question integer,
  p_choice integer,
  p_correct_choice integer
) returns void language plpgsql security definer set search_path = public as $$
declare
  r public.vault_rooms%rowtype;
  pts integer;
begin
  select * into r from public.vault_rooms where id = p_room for update;
  if r.id is null or r.status <> 'playing' or r.question_index <> p_question then
    raise exception 'This question is no longer accepting answers';
  end if;
  if clock_timestamp() > r.question_started_at + make_interval(secs => r.seconds_per_question) then
    raise exception 'Time is up for this question';
  end if;
  if p_choice not between 0 and 3 or p_correct_choice not between 0 and 3 then
    raise exception 'Invalid answer choice';
  end if;
  if not exists (select 1 from public.vault_players where id = p_player and room_id = p_room) then
    raise exception 'Player not in room';
  end if;
  pts := case when p_choice <> p_correct_choice then 0
    when clock_timestamp() <= r.question_started_at + interval '10 seconds' then 15
    else 10 end;
  insert into public.vault_answers(room_id, player_id, question_index, choice, correct, points)
    values (p_room,p_player,p_question,p_choice,p_choice=p_correct_choice,pts);
  insert into public.vault_events(room_id) values (p_room);
exception when unique_violation then
  raise exception 'You already answered this question';
end;
$$;

create or replace function public.vault_control(p_room uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.vault_rooms%rowtype;
begin
  select * into r from public.vault_rooms where id = p_room for update;
  if r.id is null then raise exception 'Room not found'; end if;
  if p_action = 'start' then
    if r.status <> 'lobby' then raise exception 'Game already started'; end if;
    if not exists (select 1 from public.vault_players where room_id = p_room) then
      raise exception 'At least one student must join before starting';
    end if;
    update public.vault_rooms set status='playing', question_started_at=clock_timestamp()
      where id=p_room;
  elsif p_action = 'reveal' then
    if r.status <> 'playing' then raise exception 'Nothing to reveal'; end if;
    update public.vault_players p set score = coalesce((
      select sum(a.points) from public.vault_answers a where a.player_id=p.id
    ),0) where p.room_id=p_room;
    update public.vault_rooms set status='reveal' where id=p_room;
  elsif p_action = 'next' then
    if r.status <> 'reveal' then raise exception 'Reveal the answer first'; end if;
    if r.question_index + 1 >= r.question_count then
      update public.vault_rooms set status='finished', question_index=r.question_count where id=p_room;
    else
      update public.vault_rooms set status='playing', question_index=r.question_index+1,
        question_started_at=clock_timestamp() where id=p_room;
    end if;
  elsif p_action = 'finish' then
    if r.status not in ('playing','reveal') then raise exception 'No active game'; end if;
    -- End early: award only answered rounds (also includes the live round).
    update public.vault_players p set score = coalesce((
      select sum(a.points) from public.vault_answers a where a.player_id=p.id
    ),0) where p.room_id=p_room;
    update public.vault_rooms set status='finished' where id=p_room;
  else
    raise exception 'Unknown host action';
  end if;
  insert into public.vault_events(room_id) values (p_room);
end;
$$;

-- Don't allow unauthenticated clients to directly invoke scoring/control routines.
revoke all on function public.vault_submit(uuid,uuid,integer,integer,integer) from public, anon, authenticated;
revoke all on function public.vault_control(uuid,text) from public, anon, authenticated;
grant execute on function public.vault_submit(uuid,uuid,integer,integer,integer) to service_role;
grant execute on function public.vault_control(uuid,text) to service_role;

-- Supabase Realtime: listen for INSERTS to this metadata-only table.
do $$ begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='vault_events') then
    alter publication supabase_realtime add table public.vault_events;
  end if;
end $$;
