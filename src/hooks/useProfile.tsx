import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type ProfileInsert = TablesInsert<'profiles'>;
type ProfileUpdate = TablesUpdate<'profiles'>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast.success('Perfil actualizado');
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
      return { error };
    }
  };

  const completeOnboarding = async (profileData: Partial<ProfileUpdate>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...profileData, 
          onboarding_completed: true,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      
      // Track KPI event
      await supabase.from('kpi_events').insert({
        user_id: user.id,
        event_type: 'onboarding_completed',
        value: 1
      });

      toast.success('¡Onboarding completado!');
      return { data };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error al guardar');
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    completeOnboarding,
    refetch: fetchProfile
  };
}
