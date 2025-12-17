import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

interface KPIEvent {
  id: string;
  user_id: string;
  event_type: string;
  value: number;
  metadata: Json | null;
  created_at: string;
}

interface WeeklyStats {
  week: string;
  postulaciones: number;
  entrevistas: number;
}

interface ChannelStats {
  name: string;
  value: number;
  fill: string;
}

// Event types for tracking
export const KPI_EVENT_TYPES = {
  DEMO_USED: 'demo_used',
  SIGNUP_COMPLETED: 'signup_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  RESUME_UPLOADED: 'resume_uploaded',
  RESUME_EDITED: 'resume_edited',
  STAR_CREATED: 'star_created',
  STAR_INSERTED_INTO_CV: 'star_inserted_into_cv',
  JOB_ADDED: 'job_added',
  MATCH_GENERATED: 'match_generated',
  APPLICATION_MOVED: 'application_moved',
  INTERVIEW_SIM_COMPLETED: 'interview_sim_completed',
} as const;

export function useKPIEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<KPIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kpi_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setEvents((data || []) as KPIEvent[]);
    } catch (error) {
      console.error('Error fetching KPI events:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: string, value: number = 1, metadata?: Json) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('kpi_events')
        .insert([{
          user_id: user.id,
          event_type: eventType,
          value,
          metadata: metadata || null,
        }]);

      if (error) throw error;
      await fetchEvents();
      return { success: true };
    } catch (error) {
      console.error('Error tracking KPI event:', error);
      return { error };
    }
  };

  // Get count of specific event type
  const getEventCount = (eventType: string) => {
    return events.filter(e => e.event_type === eventType).reduce((acc, e) => acc + (e.value || 1), 0);
  };

  // Get events from the last N days
  const getRecentEvents = (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return events.filter(e => new Date(e.created_at) >= cutoff);
  };

  // Get weekly activity for charts
  const getWeeklyActivity = (): WeeklyStats[] => {
    const weeks: WeeklyStats[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekEvents = events.filter(e => {
        const eventDate = new Date(e.created_at);
        return eventDate >= weekStart && eventDate < weekEnd;
      });

      weeks.push({
        week: `Sem ${4 - i}`,
        postulaciones: weekEvents.filter(e => e.event_type === 'application_status_changed').length,
        entrevistas: weekEvents.filter(e => 
          e.event_type === 'application_status_changed' && 
          (e.metadata as any)?.to_status === 'Entrevista'
        ).length,
      });
    }

    return weeks;
  };

  // Get channel distribution from metadata
  const getChannelStats = (): ChannelStats[] => {
    const channels: Record<string, number> = {};
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    events
      .filter(e => e.event_type === 'job_added' || e.event_type === 'application_status_changed')
      .forEach(e => {
        const channel = (e.metadata as any)?.channel || 'Manual';
        channels[channel] = (channels[channel] || 0) + 1;
      });

    return Object.entries(channels).map(([name, value], i) => ({
      name,
      value,
      fill: colors[i % colors.length],
    }));
  };

  return {
    events,
    loading,
    trackEvent,
    getEventCount,
    getRecentEvents,
    getWeeklyActivity,
    getChannelStats,
    refetch: fetchEvents,
  };
}
