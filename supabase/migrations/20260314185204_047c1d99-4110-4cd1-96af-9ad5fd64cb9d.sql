
-- Add certification to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_certified boolean DEFAULT false;

-- Add video column to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS video text DEFAULT null;

-- Create storage bucket for ad media
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-media', 'ad-media', true) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- RLS policies for ad-media bucket
CREATE POLICY "Anyone can view ad media" ON storage.objects FOR SELECT USING (bucket_id = 'ad-media');
CREATE POLICY "Authenticated users can upload ad media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ad-media');
CREATE POLICY "Users can delete own ad media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ad-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
