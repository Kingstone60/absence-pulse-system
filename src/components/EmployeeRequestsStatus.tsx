
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
  admin_comment: string;
  created_at: string;
}

const leaveTypeLabels = {
  annual: 'Congés annuels',
  sick: 'Congé maladie',
  maternity: 'Congé maternité',
  personal: 'Congé personnel',
  emergency: 'Congé d\'urgence',
  unpaid: 'Congé sans solde'
};

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  cancelled: 'Annulé'
};

export function EmployeeRequestsStatus() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    fetchUserRequests();

    // Écouter les mises à jour en temps réel
    const channel = supabase
      .channel('user-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Mise à jour des demandes utilisateur détectée');
          fetchUserRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      setError(null);
      console.log('Chargement des demandes de l\'utilisateur:', user.id);

      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        throw new Error(`Impossible de charger vos demandes: ${error.message}`);
      }

      console.log('Demandes utilisateur chargées:', data?.length || 0);
      setRequests(data || []);

    } catch (error) {
      console.error('Error fetching user requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de charger vos demandes.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Mes demandes de congé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="animate-spin" size={16} />
              Chargement...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Mes demandes de congé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-red-800 bg-red-50 p-4 rounded-lg">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">Erreur de chargement</p>
              <p className="text-sm">{error}</p>
              <Button 
                onClick={fetchUserRequests}
                size="sm"
                className="mt-2 bg-red-600 text-white hover:bg-red-700"
              >
                <RefreshCw size={14} className="mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Mes demandes de congé
        </CardTitle>
        <Button onClick={fetchUserRequests} variant="outline" size="sm">
          <RefreshCw size={14} className="mr-2" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Aucune demande de congé</p>
              <p className="text-sm">Créez votre première demande !</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">
                        {leaveTypeLabels[request.type as keyof typeof leaveTypeLabels] || request.type}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>
                          {new Date(request.start_date).toLocaleDateString('fr-FR')} - {new Date(request.end_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span>({calculateDuration(request.start_date, request.end_date)} jour(s))</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                {request.reason && (
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Motif:</strong> {request.reason}
                    </p>
                  </div>
                )}
                
                {request.admin_comment && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Commentaire administrateur:</strong> {request.admin_comment}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Soumis le {new Date(request.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
