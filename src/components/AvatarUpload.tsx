
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ currentAvatarUrl, onAvatarUpdate, size = 'md' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const { user } = useAuth();
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;
      setAvatarUrl(newAvatarUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate?.(newAvatarUrl);
      
      toast({
        title: "Avatar mis à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'avatar. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt="Avatar" />
        <AvatarFallback>
          <User className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="avatar-upload"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          asChild
        >
          <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2">
            <Upload size={16} />
            {uploading ? 'Téléchargement...' : 'Changer l\'avatar'}
          </label>
        </Button>
      </div>
    </div>
  );
}
