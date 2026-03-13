
-- Fix permissive INSERT policy on notifications
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
