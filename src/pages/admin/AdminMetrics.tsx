import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminData } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  FileText, 
  Target, 
  Send,
  TrendingUp,
  Globe,
  Loader2,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare
} from 'lucide-react';

export default function AdminMetrics() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { stats, loading } = useAdminData();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading || loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalApplications = Object.values(stats.applicationsByStatus).reduce((a, b) => a + b, 0);

  const kpiCards = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Nuevos (7 días)',
      value: stats.newUsersLast7Days,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Nuevos (30 días)',
      value: stats.newUsersLast30Days,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'CVs Creados',
      value: stats.totalCVs,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Historias STAR',
      value: stats.totalSTAR,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Vacantes Agregadas',
      value: stats.totalJobs,
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Matches Creados',
      value: stats.totalMatches,
      icon: CheckCircle2,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Simulaciones',
      value: stats.totalInterviewSims,
      icon: MessageSquare,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  const statusLabels: Record<string, string> = {
    saved: 'Guardada',
    Guardada: 'Guardada',
    applied: 'Aplicada',
    Aplicada: 'Aplicada',
    Entrevista: 'Entrevista',
    Oferta: 'Oferta',
    Cerrada: 'Cerrada',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Métricas Globales
            </h1>
            <p className="text-muted-foreground">Datos anonimizados del sistema</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Onboarding Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Tasa de Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Completado</span>
                    <span className="font-medium">{stats.onboardingRate}%</span>
                  </div>
                  <Progress value={stats.onboardingRate} className="h-3" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.onboardingCompleted} de {stats.totalUsers} usuarios completaron el onboarding
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Funnel de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Onboarding', value: stats.onboardingRate },
                  { label: 'Subió CV', value: stats.funnelCVRate },
                  { label: 'Creó STAR', value: stats.funnelSTARRate },
                  { label: 'Agregó Vacante', value: stats.funnelJobRate },
                  { label: 'Generó Match', value: stats.funnelMatchRate },
                  { label: 'Usó Kanban', value: stats.funnelKanbanRate },
                  { label: 'Completó Simulador', value: stats.funnelSimRate },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applications Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Funnel de Postulaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.applicationsByStatus).map(([status, count]) => {
                  const percentage = totalApplications > 0 
                    ? Math.round((count / totalApplications) * 100) 
                    : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{statusLabels[status] || status}</span>
                        <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
                {Object.keys(stats.applicationsByStatus).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin postulaciones aún
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Distribución por País
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.topCountries.map((country, i) => {
                  const countryNames: Record<string, string> = {
                    MX: 'México',
                    AR: 'Argentina',
                    CO: 'Colombia',
                    PE: 'Perú',
                    CL: 'Chile',
                  };
                  const percentage = stats.totalUsers > 0 
                    ? Math.round((country.count / stats.totalUsers) * 100) 
                    : 0;
                  return (
                    <div key={country.country} className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{country.count}</p>
                      <p className="text-sm font-medium">{countryNames[country.country] || country.country}</p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  );
                })}
                {stats.topCountries.length === 0 && (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-4">
                    Sin datos de países
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
