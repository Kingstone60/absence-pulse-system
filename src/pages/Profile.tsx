
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AvatarUpload } from '@/components/AvatarUpload';

interface UserProfile {
  id: string;
  name: string;
  position: string;
  department: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        name: data.name,
        position: data.position,
        department: data.department
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          position: formData.position,
          department: formData.department
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    
    setFormData({
      name: profile.name,
      position: profile.position,
      department: profile.department
    });
    setIsEditing(false);
  };

  const handleAvatarUpdate = (newUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: newUrl } : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Chargement du profil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Erreur de chargement du profil</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <div className="text-sm text-gray-500">
          {profile.role === 'admin' ? 'Administrateur' : 'Employé'}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User size={24} />
              Informations personnelles
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} className="mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X size={16} className="mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save size={16} className="mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <AvatarUpload 
              currentAvatarUrl={profile.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{profile.name}</div>
              )}
            </div>

            <div>
              <Label htmlFor="position">Poste</Label>
              {isEditing ? (
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{profile.position}</div>
              )}
            </div>

            <div>
              <Label htmlFor="department">Département</Label>
              {isEditing ? (
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{profile.department}</div>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <div className="p-2 bg-gray-50 rounded border text-gray-600">{user?.email}</div>
            </div>

            <div>
              <Label>Rôle</Label>
              <div className="p-2 bg-gray-50 rounded border text-gray-600">
                {profile.role === 'admin' ? 'Administrateur' : 'Employé'}
              </div>
            </div>

            <div>
              <Label>Membre depuis</Label>
              <div className="p-2 bg-gray-50 rounded border text-gray-600">
                {new Date(profile.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-500">Demandes total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">10</div>
              <div className="text-sm text-gray-500">Approuvées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-500">Refusées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
