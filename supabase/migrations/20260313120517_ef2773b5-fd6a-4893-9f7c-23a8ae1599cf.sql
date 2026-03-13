
-- User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  name text NOT NULL DEFAULT '',
  pseudo text,
  email text NOT NULL,
  phone text,
  city text DEFAULT 'Brazzaville',
  avatar text,
  gender text,
  role text DEFAULT 'particulier',
  company_name text,
  birth_date text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ads table
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price integer DEFAULT 0,
  currency text DEFAULT 'FCFA',
  category text NOT NULL,
  city text NOT NULL,
  images text[] DEFAULT '{}',
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  user_phone text,
  is_premium boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  views integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ad_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
  ad_title text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- History table
CREATE TABLE public.history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  ad_title text,
  ad_image text,
  ad_price integer DEFAULT 0,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- Profiles: anyone authenticated can read, users update own
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: only read via has_role function, admins can manage
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Ads: public read for active, owners CRUD, admins can update
CREATE POLICY "Anyone can read active ads" ON public.ads FOR SELECT TO authenticated USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create ads" ON public.ads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ads" ON public.ads FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own ads" ON public.ads FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Favorites: users manage own
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Conversations: participants only
CREATE POLICY "Participants can read conversations" ON public.conversations FOR SELECT TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Messages: conversation participants
CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update message read status" ON public.messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);

-- Reviews: public read, authenticated insert
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Reports: users create own, admins read all
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins can read reports" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notifications: users manage own
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- History: users manage own
CREATE POLICY "Users manage own history" ON public.history FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
