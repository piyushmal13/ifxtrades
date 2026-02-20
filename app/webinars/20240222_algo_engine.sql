create table public.algos (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  risk_level text check (risk_level in ('Low', 'Medium', 'High', 'Expert')),
  monthly_roi text,
  min_investment numeric,
  price numeric,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  primary key (id)
);

create table public.user_licenses (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users not null,
  algo_id uuid references public.algos not null,
  status text default 'active',
  purchased_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  primary key (id)
);