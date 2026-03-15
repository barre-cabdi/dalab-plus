-- Add short_id columns for businesses and customers
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS short_id SERIAL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS short_id SERIAL;

-- Add notification settings to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_sound text DEFAULT 'chime';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_duration integer DEFAULT 3;