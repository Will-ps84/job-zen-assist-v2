import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  Search,
  Plus,
  ExternalLink,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Sparkles,
  Loader2,
  Trash2,
  Globe,
  Wand2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobs, type JobWithMatch } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const paises = [
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Perú" },
  { value: "CL", label: "Chile" },
];

// P0.7: Simple score calculation based on profile matching
const calculateMatchScore = (
  jobDescription: string,
  profile: {
    skills?: string[] | null;
    role_target?: string | null;
    seniority?: string | null;
    industries?: string[] | null;
  } | null
): { score: number; explanation: string; gaps: string[] } => {
  if (!profile || !jobDescription) {
    return { score: 0, explanation: "Completa tu perfil para ver el match", gaps: ["Perfil incompleto"] };
  }

  const descLower = jobDescription.toLowerCase();
  let score = 0;
  const matches: string[] = [];
  const gaps: string[] = [];

  // Check skills match (40 points max)
  if (profile.skills && profile.skills.length > 0) {
    const matchedSkills = profile.skills.filter(skill => 
      descLower.includes(skill.toLowerCase())
    );
    const skillScore = Math.min(40, (matchedSkills.length / profile.skills.length) * 40);
    score += skillScore;
    if (matchedSkills.length > 0) {
      matches.push(`Skills que coinciden: ${matchedSkills.slice(0, 3).join(", ")}`);
    }
    const unmatchedSkills = profile.skills.filter(skill => 
      !descLower.includes(skill.toLowerCase())
    );
    if (unmatchedSkills.length > 0 && unmatchedSkills.length <= 3) {
      gaps.push(`Skills no mencionados: ${unmatchedSkills.slice(0, 2).join(", ")}`);
    }
  } else {
    gaps.push("Agrega skills a tu perfil");
  }

  // Check role match (30 points max)
  if (profile.role_target) {
    const roleWords = profile.role_target.toLowerCase().split(/\s+/);
    const roleMatches = roleWords.filter(word => descLower.includes(word));
    if (roleMatches.length > 0) {
      score += 30;
      matches.push("Rol compatible");
    } else {
      score += 10;
      gaps.push("El rol podría no ser exacto");
    }
  } else {
    gaps.push("Define tu rol objetivo");
  }

  // Check seniority keywords (20 points max)
  const seniorityKeywords: Record<string, string[]> = {
    junior: ["junior", "entry", "trainee", "becario", "practicante"],
    mid: ["mid", "intermedio", "2-5 años", "3 años"],
    senior: ["senior", "sr", "5+ años", "experiencia sólida"],
    lead: ["lead", "líder", "manager", "jefe", "coordinador"],
    executive: ["director", "vp", "c-level", "head of", "chief"],
  };
  
  if (profile.seniority && seniorityKeywords[profile.seniority]) {
    const matches_seniority = seniorityKeywords[profile.seniority].some(kw => descLower.includes(kw));
    if (matches_seniority) {
      score += 20;
      matches.push("Nivel de seniority compatible");
    } else {
      score += 5;
      gaps.push("Verifica el nivel de seniority requerido");
    }
  }

  // Check industry (10 points max)
  if (profile.industries && profile.industries.length > 0) {
    const industryMatch = profile.industries.some(ind => 
      descLower.includes(ind.toLowerCase())
    );
    if (industryMatch) {
      score += 10;
      matches.push("Industria compatible");
    }
  }

  const explanation = matches.length > 0 
    ? matches.slice(0, 2).join(". ") + "."
    : "Revisa los requisitos de la vacante.";

  return { 
    score: Math.round(score), 
    explanation,
    gaps: gaps.slice(0, 3)
  };
};

