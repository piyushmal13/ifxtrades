create table public.speaker_applications (
  id uuid not null default gen_random_uuid(),
  full_name text not null,
  email text not null,
  linkedin_url text,
  bio text,
  expertise text,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  constraint speaker_applications_pkey primary key (id)
);