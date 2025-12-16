import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Job = Tables<'jobs'>;
type JobInsert = TablesInsert<'jobs'>;
type Match = Tables<'matches'>;

export interface JobWithMatch extends Job {
  match?: Match;
}

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      // Fetch jobs with their matches
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id);

      if (matchesError) throw matchesError;

      // Combine jobs with their matches
      const jobsWithMatches = (jobsData || []).map(job => ({
        ...job,
        match: matchesData?.find(m => m.job_id === job.id)
      }));

      setJobs(jobsWithMatches);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Partial<JobInsert>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          title: jobData.title || 'Sin título',
          company: jobData.company,
          country: jobData.country,
          url: jobData.url,
          description: jobData.description,
          requirements: jobData.requirements,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          source: jobData.source || 'manual',
          is_remote: jobData.is_remote || false,
        })
        .select()
        .single();

      if (error) throw error;

      setJobs(prev => [{ ...data }, ...prev]);

      // Track KPI event
      await supabase.from('kpi_events').insert({
        user_id: user.id,
        event_type: 'job_added',
        value: 1
      });

      toast.success('Vacante agregada');
      return { data };
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Error al agregar vacante');
      return { error };
    }
  };

  const createMatch = async (jobId: string, matchData: Partial<Match>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          job_id: jobId,
          score_total: matchData.score_total || 0,
          score_semantic: matchData.score_semantic || 0,
          score_skills: matchData.score_skills || 0,
          score_seniority: matchData.score_seniority || 0,
          explanation: matchData.explanation,
          gaps_json: matchData.gaps_json,
          resume_id: matchData.resume_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update job in state with new match
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, match: data } : job
      ));

      // Track KPI event
      await supabase.from('kpi_events').insert({
        user_id: user.id,
        event_type: 'match_created',
        value: 1
      });

      return { data };
    } catch (error) {
      console.error('Error creating match:', error);
      return { error };
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success('Vacante eliminada');
      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error al eliminar vacante');
      return { error };
    }
  };

  const getHighMatchJobs = (minScore = 90) => 
    jobs.filter(j => j.match && j.match.score_total >= minScore);

  return {
    jobs,
    loading,
    createJob,
    createMatch,
    deleteJob,
    getHighMatchJobs,
    refetch: fetchJobs
  };
}
