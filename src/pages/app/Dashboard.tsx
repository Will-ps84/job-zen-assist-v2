import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Target,
  Send,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare,
  Star,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useResumes } from "@/hooks/useResumes";
import { useApplications } from "@/hooks/useApplications";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { resumes, loading: resumesLoading } = useResumes();
  const { applications, getStats, loading: appsLoading } = useApplications();
  const { jobs, getHighMatchJobs, loading: jobsLoading } = useJobs();

  const loading = profileLoading || resumesLoading || appsLoading || jobsLoading;

  // Calculate stats
  const appStats = getStats();
  const highMatchJobs = getHighMatchJobs(85);
  const interviewRate = appStats.applied > 0 
    ? Math.round((appStats.interview / appStats.applied) * 100) 
    : 0;

  // Calculate profile completion
  const profileFields = [
    profile?.country,
    profile?.role_target,
    profile?.seniority,
    profile?.skills?.length,
    profile?.salary_min,
    profile?.english_level,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const stats = [
    {
      title: "Score de Perfil",
      value: `${profileCompletion}%`,
      change: profile?.onboarding_completed ? "Onboarding completo" : "Completa tu perfil",
      icon: Target,
      color: "primary",
    },
    {
      title: "CVs Creados",
      value: resumes.length.toString(),
      change: resumes.some(r => r.is_master) ? "CV Maestro activo" : "Crea tu CV Maestro",
      icon: FileText,
      color: "info",
    },
    {
      title: "Postulaciones",
      value: appStats.total.toString(),
      change: `${appStats.interview} en entrevista`,
      icon: Send,
      color: "accent",
    },
    {
      title: "Tasa Entrevistas",
      value: `${interviewRate}%`,
      change: `${appStats.interview} de ${appStats.applied} aplicadas`,
      icon: TrendingUp,
      color: "success",
    },
  ];

  // Build pending tasks
  const pendingTasks = [];
  
  if (!profile?.onboarding_completed) {
    pendingTasks.push({
      id: 'onboarding',
      title: "Completar onboarding",
      description: "Configura tu perfil para mejores matches",
      type: "warning",
      action: "/app/onboarding",
    });
  }
  
  if (!resumes.some(r => r.is_master)) {
    pendingTasks.push({
      id: 'master-cv',
      title: "Crear CV Maestro",
      description: "Sube tu CV principal para empezar",
      type: "warning",
      action: "/app/cv",
    });
  }

  if (highMatchJobs.length > 0) {
    pendingTasks.push({
      id: 'new-match',
      title: "Nueva vacante con alto match",
      description: `${highMatchJobs.length} vacante(s) con ≥85% compatibilidad`,
      type: "success",
      action: "/app/vacantes",
    });
  }

  const pendingApps = applications.filter(a => a.status === 'applied');
  if (pendingApps.length > 0) {
    const oldestApp = pendingApps[pendingApps.length - 1];
    if (oldestApp.applied_at) {
      const daysSince = Math.floor((Date.now() - new Date(oldestApp.applied_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 7) {
        pendingTasks.push({
          id: 'followup',
          title: "Seguimiento pendiente",
          description: `Han pasado ${daysSince} días desde tu postulación a ${oldestApp.job?.company || 'empresa'}`,
          type: "info",
          action: "/app/postulaciones",
        });
      }
    }
  }

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

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
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            ¡Hola, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {appStats.interview > 0 
              ? "Tu progreso esta semana se ve prometedor. Sigue así."
              : "Empieza agregando vacantes y postulándote."}
          </p>
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
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : stat.color === "info"
                        ? "bg-info/10 text-info"
                        : stat.color === "accent"
                        ? "bg-accent/10 text-accent"
                        : "bg-success/10 text-success"
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
          {/* Pending Tasks */}
          <Card className="lg:col-span-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Tareas pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ¡Todo al día! 🎉
                </p>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <Link
                    key={task.id}
                    to={task.action}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    {task.type === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    ) : task.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-info shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Vacantes con alto match
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/vacantes">
                  Ver todas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highMatchJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No tienes vacantes con alto match aún
                    </p>
                    <Button asChild>
                      <Link to="/app/vacantes">Agregar vacante</Link>
                    </Button>
                  </div>
                ) : (
                  highMatchJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {job.match?.score_total || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">match</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          Alto match
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mentor CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => {}}>
            <Link to="/app/entrevistas" className="block">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Practicar entrevista
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Simula una entrevista y recibe feedback instantáneo
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="border-border hover:border-primary/30 transition-colors group cursor-pointer">
            <Link to="/app/star" className="block">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Star className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Documentar logro
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Crea un logro STAR para destacar en entrevistas
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="border-border hover:border-primary/30 transition-colors group cursor-pointer">
            <Link to="/app/vacantes" className="block">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                    <Sparkles className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Agregar vacante
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza tu compatibilidad con una oferta
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <Card className="border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Tu perfil está al {profileCompletion}%
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Completa tu perfil para obtener mejores matches con vacantes. 
                    Un perfil completo aumenta tus probabilidades de encontrar el trabajo ideal.
                  </p>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                <Button asChild>
                  <Link to="/app/onboarding">
                    Completar perfil
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
