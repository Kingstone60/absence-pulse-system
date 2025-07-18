
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Check, X, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataExport } from './DataExport';

interface SupabaseLeaveRequest {
  id: string;
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  admin_comment: string;
  approved_by: string;
  created_at: string;
  profiles: {
    name: string;
    position: string;
    department: string;
  } | null;
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

export function RequestsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [requests, setRequests] = useState<SupabaseLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    fetchRequests();

    // Écouter les mises à jour en temps réel
    const channel = supabase
      .channel('leave-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        () => {
          console.log('Nouvelle mise à jour détectée dans leave_requests');
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const fetchRequests = async () => {
    try {
      setError(null);
      console.log('Chargement des demandes de congé...');
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles!fk_leave_requests_user_id (name, position, department)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        throw new Error(`Impossible de charger les demandes: ${error.message}`);
      }
      
      console.log('Demandes chargées:', data?.length || 0);
      
      // Type assertion sûre
      const typedData = (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && 'name' in item.profiles
          ? item.profiles as { name: string; position: string; department: string }
          : null
      })) as SupabaseLeaveRequest[];
      
      setRequests(typedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de charger les demandes.';
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

  const createNotification = async (userId: string, type: string, title: string, message: string) => {
    try {
      console.log('Création de notification pour:', userId, type, title);
      await supabase.rpc('create_notification', {
        target_user_id: userId,
        notification_type: type,
        notification_title: title,
        notification_message: message
      });
      console.log('Notification créée avec succès');
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!isAdmin || processingRequest) return;

    try {
      setProcessingRequest(requestId);
      const request = requests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Demande introuvable');
      }

      console.log('Approbation de la demande:', requestId);

      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved',
          approved_by: user.id,
          admin_comment: 'Demande approuvée par l\'administrateur'
        })
        .eq('id', requestId);

      if (error) {
        console.error('Erreur lors de l\'approbation:', error);
        throw new Error(`Erreur lors de l'approbation: ${error.message}`);
      }

      // Créer une notification
      await createNotification(
        request.user_id,
        'approval',
        'Demande approuvée',
        `Votre demande de ${leaveTypeLabels[request.type as keyof typeof leaveTypeLabels]} du ${new Date(request.start_date).toLocaleDateString('fr-FR')} au ${new Date(request.end_date).toLocaleDateString('fr-FR')} a été approuvée.`
      );

      toast({
        title: "Demande approuvée",
        description: `La demande de ${request.profiles?.name || 'l\'employé'} a été approuvée avec succès.`,
      });

      // Actualiser les données
      await fetchRequests();

    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible d\'approuver la demande.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!isAdmin || processingRequest) return;

    try {
      setProcessingRequest(requestId);
      const request = requests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Demande introuvable');
      }

      console.log('Rejet de la demande:', requestId);

      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'rejected',
          admin_comment: 'Demande refusée par l\'administrateur'
        })
        .eq('id', requestId);

      if (error) {
        console.error('Erreur lors du rejet:', error);
        throw new Error(`Erreur lors du rejet: ${error.message}`);
      }

      // Créer une notification
      await createNotification(
        request.user_id,
        'rejection',
        'Demande refusée',
        `Votre demande de ${leaveTypeLabels[request.type as keyof typeof leaveTypeLabels]} du ${new Date(request.start_date).toLocaleDateString('fr-FR')} au ${new Date(request.end_date).toLocaleDateString('fr-FR')} a été refusée.`
      );

      toast({
        title: "Demande refusée",
        description: `La demande de ${request.profiles?.name || 'l\'employé'} a été refusée.`,
      });

      // Actualiser les données
      await fetchRequests();

    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de refuser la demande.';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.profiles?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
                             request.profiles?.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Seuls les administrateurs peuvent gérer les demandes.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-lg">
          <RefreshCw className="animate-spin" size={20} />
          Chargement des demandes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des demandes</h1>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-semibold">Erreur de chargement</h3>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={fetchRequests}
                  className="mt-2 bg-red-600 text-white hover:bg-red-700"
                  size="sm"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtenir les départements uniques
  const departments = ['Tous les départements', ...Array.from(new Set(requests.map(req => req.profiles?.department).filter(Boolean)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des demandes</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchRequests} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
          <div className="text-sm text-gray-500">
            {filteredRequests.length} demande(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Export Component */}
      <DataExport />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Rechercher par nom ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept === 'Tous les départements' ? 'all' : dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de congés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-600">Employé</th>
                  <th className="text-left p-3 font-medium text-gray-600">Département</th>
                  <th className="text-left p-3 font-medium text-gray-600">Type</th>
                  <th className="text-left p-3 font-medium text-gray-600">Période</th>
                  <th className="text-left p-3 font-medium text-gray-600">Durée</th>
                  <th className="text-left p-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left p-3 font-medium text-gray-600">Soumis le</th>
                  <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{request.profiles?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{request.profiles?.position || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{request.profiles?.department || 'N/A'}</td>
                    <td className="p-3">
                      <span className="text-sm">
                        {leaveTypeLabels[request.type as keyof typeof leaveTypeLabels] || request.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <p>{new Date(request.start_date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-gray-500">au {new Date(request.end_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {calculateDuration(request.start_date, request.end_date)} jour(s)
                    </td>
                    <td className="p-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              title="Approuver la demande"
                              disabled={processingRequest === request.id}
                            >
                              {processingRequest === request.id ? (
                                <RefreshCw className="animate-spin" size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              title="Refuser la demande"
                              disabled={processingRequest === request.id}
                            >
                              {processingRequest === request.id ? (
                                <RefreshCw className="animate-spin" size={14} />
                              ) : (
                                <X size={14} />
                              )}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" title="Voir les détails">
                          <Eye size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune demande trouvée
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
