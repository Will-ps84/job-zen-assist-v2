import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';

type Application = Tables<'applications'>;
type ApplicationInsert = TablesInsert<'applications'>;
type ApplicationUpdate = TablesUpdate<'applications'>;
type ApplicationStatus = Enums<'application_status'>;

export interface ApplicationWithJob extends Application {
  job?: Tables<'jobs'>;
}

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(app => ({
        ...app,
        job: app.job as unknown as Tables<'jobs'>
      }));
      
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (appData: Partial<ApplicationInsert>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: appData.job_id!,
          status: appData.status || 'saved',
          channel: appData.channel,
          notes: appData.notes,
          cover_letter: appData.cover_letter,
          resume_id: appData.resume_id,
          applied_at: appData.status === 'applied' ? new Date().toISOString() : null,
          next_step_date: appData.next_step_date,
        })
        .select(`
          *,
          job:jobs(*)
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        job: data.job as unknown as Tables<'jobs'>
      };

      setApplications(prev => [transformedData, ...prev]);
      toast.success('Postulación creada');
      return { data: transformedData };
    } catch (error) {
      console.error('Error creating application:', error);
      toast.error('Error al crear postulación');
      return { error };
    }
  };

  const updateApplication = async (id: string, updates: ApplicationUpdate) => {
    if (!user) return { error: new Error('No user') };

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Set applied_at when status changes to 'applied'
      if (updates.status === 'applied') {
        const current = applications.find(a => a.id === id);
        if (!current?.applied_at) {
          (updateData as any).applied_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          job:jobs(*)
        `)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        job: data.job as unknown as Tables<'jobs'>
      };

      setApplications(prev => prev.map(a => a.id === id ? transformedData : a));

      // Track KPI event for status changes
      if (updates.status) {
        await supabase.from('kpi_events').insert({
          user_id: user.id,
          event_type: 'application_moved',
          meta_json: { status: updates.status, application_id: id }
        });
      }

      toast.success('Postulación actualizada');
      return { data: transformedData };
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Error al actualizar postulación');
      return { error };
    }
  };

  const deleteApplication = async (id: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setApplications(prev => prev.filter(a => a.id !== id));
      toast.success('Postulación eliminada');
      return { success: true };
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error al eliminar postulación');
      return { error };
    }
  };

  const getByStatus = (status: ApplicationStatus) => 
    applications.filter(a => a.status === status);

  const getStats = () => ({
    total: applications.length,
    saved: getByStatus('saved').length,
    applied: getByStatus('applied').length,
    interview: getByStatus('interview').length,
    offer: getByStatus('offer').length,
    closed: getByStatus('closed').length,
    rejected: getByStatus('rejected').length,
  });

  return {
    applications,
    loading,
    createApplication,
    updateApplication,
    deleteApplication,
    getByStatus,
    getStats,
    refetch: fetchApplications
  };
}
