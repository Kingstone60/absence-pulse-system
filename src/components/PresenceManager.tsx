
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar_url?: string;
}

interface AbsentEmployee extends Employee {
  leave_type: string;
  start_date: string;
  end_date: string;
}

interface LeaveRequestWithProfile {
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  profiles: {
    name: string;
    position: string;
    department: string;
    avatar_url?: string;
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

export function PresenceManager() {
  const [presentEmployees, setPresentEmployees] = useState<Employee[]>([]);
  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    fetchPresenceData();

    // Écouter les mises à jour en temps réel
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        () => {
          console.log('Mise à jour détectée, rechargement des données...');
          fetchPresenceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const fetchPresenceData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Chargement des données de présence...');
      
      const today = new Date().toISOString().split('T')[0];
      console.log('Date du jour:', today);

      // Récupérer tous les employés (non-admin)
      console.log('Récupération de tous les employés...');
      const { data: allEmployees, error: employeesError } = await supabase
        .from('profiles')
        .select('id, name, position, department, avatar_url')
        .neq('role', 'admin');

      if (employeesError) {
        console.error('Erreur employés:', employeesError);
        throw new Error(`Impossible de charger la liste des employés: ${employeesError.message}`);
      }

      console.log('Employés trouvés:', allEmployees?.length || 0);

      // Récupérer les employés actuellement en congé
      console.log('Récupération des congés en cours...');
      const { data: currentLeaves, error: leavesError } = await supabase
        .from('leave_requests')
        .select(`
          user_id,
          type,
          start_date,
          end_date,
          profiles!fk_leave_requests_user_id (name, position, department, avatar_url)
        `)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      if (leavesError) {
        console.error('Erreur congés:', leavesError);
        // Continuer même en cas d'erreur pour les congés
        console.log('Impossible de charger les congés, affichage des employés seulement');
      }

      console.log('Congés en cours trouvés:', currentLeaves?.length || 0);

      // Formater les employés absents
      const absent = currentLeaves ? (currentLeaves as LeaveRequestWithProfile[])
        .filter(leave => leave.profiles !== null)
        .map(leave => ({
          id: leave.user_id,
          name: leave.profiles!.name,
          position: leave.profiles!.position,
          department: leave.profiles!.department,
          avatar_url: leave.profiles!.avatar_url,
          leave_type: leave.type,
          start_date: leave.start_date,
          end_date: leave.end_date
        })) as AbsentEmployee[] : [];

      // Filtrer les employés présents
      const absentIds = new Set(absent.map(emp => emp.id));
      const present = (allEmployees || []).filter(emp => !absentIds.has(emp.id));

      console.log('Employés présents:', present.length);
      console.log('Employés absents:', absent.length);

      setPresentEmployees(present);
      setAbsentEmployees(absent);

      toast({
        title: "Données mises à jour",
        description: `${present.length} présents, ${absent.length} absents`,
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données de présence:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des données.';
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Seuls les administrateurs peuvent voir cette page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-lg">
          <RefreshCw className="animate-spin" size={20} />
          Chargement des données de présence...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des présences</h1>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-semibold">Erreur de chargement</h3>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={fetchPresenceData}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des présences</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchPresenceData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
          <div className="text-sm text-gray-500">
            Mise à jour : {new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total employés</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentEmployees.length + absentEmployees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentEmployees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentEmployees.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employés présents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserCheck size={20} />
              Employés présents ({presentEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {presentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      {employee.avatar_url ? (
                        <img 
                          src={employee.avatar_url} 
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-green-800 font-medium">
                          {employee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{employee.name}</p>
                      <p className="text-sm text-green-700">{employee.position}</p>
                      <p className="text-xs text-green-600">{employee.department}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Présent
                  </Badge>
                </div>
              ))}
              {presentEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun employé présent aujourd'hui
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employés absents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <UserX size={20} />
              Employés absents ({absentEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {absentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                      {employee.avatar_url ? (
                        <img 
                          src={employee.avatar_url} 
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-red-800 font-medium">
                          {employee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-red-900">{employee.name}</p>
                      <p className="text-sm text-red-700">{employee.position}</p>
                      <p className="text-xs text-red-600">{employee.department}</p>
                      <p className="text-xs text-red-500">
                        {leaveTypeLabels[employee.leave_type as keyof typeof leaveTypeLabels] || employee.leave_type}
                      </p>
                      <p className="text-xs text-red-500">
                        Jusqu'au {new Date(employee.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    Absent
                  </Badge>
                </div>
              ))}
              {absentEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun employé absent aujourd'hui
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
