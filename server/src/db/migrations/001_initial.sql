create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  google_subject text not null unique,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  language text not null default 'ru' check (language in ('ru', 'ro', 'en')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  voice_enabled boolean not null default true,
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);

create table workout_history (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  complex_id text not null,
  exercise_ids jsonb not null,
  language text not null check (language in ('ru', 'ro', 'en')),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  created_at timestamptz not null default now()
);

create index workout_history_user_completed_idx
  on workout_history (user_id, completed_at desc);

create table guest_installations (
  id uuid primary key,
  timezone text not null default 'UTC',
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reminder_schedules (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references guest_installations(id) on delete cascade,
  local_time time not null,
  enabled boolean not null default true,
  last_sent_local_date date,
  created_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references guest_installations(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
