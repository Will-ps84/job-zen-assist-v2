import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  Plus,
  Building,
  MapPin,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  MessageSquare,
  FileText,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  { id: "saved", title: "Guardada", color: "muted" },
  { id: "applied", title: "Aplicada", color: "info" },
  { id: "interview", title: "Entrevista", color: "accent" },
  { id: "offer", title: "Oferta", color: "success" },
  { id: "closed", title: "Cerrada", color: "muted" },
];

const applications = [
  {
    id: 1,
    title: "Senior Product Manager",
    company: "TechCorp México",
    location: "CDMX",
    status: "applied",
    appliedDate: "15 Dic 2024",
    nextStep: "Esperando respuesta",
    channel: "LinkedIn",
    notes: 2,
  },
  {
    id: 2,
    title: "Product Lead",
    company: "Startup LATAM",
    location: "Remoto",
    status: "interview",
    appliedDate: "12 Dic 2024",
    nextStep: "Entrevista técnica - 20 Dic",
    channel: "Referido",
    notes: 4,
  },
  {
    id: 3,
    title: "Director de Producto",
    company: "Empresa Global",
    location: "Buenos Aires",
    status: "saved",
    appliedDate: null,
    nextStep: "Preparar CV adaptado",
    channel: "Bumeran",
    notes: 0,
  },
  {
    id: 4,
    title: "Head of Product",
    company: "Fintech Chile",
    location: "Santiago",
    status: "offer",
    appliedDate: "5 Dic 2024",
    nextStep: "Negociación salarial",
    channel: "LinkedIn",
    notes: 6,
  },
  {
    id: 5,
    title: "Product Manager Sr",
    company: "E-commerce Co",
    location: "Lima",
    status: "closed",
    appliedDate: "1 Dic 2024",
    nextStep: "Rechazado - Muy senior",
    channel: "Manual",
    notes: 1,
  },
];

function getColumnApplications(columnId: string) {
  return applications.filter((app) => app.status === columnId);
}

export default function Postulaciones() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Mis Postulaciones
            </h1>
            <p className="text-muted-foreground">
              Pipeline visual de tu campaña de búsqueda.{" "}
              <span className="text-foreground font-medium">
                {applications.length}
              </span>{" "}
              oportunidades activas.
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva postulación
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {columns.map((col) => {
            const count = getColumnApplications(col.id).length;
            return (
              <div
                key={col.id}
                className="bg-card rounded-xl border border-border p-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{col.title}</p>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => {
              const columnApps = getColumnApplications(column.id);
              return (
                <div
                  key={column.id}
                  className="w-80 bg-muted/30 rounded-xl border border-border"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            column.color === "info"
                              ? "bg-info"
                              : column.color === "accent"
                              ? "bg-accent"
                              : column.color === "success"
                              ? "bg-success"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <h3 className="font-semibold text-foreground">
                          {column.title}
                        </h3>
                        <Badge variant="secondary">{columnApps.length}</Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                    {columnApps.map((app) => (
                      <Card
                        key={app.id}
                        className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground text-sm">
                                {app.title}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Building className="w-3 h-3" />
                                {app.company}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                <DropdownMenuItem>Mover a...</DropdownMenuItem>
                                <DropdownMenuItem>Agregar nota</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <MapPin className="w-3 h-3" />
                            {app.location}
                            <span>•</span>
                            {app.channel}
                          </div>

                          {app.nextStep && (
                            <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-2 py-1.5 mb-3">
                              <Clock className="w-3 h-3 text-primary" />
                              <span className="text-foreground">
                                {app.nextStep}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {app.appliedDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {app.appliedDate}
                              </span>
                            )}
                            {app.notes > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {app.notes}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnApps.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Sin postulaciones
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
