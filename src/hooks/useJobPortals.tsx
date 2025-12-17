import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface JobPortal {
  id: string;
  country: string;
  name: string;
  url: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useJobPortals() {
  const [portals, setPortals] = useState<JobPortal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    try {
      const { data, error } = await supabase
        .from('job_portals')
        .select('*')
        .order('country')
        .order('name');

      if (error) throw error;
      setPortals(data || []);
    } catch (error) {
      console.error('Error fetching portals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortal = async (data: Partial<JobPortal>) => {
    try {
      const { data: portal, error } = await supabase
        .from('job_portals')
        .insert([{
          country: data.country || 'MX',
          name: data.name || 'Nuevo portal',
          url: data.url || '',
          type: data.type || 'general',
          description: data.description,
          logo_url: data.logo_url,
          is_active: data.is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      setPortals(prev => [...prev, portal]);
      return { data: portal };
    } catch (error) {
      console.error('Error creating portal:', error);
      return { error };
    }
  };

  const updatePortal = async (id: string, updates: Partial<JobPortal>) => {
    try {
      const { data, error } = await supabase
        .from('job_portals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPortals(prev => prev.map(p => p.id === id ? data : p));
      return { data };
    } catch (error) {
      console.error('Error updating portal:', error);
      return { error };
    }
  };

  const deletePortal = async (id: string) => {
    try {
      const { error } = await supabase.from('job_portals').delete().eq('id', id);
      if (error) throw error;
      setPortals(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting portal:', error);
      return { error };
    }
  };

  const getByCountry = (country: string) => {
    return portals.filter(p => p.is_active && p.country === country);
  };

  const getActive = () => portals.filter(p => p.is_active);

  return {
    portals,
    loading,
    createPortal,
    updatePortal,
    deletePortal,
    getByCountry,
    getActive,
    refetch: fetchPortals,
  };
}
