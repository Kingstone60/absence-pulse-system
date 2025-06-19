
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Edit } from 'lucide-react';

const departments = [
  'Développement',
  'Marketing',
  'RH',
  'Finance',
  'Commercial',
  'Support',
  'Design'
];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    position: user?.position || '',
    department: user?.department || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.position || !formData.department) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const success = await updateProfile(formData);
    
    if (success) {
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès"
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      position: user?.position || '',
      department: user?.department || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit size={16} />
            Modifier
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={24} />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="department">Département</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Sauvegarder</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Nom complet</Label>
                <p className="text-lg">{user?.name}</p>
              </div>

              <div>
                <Label>Email</Label>
                <p className="text-lg">{user?.email}</p>
              </div>

              <div>
                <Label>Poste</Label>
                <p className="text-lg">{user?.position}</p>
              </div>

              <div>
                <Label>Département</Label>
                <p className="text-lg">{user?.department}</p>
              </div>

              <div>
                <Label>Rôle</Label>
                <p className="text-lg capitalize">{user?.role === 'admin' ? 'Administrateur' : 'Employé'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
