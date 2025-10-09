import { supabase } from '@/lib/supabase';
import { Profile, ProfileUpdateData } from './types';

export const profilesApi = {
  // Get current user's profile
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        return newProfile as Profile;
      }
      throw error;
    }

    return data as Profile;
  },

  // Update profile
  async updateProfile(profileData: ProfileUpdateData): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Upload profile image
  async uploadProfileImage(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const filePath = `profiles/${user.id}/avatar.png`;

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public-assets')
      .getPublicUrl(filePath);

    // Update profile with new image URL
    await supabase
      .from('profiles')
      .update({ img_url: urlData.publicUrl })
      .eq('id', user.id);

    return urlData.publicUrl;
  },
};
