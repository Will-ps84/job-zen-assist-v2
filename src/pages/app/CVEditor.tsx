import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  Edit3,
  Copy,
  Trash2,
} from "lucide-react";

const cvVersions = [
  {
    id: "master",
    name: "CV Maestro",
    isMaster: true,
    atsScore: 78,
    lastUpdated: "Hace 2 días",
    starLogros: 8,
  },
  {
    id: "v1",
    name: "CV - Product Manager TechCorp",
    isMaster: false,
    atsScore: 92,
    lastUpdated: "Hace 1 hora",
    starLogros: 6,
  },
  {
    id: "v2",
    name: "CV - Lead Startup LATAM",
    isMaster: false,
    atsScore: 88,
    lastUpdated: "Ayer",
    starLogros: 5,
  },
];

const starLogros = [
  {
    id: 1,
    experience: "Product Manager en Empresa ABC",
    situation: "El departamento tenía problemas de alineación entre equipos",
    task: "Implementar metodología ágil cross-funcional",
    action: "Diseñé e implementé un framework de OKRs con ceremonies semanales",
    result: "Reduje el time-to-market en un 35% en 6 meses",
    metrics: { percentage: 35, timeframe: "6 meses" },
    confidence: 95,
  },
  {
    id: 2,
    experience: "Product Manager en Empresa ABC",
    situation: "La retención de usuarios estaba cayendo 5% mensual",
    task: "Mejorar engagement y retención",
    action: "Implementé sistema de gamificación y onboarding personalizado",
    result: "Aumenté retención en 22% y NPS de 45 a 67",
    metrics: { retention: 22, nps: { from: 45, to: 67 } },
    confidence: 90,
  },
];

const atsChecklist = [
  { id: 1, label: "Keywords del rol objetivo presentes", status: "pass" },
  { id: 2, label: "Formato compatible con ATS", status: "pass" },
  { id: 3, label: "Logros cuantificados con métricas", status: "warning" },
  { id: 4, label: "Experiencia con verbos de acción", status: "pass" },
  { id: 5, label: "Educación y certificaciones claras", status: "pass" },
  { id: 6, label: "Información de contacto completa", status: "fail" },
];

export default function CVEditor() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              CV & Motor STAR
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu CV Maestro, versiones adaptadas y logros cuantificables.
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva versión de CV
          </Button>
        </div>

        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="versions">
              <FileText className="w-4 h-4 mr-2" />
              Mis CVs
            </TabsTrigger>
            <TabsTrigger value="star">
              <Sparkles className="w-4 h-4 mr-2" />
              Motor STAR
            </TabsTrigger>
            <TabsTrigger value="ats">
              <Target className="w-4 h-4 mr-2" />
              Score ATS
            </TabsTrigger>
          </TabsList>

          {/* CV Versions Tab */}
          <TabsContent value="versions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvVersions.map((cv) => (
                <Card
                  key={cv.id}
                  className={`border-border relative ${
                    cv.isMaster ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {cv.isMaster && (
                    <Badge className="absolute -top-2 left-4 bg-primary">
                      Maestro
                    </Badge>
                  )}
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!cv.isMaster && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {cv.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Actualizado {cv.lastUpdated}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score ATS</span>
                        <span className="font-semibold text-foreground">
                          {cv.atsScore}%
                        </span>
                      </div>
                      <Progress value={cv.atsScore} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Logros STAR</span>
                        <span className="font-semibold text-foreground">
                          {cv.starLogros}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add new CV card */}
              <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Crear nueva versión
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adapta tu CV para una vacante específica
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Motor STAR Tab */}
          <TabsContent value="star" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tus logros STAR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {starLogros.map((logro) => (
                  <div
                    key={logro.id}
                    className="p-4 rounded-xl border border-border bg-muted/30 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {logro.experience}
                        </h4>
                        <Badge variant="secondary" className="mt-1">
                          Confianza: {logro.confidence}%
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary">
                          Situación:
                        </span>
                        <p className="text-muted-foreground">{logro.situation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary">Tarea:</span>
                        <p className="text-muted-foreground">{logro.task}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary">Acción:</span>
                        <p className="text-muted-foreground">{logro.action}</p>
                      </div>
                      <div>
                        <span className="font-medium text-success">
                          Resultado:
                        </span>
                        <p className="text-foreground font-medium">
                          {logro.result}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar nuevo logro STAR
                </Button>
              </CardContent>
            </Card>

            {/* STAR Helper */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      ¿Cómo escribir un buen logro STAR?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      El motor STAR te hace preguntas para transformar tus
                      responsabilidades en logros medibles que impresionen a
                      reclutadores.
                    </p>
                    <Button size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Iniciar asistente STAR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ATS Score Tab */}
          <TabsContent value="ats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Score ATS actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-primary mb-2">
                      78%
                    </div>
                    <p className="text-muted-foreground">
                      Tu CV Maestro necesita algunas mejoras
                    </p>
                  </div>
                  <Progress value={78} className="h-3 mb-6" />
                  <div className="space-y-3">
                    {atsChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm text-foreground">
                          {item.label}
                        </span>
                        {item.status === "pass" ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : item.status === "warning" ? (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Sugerencias de mejora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Logros sin cuantificar
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tienes 2 experiencias donde los logros no incluyen métricas
                      (%, $, tiempo). Los reclutadores valoran datos concretos.
                    </p>
                    <p className="text-xs text-primary">
                      💡 <strong>Por qué importa:</strong> Los CVs con métricas
                      tienen 40% más probabilidad de pasar el ATS.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Información de contacto incompleta
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Falta tu número de teléfono. Algunos ATS descartan CVs sin
                      datos de contacto completos.
                    </p>
                    <Button size="sm" variant="outline">
                      Completar perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
