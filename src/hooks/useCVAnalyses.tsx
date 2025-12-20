import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CandidateResult {
  name: string;
  score: number;
  starBullets: string[];
  skillsMatch: number;
  strengths: string[];
  gaps: string[];
  experience: string;
  email?: string;
  phone?: string;
}

export interface CVAnalysis {
  id: string;
  user_id: string;
  job_title: string;
  job_description: string;
  role_category: string | null;
  total_cvs: number;
  top_candidates: CandidateResult[] | null;
  pool_quality_comment: string | null;
  created_at: string;
  updated_at: string;
}

export function useCVAnalyses() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cv_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse the JSON field safely
      const parsed = (data || []).map(item => ({
        ...item,
        top_candidates: item.top_candidates as unknown as CandidateResult[] | null
      }));
      
      setAnalyses(parsed);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      toast.error("Error al cargar el historial de análisis");
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async (
    jobTitle: string,
    jobDescription: string,
    roleCategory: string,
    totalCvs: number,
    topCandidates: CandidateResult[],
    poolQualityComment: string
  ): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from("cv_analyses")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          job_description: jobDescription,
          role_category: roleCategory,
          total_cvs: totalCvs,
          top_candidates: topCandidates as any,
          pool_quality_comment: poolQualityComment
        })
        .select("id")
        .single();

      if (error) throw error;
      
      await fetchAnalyses();
      return data?.id || null;
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast.error("Error al guardar el análisis");
      return null;
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cv_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast.success("Análisis eliminado");
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error("Error al eliminar el análisis");
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user?.id]);

  return {
    analyses,
    loading,
    saveAnalysis,
    deleteAnalysis,
    refetch: fetchAnalyses
  };
}
