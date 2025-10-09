import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Profile } from '@/services/profiles/types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MOCK: carga de perfil
  const loadProfile = useCallback(
    async (userFromSession?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) => {
      setLoading(true);
      setError(null);
      let user = userFromSession;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const mockProfile: Profile = {
        id: user.id,
        name:
          (user.user_metadata?.full_name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        nickname:
          (user.user_metadata?.name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        rol: 'User',
        status: 'active',
        img_url: (user.user_metadata?.avatar_url as string) || null,
        created_at: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setLoading(false);
    },
    []
  );

  // MOCK: actualización de perfil
  const updateProfile = async (data: Partial<Profile>) => {
    setError(null);
    if (!profile) return;
    setProfile({ ...profile, ...data });
  };

  // MOCK: subida de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    setError(null);
    if (!profile) throw new Error('No profile loaded');
    const imageUrl = URL.createObjectURL(file);
    setProfile({ ...profile, img_url: imageUrl });
    return imageUrl;
  };

  const refreshProfile = async () => {
    await loadProfile(profile || undefined);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value: ProfileContextType = {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Profile } from '@/services/profiles/types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MOCK: carga de perfil
  const loadProfile = useCallback(
    async (userFromSession?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) => {
      setLoading(true);
      setError(null);
      let user = userFromSession;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const mockProfile: Profile = {
        id: user.id,
        name:
          (user.user_metadata?.full_name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        nickname:
          (user.user_metadata?.name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        rol: 'User',
        status: 'active',
        img_url: (user.user_metadata?.avatar_url as string) || null,
        created_at: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setLoading(false);
    },
    []
  );

  // MOCK: actualización de perfil
  const updateProfile = async (data: Partial<Profile>) => {
    setError(null);
    if (!profile) return;
    setProfile({ ...profile, ...data });
  };

  // MOCK: subida de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    setError(null);
    if (!profile) throw new Error('No profile loaded');
    const imageUrl = URL.createObjectURL(file);
    setProfile({ ...profile, img_url: imageUrl });
    return imageUrl;
  };

  const refreshProfile = async () => {
    await loadProfile(profile || undefined);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value: ProfileContextType = {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Profile } from '@/services/profiles/types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MOCK: carga de perfil
  const loadProfile = useCallback(
    async (userFromSession?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) => {
      setLoading(true);
      setError(null);
      let user = userFromSession;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const mockProfile: Profile = {
        id: user.id,
        name:
          (user.user_metadata?.full_name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        nickname:
          (user.user_metadata?.name as string) ||
          user.email?.split('@')[0] ||
          'Usuario',
        rol: 'User',
        status: 'active',
        img_url: (user.user_metadata?.avatar_url as string) || null,
        created_at: new Date().toISOString(),
      };
      setProfile(mockProfile);
      setLoading(false);
    },
    []
  );

  // MOCK: actualización de perfil
  const updateProfile = async (data: Partial<Profile>) => {
    setError(null);
    if (!profile) return;
    setProfile({ ...profile, ...data });
  };

  // MOCK: subida de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    setError(null);
    if (!profile) throw new Error('No profile loaded');
    const imageUrl = URL.createObjectURL(file);
    setProfile({ ...profile, img_url: imageUrl });
    return imageUrl;
  };

  const refreshProfile = async () => {
    await loadProfile(profile || undefined);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value: ProfileContextType = {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

  const loadProfile = useCallback(
    import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
    import { Profile } from '@/services/profiles/types';

    interface ProfileContextType {
      profile: Profile | null;
      loading: boolean;
      error: string | null;
      updateProfile: (data: Partial<Profile>) => Promise<void>;
      uploadAvatar: (file: File) => Promise<string>;
      refreshProfile: () => Promise<void>;
    }

    export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

    interface ProfileProviderProps {
      children: ReactNode;
    }

    export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
      const [profile, setProfile] = useState<Profile | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      // MOCK: carga de perfil
      const loadProfile = useCallback(
        async (userFromSession?: {
          id: string;
          email?: string;
          user_metadata?: Record<string, unknown>;
        }) => {
          setLoading(true);
          setError(null);
          let user = userFromSession;
          if (!user) {
            setProfile(null);
            setLoading(false);
            return;
          }
          const mockProfile: Profile = {
            id: user.id,
            name:
              (user.user_metadata?.full_name as string) ||
              user.email?.split('@')[0] ||
              'Usuario',
            nickname:
              (user.user_metadata?.name as string) ||
              user.email?.split('@')[0] ||
              'Usuario',
            rol: 'User',
            status: 'active',
            img_url: (user.user_metadata?.avatar_url as string) || null,
            created_at: new Date().toISOString(),
          };
          setProfile(mockProfile);
          setLoading(false);
        },
        []
      );

      // MOCK: actualización de perfil
      const updateProfile = async (data: Partial<Profile>) => {
        setError(null);
        if (!profile) return;
        setProfile({ ...profile, ...data });
      };

      // MOCK: subida de avatar
      const uploadAvatar = async (file: File): Promise<string> => {
        setError(null);
        if (!profile) throw new Error('No profile loaded');
        const imageUrl = URL.createObjectURL(file);
        setProfile({ ...profile, img_url: imageUrl });
        return imageUrl;
      };

      const refreshProfile = async () => {
        await loadProfile(profile || undefined);
      };

      useEffect(() => {
        loadProfile();
      }, [loadProfile]);

      const value: ProfileContextType = {
        profile,
        loading,
        error,
        updateProfile,
        uploadAvatar,
        refreshProfile,
      };

      return (
        <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
      );
    };
                        created_at: new Date().toISOString(),
                      }
                      setProfile(mockProfile)
                      console.log('✅ ProfileContext: Mock profile set:', mockProfile.name)
        ...updatedProfile,
        created_at: updatedProfile.created_at || new Date().toISOString(),
      })
      console.log('✅ ProfileContext: Profile updated successfully')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Error updating profile')
      throw err
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setError(null)

      if (!profile) {
        throw new Error('No profile loaded')
      }

      console.log('🔄 ProfileContext: Uploading avatar to Supabase storage...')

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error('❌ ProfileContext: Error uploading avatar:', uploadError)
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // Update profile with new image URL
      await updateProfile({ img_url: publicUrl })

      console.log('✅ ProfileContext: Avatar uploaded successfully')
      return publicUrl
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err.message : 'Error uploading avatar')
      throw err
    }
  }

  const refreshProfile = async () => {
    await loadProfile()
  }

  useEffect(() => {
    console.log(
      '🔄 ProfileContext: useEffect started - setting up auth listener only'
    )

    // Initial load - run once
    loadProfile()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        '🔄 ProfileContext: Auth state change detected:',
        event,
        session ? 'Session exists' : 'No session'
      )

      if (event === 'SIGNED_IN' && session && session.user) {
        console.log(
          '🔄 ProfileContext: SIGNED_IN event - calling loadProfile() with session user'
        )
        // User signed in, load profile using the user from session
        await loadProfile(session.user)
        console.log('✅ ProfileContext: SIGNED_IN loadProfile() completed')
      } else if (event === 'SIGNED_OUT') {
        console.log('🔄 ProfileContext: SIGNED_OUT event - clearing profile')
        // User signed out, clear profile
        setProfile(null)
        setLoading(false)
        console.log('✅ ProfileContext: SIGNED_OUT profile cleared')
      } else {
        console.log('🔄 ProfileContext: Other auth event ignored:', event)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile]) // Add loadProfile as dependency

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile,
  }

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}
