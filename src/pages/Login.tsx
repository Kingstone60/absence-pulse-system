
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, User, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('employee');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password, activeTab as 'employee' | 'admin');
    
    if (!success) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue !`
      });
    }
  };

  const fillDemoCredentials = (role: 'employee' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@entreprise.fr');
      setPassword('admin123');
    } else {
      setEmail('sophie.martin@entreprise.fr');
      setPassword('emp123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LeaveManager</h1>
          <p className="text-gray-600">Système de gestion des congés</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <LogIn size={24} />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <User size={16} />
                  Employé
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield size={16} />
                  Administrateur
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employee" className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-blue-800 mb-2">
                    <strong>Compte de démonstration employé :</strong>
                  </p>
                  <p className="text-blue-700">Email: sophie.martin@entreprise.fr</p>
                  <p className="text-blue-700">Mot de passe: emp123</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => fillDemoCredentials('employee')}
                  >
                    Utiliser ces identifiants
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <p className="text-green-800 mb-2">
                    <strong>Compte de démonstration administrateur :</strong>
                  </p>
                  <p className="text-green-700">Email: admin@entreprise.fr</p>
                  <p className="text-green-700">Mot de passe: admin123</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => fillDemoCredentials('admin')}
                  >
                    Utiliser ces identifiants
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.fr"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Créer un compte employé
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
