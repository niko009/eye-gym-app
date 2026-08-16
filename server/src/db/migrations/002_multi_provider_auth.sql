alter table users alter column email drop not null;

create table auth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null check (provider in ('google', 'telegram')),
  provider_subject text not null,
  email text,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subject),
  unique (user_id, provider)
);

insert into auth_identities (user_id, provider, provider_subject, email, display_name)
select id, 'google', google_subject, email, display_name from users;

alter table users drop column google_subject;

alter table user_settings
  add column analytics_consent text not null default 'unknown'
    check (analytics_consent in ('unknown', 'granted', 'denied'));

create index auth_sessions_user_expires_idx on auth_sessions (user_id, expires_at);

alter table reminder_schedules
  add column user_id uuid references users(id) on delete cascade,
  add column channel text not null default 'web_push' check (channel in ('web_push', 'telegram')),
  add column timezone text not null default 'UTC';

alter table reminder_schedules alter column installation_id drop not null;
alter table reminder_schedules add constraint reminder_schedule_owner_check
  check ((installation_id is not null and user_id is null) or (installation_id is null and user_id is not null));

create index reminder_schedules_due_idx on reminder_schedules (enabled, channel, local_time);
create index reminder_schedules_user_idx on reminder_schedules (user_id);

create table telegram_deliveries (
  user_id uuid primary key references users(id) on delete cascade,
  chat_id bigint not null unique,
  enabled boolean not null default false,
  last_error text,
  updated_at timestamptz not null default now()
);
