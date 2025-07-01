
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Charger les notifications existantes
    const fetchNotifications = async () => {
      try {
        setError(null);
        console.log('Chargement des notifications pour:', user.id);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des notifications:', error);
          throw new Error(`Impossible de charger les notifications: ${error.message}`);
        }

        console.log('Notifications chargées:', data?.length || 0);
        setNotifications(data as RealtimeNotification[] || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        const errorMessage = error instanceof Error ? error.message : 'Impossible de charger les notifications.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouvelle notification reçue:', payload.new);
          const newNotification = payload.new as RealtimeNotification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Afficher une toast pour les nouvelles notifications
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification mise à jour:', payload.new);
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id ? payload.new as RealtimeNotification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        throw new Error(`Impossible de marquer comme lu: ${error.message}`);
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Impossible de marquer la notification comme lue.',
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Erreur lors du marquage de toutes les notifications:', error);
        throw new Error(`Impossible de marquer toutes les notifications: ${error.message}`);
      }

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues.",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Impossible de marquer toutes les notifications.',
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw new Error(`Impossible de supprimer: ${error.message}`);
      }

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Impossible de supprimer la notification.',
        variant: "destructive",
      });
    }
  };

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: notifications.filter(n => !n.read).length
  };
}
