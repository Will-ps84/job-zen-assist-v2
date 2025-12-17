import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Feedback {
  id: string;
  user_id: string;
  type: 'bug' | 'idea';
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  comment: string;
  screenshot_url: string | null;
  page_url: string | null;
  status: 'new' | 'reviewing' | 'resolved' | 'wontfix';
  created_at: string;
  updated_at: string;
}

interface FeedbackInsert {
  type: 'bug' | 'idea';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  comment: string;
  screenshot_url?: string;
  page_url?: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks((data || []) as Feedback[]);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (data: FeedbackInsert) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user.id,
          type: data.type,
          severity: data.severity || null,
          comment: data.comment,
          screenshot_url: data.screenshot_url || null,
          page_url: data.page_url || window.location.pathname,
        }]);

      if (error) throw error;
      await fetchFeedbacks();
      return { success: true };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { error };
    }
  };

  const updateFeedbackStatus = async (id: string, status: Feedback['status']) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchFeedbacks();
      return { success: true };
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return { error };
    }
  };

  return {
    feedbacks,
    loading,
    submitFeedback,
    updateFeedbackStatus,
    refetch: fetchFeedbacks,
  };
}
