
-- Créer une table pour les notifications en temps réel
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('request', 'approval', 'rejection', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient seulement leurs notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour que les admins puissent créer des notifications
CREATE POLICY "Admins can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour que les utilisateurs puissent mettre à jour leurs notifications (marquer comme lues)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Créer un bucket pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Politique de stockage pour permettre aux utilisateurs de télécharger leurs avatars
CREATE POLICY "Users can upload their own avatars" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour voir les avatars publiquement
CREATE POLICY "Public avatar access" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'avatars');

-- Politique pour que les utilisateurs puissent mettre à jour leurs avatars
CREATE POLICY "Users can update their own avatars" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour que les utilisateurs puissent supprimer leurs avatars
CREATE POLICY "Users can delete their own avatars" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Activer les mises à jour en temps réel pour les notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Activer les mises à jour en temps réel pour les demandes de congés
ALTER TABLE public.leave_requests REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.leave_requests;

-- Fonction pour créer automatiquement une notification
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (target_user_id, notification_type, notification_title, notification_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