export default function Vacantes() {
  const { jobs, loading, createJob, deleteJob, refetch } = useJobs();
  const { createApplication, applications } = useApplications();
  const { profile } = useProfile();
  
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [countryFilter, setCountryFilter] = useState("all");
  const [calculatedMatch, setCalculatedMatch] = useState<{ score: number; explanation: string; gaps: string[] } | null>(null);
  
  // P0.7: Simplified form - only URL and description required
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    country: profile?.country || "",
    url: "",
    description: "",
    salary_min: "",
    salary_max: "",
    is_remote: false,
  });

  // P0.7: Calculate score when description changes
  const handleDescriptionChange = (description: string) => {
    setNewJob({ ...newJob, description });
    if (description.length > 50) {
      const match = calculateMatchScore(description, profile);
      setCalculatedMatch(match);
    } else {
      setCalculatedMatch(null);
    }
  };

  // P0.7: Auto-fill from URL (simple extraction)
  const handleAutoFill = async () => {
    if (!newJob.url) {
      toast.error("Ingresa una URL primero");
      return;
    }
    
    setAutoFilling(true);
    try {
      // Try to extract basic info from URL
      const url = new URL(newJob.url);
      const hostname = url.hostname.replace("www.", "");
      
      // Extract company from common job board URLs
      let company = "";
      if (hostname.includes("linkedin")) {
        company = "LinkedIn Job";
      } else if (hostname.includes("computrabajo")) {
        company = "ComputraBajo";
      } else if (hostname.includes("indeed")) {
        company = "Indeed Job";
      }
      
      // Extract title from URL path (common pattern)
      const pathParts = url.pathname.split("/").filter(Boolean);
      let title = "";
      if (pathParts.length > 0) {
        // Try to find a job title in the path
        const titlePart = pathParts.find(p => 
          p.length > 5 && !p.match(/^\d+$/) && !["jobs", "job", "vacante", "empleo"].includes(p.toLowerCase())
        );
        if (titlePart) {
          title = titlePart
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        }
      }
      
      setNewJob(prev => ({
        ...prev,
        title: title || prev.title,
        company: company || prev.company,
      }));
      
      toast.success("Información extraída. Revisa y completa los campos.");
    } catch (error) {
      toast.error("No se pudo extraer información. Completa manualmente.");
    } finally {
      setAutoFilling(false);
    }
  };

  const handleCreateJob = async () => {
    // P0.7: Only description is truly required
    if (!newJob.description.trim()) {
      toast.error("La descripción de la vacante es requerida");
      return;
    }
    
    setCreating(true);
    
    // Generate title if not provided
    const title = newJob.title.trim() || "Vacante sin título";
    
    const { data: jobData } = await createJob({
      title,
      company: newJob.company || null,
      country: newJob.country || profile?.country || null,
      url: newJob.url || null,
      description: newJob.description,
      salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
      salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
      is_remote: newJob.is_remote,
      source: 'manual',
    });

    // P0.7: Create match record with calculated score
    if (jobData && calculatedMatch) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('matches').insert({
            user_id: user.id,
            job_id: jobData.id,
            score_total: calculatedMatch.score,
            explanation: calculatedMatch.explanation,
            gaps_json: calculatedMatch.gaps,
            score_skills: Math.round(calculatedMatch.score * 0.4),
            score_seniority: Math.round(calculatedMatch.score * 0.2),
            score_semantic: Math.round(calculatedMatch.score * 0.4),
          });
        }
      } catch (error) {
        console.error("Error creating match:", error);
      }
    }

    await refetch();
    setCreating(false);
    setNewJobOpen(false);
    setNewJob({ title: "", company: "", country: profile?.country || "", url: "", description: "", salary_min: "", salary_max: "", is_remote: false });
    setCalculatedMatch(null);
    toast.success("Vacante agregada con score calculado");
  };

  const handleApply = async (job: JobWithMatch) => {
    await createApplication({
      job_id: job.id,
      status: 'saved',
      channel: 'manual',
    });
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesScore = (job.match?.score_total || 0) >= parseInt(minScore);
    const matchesCountry = countryFilter === "all" || job.country === countryFilter;
    
    return matchesSearch && matchesScore && matchesCountry;
  });

  const isJobApplied = (jobId: string) => applications.some(a => a.job_id === jobId);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Vacantes
            </h1>
            <p className="text-muted-foreground">
              Agrega vacantes y obtén tu score de compatibilidad automáticamente.
            </p>
          </div>
          <Dialog open={newJobOpen} onOpenChange={setNewJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar vacante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar nueva vacante</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* P0.7: URL with auto-fill button */}
                <div className="space-y-2">
                  <Label>URL de la oferta</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={newJob.url}
                      onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAutoFill}
                      disabled={autoFilling || !newJob.url}
                    >
                      {autoFilling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-1" />
                          Autocompletar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* P0.7: Description is primary - required */}
                <div className="space-y-2">
                  <Label>Descripción de la vacante *</Label>
                  <Textarea
                    placeholder="Pega aquí la descripción completa de la vacante..."
                    value={newJob.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pega la descripción completa para calcular tu score de compatibilidad
                  </p>
                </div>

                {/* P0.7: Show calculated score preview */}
                {calculatedMatch && (
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score preliminar</span>
                      <span className={`text-2xl font-bold ${
                        calculatedMatch.score >= 70 ? "text-success" :
                        calculatedMatch.score >= 50 ? "text-warning" : "text-muted-foreground"
                      }`}>
                        {calculatedMatch.score}%
                      </span>
                    </div>
                    <Progress value={calculatedMatch.score} className="h-2" />
                    <p className="text-sm text-muted-foreground">{calculatedMatch.explanation}</p>
                    {calculatedMatch.gaps.length > 0 && (
                      <div className="space-y-1">
                        {calculatedMatch.gaps.map((gap, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-warning">
                            <AlertCircle className="w-3 h-3" />
                            {gap}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título del puesto (opcional)</Label>
                    <Input
                      placeholder="Ej: Product Manager Senior"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa (opcional)</Label>
                    <Input
                      placeholder="Nombre de la empresa"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>País</Label>
                    <Select
                      value={newJob.country}
                      onValueChange={(value) => setNewJob({ ...newJob, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona país" />
                      </SelectTrigger>
                      <SelectContent>
                        {paises.map((pais) => (
                          <SelectItem key={pais.value} value={pais.value}>
                            {pais.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newJob.is_remote}
                        onChange={(e) => setNewJob({ ...newJob, is_remote: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Trabajo remoto</span>
                    </label>
                  </div>
                </div>

                <Button onClick={handleCreateJob} disabled={creating || !newJob.description.trim()} className="w-full">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Agregar vacante
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o empresa..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={minScore} onValueChange={setMinScore}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Target className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Min. Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos</SelectItem>
                  <SelectItem value="90">≥90% match</SelectItem>
                  <SelectItem value="70">≥70% match</SelectItem>
                  <SelectItem value="50">≥50% match</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {paises.map((pais) => (
                    <SelectItem key={pais.value} value={pais.value}>
                      {pais.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{filteredJobs.length}</span> vacante(s)
          </p>
        </div>

        {/* Vacantes List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {jobs.length === 0 ? "No tienes vacantes aún" : "No hay vacantes que coincidan"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {jobs.length === 0 
                      ? "Agrega tu primera vacante pegando la descripción del puesto"
                      : "Intenta ajustar los filtros de búsqueda"}
                  </p>
                  {jobs.length === 0 && (
                    <Button onClick={() => setNewJobOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar primera vacante
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((vacante) => (
              <Card key={vacante.id} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-lg text-foreground">{vacante.title}</h3>
                            {vacante.is_remote && (
                              <Badge className="bg-info/10 text-info border-0">
                                <Globe className="w-3 h-3 mr-1" />
                                Remoto
                              </Badge>
                            )}
                            {isJobApplied(vacante.id) && (
                              <Badge className="bg-success/10 text-success border-0">
                                En proceso
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{vacante.company || 'Sin empresa'}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {vacante.country && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {paises.find(p => p.value === vacante.country)?.label || vacante.country}
                              </span>
                            )}
                            {(vacante.salary_min || vacante.salary_max) && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {vacante.salary_min && vacante.salary_max 
                                  ? `$${vacante.salary_min.toLocaleString()} - $${vacante.salary_max.toLocaleString()}`
                                  : vacante.salary_min 
                                    ? `Desde $${vacante.salary_min.toLocaleString()}`
                                    : `Hasta $${vacante.salary_max?.toLocaleString()}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(vacante.created_at), "d MMM", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* P0.7: Score & explanation */}
                    <div className="lg:w-72 shrink-0">
                      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                          <span className={`text-2xl font-bold ${
                            (vacante.match?.score_total || 0) >= 70 ? "text-success" :
                            (vacante.match?.score_total || 0) >= 50 ? "text-warning" : "text-muted-foreground"
                          }`}>
                            {vacante.match?.score_total || 0}%
                          </span>
                        </div>
                        <Progress value={vacante.match?.score_total || 0} className="h-2" />
                        {vacante.match?.explanation && (
                          <p className="text-xs text-muted-foreground">{vacante.match.explanation}</p>
                        )}
                        {vacante.match?.gaps_json && Array.isArray(vacante.match.gaps_json) && vacante.match.gaps_json.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground">Gaps detectados:</p>
                            {(vacante.match.gaps_json as string[]).slice(0, 2).map((gap, i) => (
                              <div key={i} className="flex items-start gap-1 text-xs text-warning">
                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{gap}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 shrink-0">
                      {!isJobApplied(vacante.id) ? (
                        <Button className="flex-1 lg:flex-none" onClick={() => handleApply(vacante)}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                      ) : (
                        <Button variant="secondary" className="flex-1 lg:flex-none" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Guardado
                        </Button>
                      )}
                      <div className="flex gap-2">
                        {vacante.url && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={vacante.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => deleteJob(vacante.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}