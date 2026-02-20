alter table public.webinars add column if not exists venue text;
alter table public.webinars add column if not exists hotel_sponsor text;
alter table public.webinars add column if not exists registration_deadline timestamp with time zone;

alter table public.webinar_speakers add column if not exists is_keynote boolean default false;