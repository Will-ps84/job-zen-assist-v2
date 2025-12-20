import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileStack,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCVAnalyses } from "@/hooks/useCVAnalyses";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { analyses, loading } = useCVAnalyses();

  // Calculate B2B metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthAnalyses = analyses.filter(a => {
    const date = new Date(a.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalCVsAnalyzed = analyses.reduce((sum, a) => sum + a.total_cvs, 0);
  const thisMonthCVs = thisMonthAnalyses.reduce((sum, a) => sum + a.total_cvs, 0);
  
  // Estimate hours saved: 3 min per CV manual review → 0.05 hours per CV
  const hoursSaved = Math.round(totalCVsAnalyzed * 0.05);
  
  // Processes with recommended candidates
  const processesWithCandidates = analyses.filter(
    a => a.top_candidates && a.top_candidates.length > 0
  ).length;

  const companyName = profile?.full_name || user?.email?.split("@")[0] || "Empresa";

  const stats = [
    {
      title: "Vacantes analizadas",
      value: thisMonthAnalyses.length.toString(),
      subtitle: "este mes",
      icon: FileStack,
      color: "primary",
    },
    {
      title: "CVs analizados",
      value: thisMonthCVs.toString(),
      subtitle: `${totalCVsAnalyzed} en total`,
      icon: Users,
      color: "info",
    },
    {
      title: "Horas ahorradas",
      value: `${hoursSaved}h`,
      subtitle: "vs filtrado manual",
      icon: Clock,
      color: "accent",
    },
    {
      title: "Procesos con candidatos",
      value: processesWithCandidates.toString(),
      subtitle: "con recomendaciones",
      icon: TrendingUp,
      color: "success",
    },
  ];

  // Recent analyses for quick access
  const recentAnalyses = analyses.slice(0, 5);

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
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              ¡Hola, {companyName}! 👋
            </h1>
            <p className="text-muted-foreground">
              {analyses.length > 0
                ? "Continúa analizando CVs y encontrando el mejor talento."
                : "Empieza subiendo CVs y analizando candidatos para tus vacantes."}
            </p>
          </div>
          <Button size="lg" asChild className="shrink-0">
            <Link to="/app/screener">
              <Sparkles className="w-5 h-5 mr-2" />
              Nuevo análisis de CVs
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : stat.color === "info"
                        ? "bg-blue-500/10 text-blue-500"
                        : stat.color === "accent"
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/app/screener">
                  <FileStack className="w-4 h-4 mr-2" />
                  Analizar nuevos CVs
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/app/screener/history">
                  <Clock className="w-4 h-4 mr-2" />
                  Ver historial de procesos
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/app/configuracion">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Gestionar facturación
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Processes */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileStack className="w-5 h-5 text-primary" />
                Procesos recientes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/screener/history">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <FileStack className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Aún no has analizado ninguna vacante
                  </p>
                  <Button asChild>
                    <Link to="/app/screener">Iniciar primer análisis</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {analysis.job_title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{analysis.total_cvs} CVs</span>
                          <span className="text-muted-foreground/50">•</span>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.top_candidates && analysis.top_candidates[0] && (
                          <Badge 
                            variant={analysis.top_candidates[0].score >= 85 ? "default" : "secondary"}
                            className="shrink-0"
                          >
                            Top: {analysis.top_candidates[0].score}%
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/app/screener/history">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner */}
        <Card className="border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Analiza CVs en segundos con IA
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sube hasta 100 CVs en un ZIP, pega la descripción del puesto y obtén el 
                  Top 5 candidatos rankeados con logros STAR y score de compatibilidad.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/app/screener">
                  <FileStack className="w-5 h-5 mr-2" />
                  Nuevo análisis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
