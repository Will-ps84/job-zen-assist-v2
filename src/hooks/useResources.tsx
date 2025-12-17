import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Resource {
  id: string;
  title: string;
  category_id: string | null;
  slug: string;
  content: string | null;
  cover_image_url: string | null;
  country_scope: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, categoriesRes] = await Promise.all([
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
        supabase.from('resource_categories').select('*').order('name'),
      ]);

      if (resourcesRes.error) throw resourcesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setResources(resourcesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (data: Partial<Resource>) => {
    try {
      const { data: resource, error } = await supabase
        .from('resources')
        .insert([{
          title: data.title || 'Nuevo recurso',
          slug: data.slug || `recurso-${Date.now()}`,
          category_id: data.category_id,
          content: data.content,
          cover_image_url: data.cover_image_url,
          country_scope: data.country_scope || ['ALL'],
          is_published: data.is_published || false,
        }])
        .select()
        .single();

      if (error) throw error;
      setResources(prev => [resource, ...prev]);
      return { data: resource };
    } catch (error) {
      console.error('Error creating resource:', error);
      return { error };
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setResources(prev => prev.map(r => r.id === id ? data : r));
      return { data };
    } catch (error) {
      console.error('Error updating resource:', error);
      return { error };
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      setResources(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting resource:', error);
      return { error };
    }
  };

  const getPublished = (country?: string) => {
    return resources.filter(r => {
      if (!r.is_published) return false;
      if (!country || !r.country_scope) return true;
      return r.country_scope.includes('ALL') || r.country_scope.includes(country);
    });
  };

  const getByCategory = (categorySlug: string, country?: string) => {
    const cat = categories.find(c => c.slug === categorySlug);
    if (!cat) return [];
    return getPublished(country).filter(r => r.category_id === cat.id);
  };

  return {
    resources,
    categories,
    loading,
    createResource,
    updateResource,
    deleteResource,
    getPublished,
    getByCategory,
    refetch: fetchData,
  };
}
