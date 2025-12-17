import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type StarStory = Tables<'star_stories'>;
type StarStoryInsert = TablesInsert<'star_stories'>;
type StarStoryUpdate = TablesUpdate<'star_stories'>;

export function useSTAR() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StarStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('star_stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching STAR stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (data: Partial<StarStoryInsert>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data: story, error } = await supabase
        .from('star_stories')
        .insert({
          user_id: user.id,
          title: data.title || 'Logro STAR',
          situation: data.situation,
          task: data.task,
          action: data.action,
          result: data.result,
          competencies: data.competencies,
        })
        .select()
        .single();

      if (error) throw error;

      setStories(prev => [story, ...prev]);
      toast.success('Logro STAR creado');
      return { data: story };
    } catch (error) {
      console.error('Error creating STAR story:', error);
      toast.error('Error al crear logro');
      return { error };
    }
  };

  const updateStory = async (id: string, updates: StarStoryUpdate) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('star_stories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setStories(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Logro actualizado');
      return { data };
    } catch (error) {
      console.error('Error updating STAR story:', error);
      toast.error('Error al actualizar logro');
      return { error };
    }
  };

  const deleteStory = async (id: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('star_stories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setStories(prev => prev.filter(s => s.id !== id));
      toast.success('Logro eliminado');
      return { success: true };
    } catch (error) {
      console.error('Error deleting STAR story:', error);
      toast.error('Error al eliminar logro');
      return { error };
    }
  };

  const getByCompetency = (competency: string) => 
    stories.filter(s => s.competencies?.includes(competency));

  return {
    stories,
    loading,
    createStory,
    updateStory,
    deleteStory,
    getByCompetency,
    refetch: fetchStories
  };
}
