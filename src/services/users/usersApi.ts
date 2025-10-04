import { supabase } from '@/lib/supabase';
import { User, UsersResponse } from './types';

export const usersApi = {
  // Get all users
  async getUsers(): Promise<UsersResponse> {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      users: data as User[],
      count: count || 0,
    };
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  },
};
