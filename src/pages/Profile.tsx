import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { profilesApi, Profile } from '@/services/profiles';
import { Pencil, Save, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profilesApi.getCurrentProfile();
      setProfile(data);
      if (data) {
        setName(data.name || '');
        setNickname(data.nickname || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await profilesApi.updateProfile({
        name: name || null,
        nickname: nickname || null,
      });
      setProfile(updated);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const publicUrl = await profilesApi.uploadProfileImage(file);
      setProfile(prev => prev ? { ...prev, img_url: publicUrl } : null);
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-banking-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Public Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your public profile information
          </p>
        </div>

        <Card className="card-banking">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Form fields */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-banking-surface border-banking-border focus:border-banking-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your name may appear around the system where you contribute or are mentioned.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium">
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                    className="bg-banking-surface border-banking-border focus:border-banking-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    A shorter version of your name for casual use.
                  </p>
                </div>

                <div className="flex justify-start pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-banking-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right side - Profile picture */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Profile Picture</Label>
                <div className="relative group">
                  <div className="relative w-48 h-48 mx-auto">
                    <Avatar className="w-full h-full border-4 border-banking-primary/20">
                      <AvatarImage src={profile?.img_url || undefined} alt={profile?.name || 'User'} />
                      <AvatarFallback className="bg-banking-primary text-banking-primary-foreground text-4xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-banking-primary" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full shadow-lg border-banking-border hover:bg-banking-surface-hover"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Click the edit button to upload a new profile picture
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
