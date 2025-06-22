
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function DataExport() {
  const [exportType, setExportType] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const exportData = async () => {
    if (!exportType) return;

    setIsExporting(true);

    try {
      let data: any[] = [];
      let filename = '';

      switch (exportType) {
        case 'leave_requests':
          const { data: requests } = await supabase
            .from('leave_requests')
            .select(`
              *,
              profiles:user_id (name, position, department)
            `)
            .order('created_at', { ascending: false });
          
          data = requests || [];
          filename = 'demandes_conges.csv';
          break;

        case 'notifications':
          const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
          
          data = notifications || [];
          filename = 'notifications.csv';
          break;

        case 'profiles':
          if (user?.role !== 'admin') {
            toast({
              title: "Accès refusé",
              description: "Seuls les administrateurs peuvent exporter les profils.",
              variant: "destructive",
            });
            return;
          }

          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          
          data = profiles || [];
          filename = 'profils_utilisateurs.csv';
          break;

        default:
          return;
      }

      // Convertir en CSV
      if (data.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune donnée à exporter pour cette sélection.",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Gérer les valeurs null/undefined et échapper les guillemets
            const stringValue = value === null || value === undefined ? '' : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: `Les données ont été exportées vers ${filename}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download size={20} />
          Export des données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Type de données à exporter</label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type de données" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leave_requests">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Demandes de congés
                </div>
              </SelectItem>
              <SelectItem value="notifications">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Notifications
                </div>
              </SelectItem>
              {user?.role === 'admin' && (
                <SelectItem value="profiles">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Profils utilisateurs
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={exportData} 
          disabled={!exportType || isExporting}
          className="w-full"
        >
          <Download size={16} className="mr-2" />
          {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
        </Button>
      </CardContent>
    </Card>
  );
}
