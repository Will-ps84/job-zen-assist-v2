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
  SlidersHorizontal,
  Loader2,
  Trash2,
  Globe,
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

const paises = [
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Perú" },
  { value: "CL", label: "Chile" },
];

export default function Vacantes() {
  const { jobs, loading, createJob, deleteJob } = useJobs();
  const { createApplication, applications } = useApplications();
  
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [countryFilter, setCountryFilter] = useState("all");
  
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    country: "",
    url: "",
    description: "",
    salary_min: "",
    salary_max: "",
    is_remote: false,
  });

  const handleCreateJob = async () => {
    if (!newJob.title.trim()) return;
    setCreating(true);
    await createJob({
      title: newJob.title,
      company: newJob.company || null,
      country: newJob.country || null,
      url: newJob.url || null,
      description: newJob.description || null,
      salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
      salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
      is_remote: newJob.is_remote,
      source: 'manual',
    });
    setCreating(false);
    setNewJobOpen(false);
    setNewJob({ title: "", company: "", country: "", url: "", description: "", salary_min: "", salary_max: "", is_remote: false });
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

  // Check if job is already in applications
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
              Agrega y gestiona tus oportunidades laborales.
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título del puesto *</Label>
                    <Input
                      placeholder="Ej: Product Manager Senior"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa</Label>
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
                  <div className="space-y-2">
                    <Label>URL de la oferta</Label>
                    <Input
                      placeholder="https://..."
                      value={newJob.url}
                      onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salario mínimo (USD)</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={newJob.salary_min}
                      onChange={(e) => setNewJob({ ...newJob, salary_min: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salario máximo (USD)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={newJob.salary_max}
                      onChange={(e) => setNewJob({ ...newJob, salary_max: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción de la vacante</Label>
                  <Textarea
                    placeholder="Pega aquí la descripción completa de la vacante..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-remote"
                    checked={newJob.is_remote}
                    onChange={(e) => setNewJob({ ...newJob, is_remote: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="is-remote" className="cursor-pointer">Es trabajo remoto</Label>
                </div>
                <Button onClick={handleCreateJob} disabled={creating || !newJob.title.trim()} className="w-full">
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
                  <SelectItem value="95">≥95% match</SelectItem>
                  <SelectItem value="90">≥90% match</SelectItem>
                  <SelectItem value="85">≥85% match</SelectItem>
                  <SelectItem value="80">≥80% match</SelectItem>
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
                      ? "Agrega tu primera vacante para empezar a trackear oportunidades"
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
                                  ? `$${vacante.salary_min.toLocaleString()} - $${vacante.salary_max.toLocaleString()} USD`
                                  : vacante.salary_min 
                                    ? `Desde $${vacante.salary_min.toLocaleString()} USD`
                                    : `Hasta $${vacante.salary_max?.toLocaleString()} USD`}
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

                    {/* Score & XAI */}
                    {vacante.match && (
                      <div className="lg:w-72 shrink-0">
                        <div className="bg-muted/50 rounded-xl p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                            <span className={`text-2xl font-bold ${
                              vacante.match.score_total >= 90 ? "text-success" :
                              vacante.match.score_total >= 80 ? "text-warning" : "text-muted-foreground"
                            }`}>
                              {vacante.match.score_total}%
                            </span>
                          </div>
                          <Progress value={vacante.match.score_total} className="h-2" />
                          {vacante.match.explanation && (
                            <p className="text-xs text-muted-foreground">{vacante.match.explanation}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 shrink-0">
                      {!isJobApplied(vacante.id) ? (
                        <Button className="flex-1 lg:flex-none" onClick={() => handleApply(vacante)}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                      ) : (
                        <Button variant="secondary" className="flex-1 lg:flex-none" disabled>
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
