import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrandSettings {
  id: string;
  brand_name: string;
  slogan: string;
  logo_url: string | null;
  primary_color: string;
}

const defaultSettings: BrandSettings = {
  id: '',
  brand_name: 'HR Screener LATAM',
  slogan: 'Filtra CVs en minutos con IA explicable',
  logo_url: null,
  primary_color: '#8B5CF6',
};

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as BrandSettings);
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<BrandSettings>) => {
    if (!settings.id) return { error: new Error('No settings found') };

    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as BrandSettings);
      return { data };
    } catch (error) {
      console.error('Error updating brand settings:', error);
      return { error };
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}
