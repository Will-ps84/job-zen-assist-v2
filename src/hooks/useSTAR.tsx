import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Achievement = Tables<'achievements_star'>;
type AchievementInsert = TablesInsert<'achievements_star'>;
type AchievementUpdate = TablesUpdate<'achievements_star'>;

export function useSTAR() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements_star')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAchievement = async (data: Partial<AchievementInsert>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data: achievement, error } = await supabase
        .from('achievements_star')
        .insert({
          user_id: user.id,
          company: data.company,
          role_title: data.role_title,
          situation: data.situation,
          task: data.task,
          action: data.action,
          result: data.result,
          metrics_json: data.metrics_json,
          confidence: data.confidence || 0,
          resume_id: data.resume_id,
        })
        .select()
        .single();

      if (error) throw error;

      setAchievements(prev => [achievement, ...prev]);
      toast.success('Logro STAR creado');
      return { data: achievement };
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast.error('Error al crear logro');
      return { error };
    }
  };

  const updateAchievement = async (id: string, updates: AchievementUpdate) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('achievements_star')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setAchievements(prev => prev.map(a => a.id === id ? data : a));
      toast.success('Logro actualizado');
      return { data };
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Error al actualizar logro');
      return { error };
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('achievements_star')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Logro eliminado');
      return { success: true };
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Error al eliminar logro');
      return { error };
    }
  };

  const getByResume = (resumeId: string) => 
    achievements.filter(a => a.resume_id === resumeId);

  return {
    achievements,
    loading,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    getByResume,
    refetch: fetchAchievements
  };
}
