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
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Score de Perfil",
    value: "72%",
    change: "+5% esta semana",
    icon: Target,
    color: "primary",
  },
  {
    title: "CVs Creados",
    value: "3",
    change: "1 pendiente de optimizar",
    icon: FileText,
    color: "info",
  },
  {
    title: "Postulaciones",
    value: "12",
    change: "4 en proceso",
    icon: Send,
    color: "accent",
  },
  {
    title: "Tasa Entrevistas",
    value: "25%",
    change: "3 de 12 postulaciones",
    icon: TrendingUp,
    color: "success",
  },
];

const pendingTasks = [
  {
    id: 1,
    title: "Completar logros STAR",
    description: "Tienes 2 experiencias sin logros cuantificados",
    type: "warning",
    action: "/app/cv",
  },
  {
    id: 2,
    title: "Revisar match de vacante",
    description: "Nueva vacante con 94% de compatibilidad",
    type: "success",
    action: "/app/vacantes",
  },
  {
    id: 3,
    title: "Seguimiento pendiente",
    description: "Han pasado 7 días desde tu postulación a TechCorp",
    type: "info",
    action: "/app/postulaciones",
  },
];

const recentJobs = [
  {
    id: 1,
    title: "Senior Product Manager",
    company: "TechCorp México",
    score: 94,
    status: "new",
  },
  {
    id: 2,
    title: "Product Lead",
    company: "Startup LATAM",
    score: 91,
    status: "applied",
  },
  {
    id: 3,
    title: "Director de Producto",
    company: "Empresa Global",
    score: 88,
    status: "interview",
  },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            ¡Hola, Usuario! 👋
          </h1>
          <p className="text-muted-foreground">
            Tu progreso esta semana se ve prometedor. Sigue así.
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
              {pendingTasks.map((task) => (
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
              ))}
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
                {recentJobs.map((job) => (
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
                          {job.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">match</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === "new"
                            ? "bg-success/10 text-success"
                            : job.status === "applied"
                            ? "bg-info/10 text-info"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {job.status === "new"
                          ? "Nuevo"
                          : job.status === "applied"
                          ? "Aplicado"
                          : "Entrevista"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Completa tu perfil para mejor matching
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tu perfil está al 72%. Agrega más logros STAR para aumentar tu
                  puntuación y conseguir mejores matches.
                </p>
                <Progress value={72} className="h-2" />
              </div>
              <Button asChild>
                <Link to="/app/perfil">
                  Completar perfil
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
