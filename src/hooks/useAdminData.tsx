import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  user_id: string;
  created_at: string;
  country: string | null;
  role: 'admin' | 'user' | null;
}

interface AdminStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  onboardingCompleted: number;
  onboardingRate: number;
  totalCVs: number;
  totalJobs: number;
  totalMatches: number;
  applicationsByStatus: Record<string, number>;
  topCountries: { country: string; count: number }[];
}

export function useAdminData() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, created_at, country');

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        created_at: p.created_at,
        country: p.country,
        role: (roles?.find(r => r.user_id === p.user_id)?.role as 'admin' | 'user') || null,
      }));

      setUsers(usersWithRoles);

      // Fetch stats
      await fetchStats(profiles || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (profiles: any[]) => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate user stats
    const newUsersLast7Days = profiles.filter(p => 
      new Date(p.created_at) >= last7Days
    ).length;

    const newUsersLast30Days = profiles.filter(p => 
      new Date(p.created_at) >= last30Days
    ).length;

    // Fetch onboarding stats
    const { count: onboardingCompleted } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('onboarding_completed', true);

    // Fetch CV count
    const { count: totalCVs } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true });

    // Fetch jobs count
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    // Fetch matches count
    const { count: totalMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true });

    // Fetch applications by status
    const { data: applications } = await supabase
      .from('applications')
      .select('status');

    const applicationsByStatus: Record<string, number> = {};
    (applications || []).forEach(app => {
      const status = app.status || 'unknown';
      applicationsByStatus[status] = (applicationsByStatus[status] || 0) + 1;
    });

    // Top countries
    const countryCounts: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.country) {
        countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalUsers: profiles.length,
      newUsersLast7Days,
      newUsersLast30Days,
      onboardingCompleted: onboardingCompleted || 0,
      onboardingRate: profiles.length > 0 
        ? Math.round(((onboardingCompleted || 0) / profiles.length) * 100) 
        : 0,
      totalCVs: totalCVs || 0,
      totalJobs: totalJobs || 0,
      totalMatches: totalMatches || 0,
      applicationsByStatus,
      topCountries,
    });
  };

  const setUserRole = async (userId: string, role: 'admin' | 'user' | 'remove') => {
    try {
      const { data, error } = await supabase.rpc('set_user_role', {
        target_user_id: userId,
        new_role: role,
      });

      if (error) throw error;

      // Check RPC response
      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        return { error: result.error || 'Error desconocido' };
      }

      // Update local state
      if (role === 'remove') {
        setUsers(prev => prev.map(u => 
          u.user_id === userId ? { ...u, role: null } : u
        ));
      } else {
        setUsers(prev => prev.map(u => 
          u.user_id === userId ? { ...u, role } : u
        ));
      }

      return { success: true, message: result.message };
    } catch (error) {
      console.error('Error setting role via RPC:', error);
      return { error: error instanceof Error ? error.message : 'Error al cambiar rol' };
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;

  return {
    users,
    stats,
    loading,
    setUserRole,
    adminCount,
    refetch: fetchData,
  };
}
