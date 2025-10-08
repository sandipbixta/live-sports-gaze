-- Add the specific user as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e8b3158-ae9e-456b-99c6-9d58c57cd475', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;