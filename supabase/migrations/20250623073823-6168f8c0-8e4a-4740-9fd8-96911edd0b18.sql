
-- Activer RLS sur la table profiles si ce n'est pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Activer RLS sur la table leave_requests si ce n'est pas déjà fait
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir toutes les demandes de congé
CREATE POLICY "Admins can view all leave requests" 
ON leave_requests 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Politique pour permettre aux utilisateurs de voir leurs propres demandes
CREATE POLICY "Users can view own leave requests" 
ON leave_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres demandes
CREATE POLICY "Users can create own leave requests" 
ON leave_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux admins de modifier les demandes (pour approbation/rejet)
CREATE POLICY "Admins can update leave requests" 
ON leave_requests 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);
