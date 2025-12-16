import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Search,
  Plus,
  ExternalLink,
  MapPin,
  Building,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const vacantes = [
  {
    id: 1,
    title: "Senior Product Manager",
    company: "TechCorp México",
    location: "CDMX, México",
    salary: "$45,000 - $60,000 MXN",
    score: 94,
    status: "new",
    postedAgo: "Hace 2 horas",
    source: "LinkedIn",
    gaps: [],
    strengths: ["Product Management", "Agile", "Fintech"],
  },
  {
    id: 2,
    title: "Product Lead",
    company: "Startup LATAM",
    location: "Remoto (LATAM)",
    salary: "$4,000 - $6,000 USD",
    score: 91,
    status: "saved",
    postedAgo: "Hace 1 día",
    source: "Manual",
    gaps: ["Experiencia B2C"],
    strengths: ["Liderazgo", "OKRs", "Data-driven"],
  },
  {
    id: 3,
    title: "Director de Producto",
    company: "Empresa Global",
    location: "Buenos Aires, Argentina",
    salary: "$800,000 - $1,200,000 ARS",
    score: 88,
    status: "applied",
    postedAgo: "Hace 3 días",
    source: "Bumeran",
    gaps: ["Industria Retail", "Gestión de P&L"],
    strengths: ["Estrategia", "Equipos grandes"],
  },
  {
    id: 4,
    title: "Head of Product",
    company: "Fintech Chile",
    location: "Santiago, Chile",
    salary: "$4,500,000 - $6,000,000 CLP",
    score: 86,
    status: "new",
    postedAgo: "Hace 5 días",
    source: "LinkedIn",
    gaps: ["Regulación financiera"],
    strengths: ["Product Strategy", "Payments"],
  },
];

export default function Vacantes() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Vacantes con alto match
            </h1>
            <p className="text-muted-foreground">
              Solo vacantes con ≥90% de compatibilidad semántica con tu perfil.
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar vacante
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, empresa o ubicación..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="90">
                <SelectTrigger className="w-full md:w-[180px]">
                  <Target className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Min. Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="95">≥95% match</SelectItem>
                  <SelectItem value="90">≥90% match</SelectItem>
                  <SelectItem value="85">≥85% match</SelectItem>
                  <SelectItem value="80">≥80% match</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="MX">México</SelectItem>
                  <SelectItem value="AR">Argentina</SelectItem>
                  <SelectItem value="CO">Colombia</SelectItem>
                  <SelectItem value="PE">Perú</SelectItem>
                  <SelectItem value="CL">Chile</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Más filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">4</span>{" "}
            vacantes con alto match
          </p>
          <Select defaultValue="score">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Mayor score</SelectItem>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="salary">Mayor salario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vacantes List */}
        <div className="space-y-4">
          {vacantes.map((vacante) => (
            <Card
              key={vacante.id}
              className="border-border hover:border-primary/30 transition-colors"
            >
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
                          <h3 className="font-semibold text-lg text-foreground">
                            {vacante.title}
                          </h3>
                          {vacante.status === "new" && (
                            <Badge className="bg-success/10 text-success border-0">
                              Nuevo
                            </Badge>
                          )}
                          {vacante.status === "saved" && (
                            <Badge variant="secondary">Guardado</Badge>
                          )}
                          {vacante.status === "applied" && (
                            <Badge className="bg-info/10 text-info border-0">
                              Aplicado
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {vacante.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {vacante.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {vacante.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {vacante.postedAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score & XAI */}
                  <div className="lg:w-72 shrink-0">
                    <div className="bg-muted/50 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Match Score
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            vacante.score >= 90
                              ? "text-success"
                              : vacante.score >= 80
                              ? "text-warning"
                              : "text-muted-foreground"
                          }`}
                        >
                          {vacante.score}%
                        </span>
                      </div>
                      <Progress value={vacante.score} className="h-2" />

                      {/* Strengths */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Fortalezas que matchean
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {vacante.strengths.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Gaps */}
                      {vacante.gaps.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Posibles gaps
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {vacante.gaps.map((g) => (
                              <span
                                key={g}
                                className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    {vacante.status !== "applied" ? (
                      <Button className="flex-1 lg:flex-none">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Preparar postulación
                      </Button>
                    ) : (
                      <Button variant="secondary" className="flex-1 lg:flex-none">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Ver postulación
                      </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
