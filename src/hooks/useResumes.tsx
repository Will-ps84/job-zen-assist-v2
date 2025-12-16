import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Resume = Tables<'resumes'>;
type ResumeInsert = TablesInsert<'resumes'>;
type ResumeUpdate = TablesUpdate<'resumes'>;

export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createResume = async (resumeData: Partial<ResumeInsert>, file?: File) => {
    if (!user) return { error: new Error('No user') };

    try {
      let fileUrl = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        fileUrl = uploadData.path;
      }

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: resumeData.title || 'CV sin título',
          raw_text: resumeData.raw_text,
          is_master: resumeData.is_master || false,
          file_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setResumes(prev => [data, ...prev]);
      
      // Track KPI event
      await supabase.from('kpi_events').insert({
        user_id: user.id,
        event_type: 'resume_created',
        value: 1
      });

      toast.success('CV creado exitosamente');
      return { data };
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error('Error al crear CV');
      return { error };
    }
  };

  const updateResume = async (id: string, updates: ResumeUpdate) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('resumes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setResumes(prev => prev.map(r => r.id === id ? data : r));
      toast.success('CV actualizado');
      return { data };
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Error al actualizar CV');
      return { error };
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      // Get the resume to find file URL
      const resume = resumes.find(r => r.id === id);
      
      // Delete file from storage if exists
      if (resume?.file_url) {
        await supabase.storage.from('resumes').remove([resume.file_url]);
      }

      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('CV eliminado');
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Error al eliminar CV');
      return { error };
    }
  };

  const getMasterResume = () => resumes.find(r => r.is_master);

  const getResumeDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, 3600); // 1 hour
    return data?.signedUrl;
  };

  return {
    resumes,
    loading,
    createResume,
    updateResume,
    deleteResume,
    getMasterResume,
    getResumeDownloadUrl,
    refetch: fetchResumes
  };
}
