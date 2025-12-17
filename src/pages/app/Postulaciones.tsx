import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Building,
  MapPin,
  Calendar,
  MoreHorizontal,
  MessageSquare,
  Clock,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApplications, type ApplicationWithJob } from "@/hooks/useApplications";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { NextActionBanner } from "@/components/app/MentorProgress";

const columns = [
  { id: "saved", title: "Guardada", color: "muted" },
  { id: "applied", title: "Aplicada", color: "info" },
  { id: "interview", title: "Entrevista", color: "accent" },
  { id: "offer", title: "Oferta", color: "success" },
  { id: "closed", title: "Cerrada", color: "muted" },
] as const;

const paises: Record<string, string> = {
  MX: "México",
  AR: "Argentina",
  CO: "Colombia",
  PE: "Perú",
  CL: "Chile",
};

export default function Postulaciones() {
  const { applications, loading, updateApplication, deleteApplication, getByStatus, getStats } = useApplications();
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState("");

  const stats = getStats();

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await updateApplication(appId, { status: newStatus });
  };

  const handleSaveNotes = async (appId: string) => {
    await updateApplication(appId, { notes: currentNotes });
    setNotesOpen(null);
  };

  const openNotesDialog = (app: ApplicationWithJob) => {
    setCurrentNotes(app.notes || "");
    setNotesOpen(app.id);
  };

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
              Mis Postulaciones
            </h1>
            <p className="text-muted-foreground">
              Pipeline visual de tu campaña de búsqueda.{" "}
              <span className="text-foreground font-medium">{applications.length}</span> oportunidades activas.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/vacantes">
              <Plus className="w-4 h-4 mr-2" />
              Nueva postulación
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{getByStatus(col.id).length}</p>
              <p className="text-sm text-muted-foreground">{col.title}</p>
            </div>
          ))}
        </div>

        {/* Mentor Next Action */}
        {stats.saved > 0 && stats.applied === 0 && (
          <NextActionBanner
            icon={<Target className="w-5 h-5" />}
            title="Siguiente paso: ¡Postúlate!"
            description={`Tienes ${stats.saved} vacante(s) guardada(s). Es momento de aplicar.`}
            href="/app/vacantes"
            ctaLabel="Ver vacantes"
          />
        )}
        {stats.interview > 0 && (
          <NextActionBanner
            icon={<MessageSquare className="w-5 h-5" />}
            title="Prepárate para tu entrevista"
            description="Practica con el simulador para estar listo"
            href="/app/entrevistas"
            ctaLabel="Practicar"
          />
        )}

        {/* Kanban Board */}
        {applications.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No tienes postulaciones aún
                </h3>
                <p className="text-muted-foreground mb-6">
                  Empieza agregando vacantes y guardándolas para hacer seguimiento
                </p>
                <Button asChild>
                  <Link to="/app/vacantes">
                    <Plus className="w-4 h-4 mr-2" />
                    Ver vacantes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {columns.map((column) => {
                const columnApps = getByStatus(column.id);
                return (
                  <div key={column.id} className="w-80 bg-muted/30 rounded-xl border border-border">
                    {/* Column Header */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            column.color === "info" ? "bg-info" :
                            column.color === "accent" ? "bg-accent" :
                            column.color === "success" ? "bg-success" : "bg-muted-foreground"
                          }`} />
                          <h3 className="font-semibold text-foreground">{column.title}</h3>
                          <Badge variant="secondary">{columnApps.length}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                      {columnApps.map((app) => (
                        <Card key={app.id} className="border-border hover:border-primary/30 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground text-sm truncate">
                                  {app.job?.title || 'Sin título'}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Building className="w-3 h-3" />
                                  {app.job?.company || 'Sin empresa'}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openNotesDialog(app)}>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Agregar nota
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {columns.filter(c => c.id !== app.status).map((col) => (
                                    <DropdownMenuItem key={col.id} onClick={() => handleStatusChange(app.id, col.id)}>
                                      <ArrowRight className="w-4 h-4 mr-2" />
                                      Mover a {col.title}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteApplication(app.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              {app.job?.country && (
                                <>
                                  <MapPin className="w-3 h-3" />
                                  {paises[app.job.country] || app.job.country}
                                  <span>•</span>
                                </>
                              )}
                              {app.channel || 'Manual'}
                            </div>

                            {app.next_step_date && (
                              <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-2 py-1.5 mb-3">
                                <Clock className="w-3 h-3 text-primary" />
                                <span className="text-foreground">
                                  Próximo: {format(new Date(app.next_step_date), "d MMM", { locale: es })}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              {app.applied_at && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(app.applied_at), "d MMM yyyy", { locale: es })}
                                </span>
                              )}
                              {app.notes && (
                                <span 
                                  className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground"
                                  onClick={() => openNotesDialog(app)}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Nota
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {columnApps.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">Sin postulaciones</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Dialog */}
        <Dialog open={!!notesOpen} onOpenChange={() => setNotesOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notas de la postulación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Agrega notas sobre esta postulación..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                rows={6}
              />
              <Button onClick={() => notesOpen && handleSaveNotes(notesOpen)} className="w-full">
                Guardar notas
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
