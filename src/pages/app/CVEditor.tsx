import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Sparkles,
  Lightbulb,
  Target,
  Edit3,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { useSTAR } from "@/hooks/useSTAR";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CVEditor() {
  const { resumes, loading, createResume, deleteResume } = useResumes();
  const { stories, loading: starLoading, createStory, deleteStory } = useSTAR();
  
  const [newCVOpen, setNewCVOpen] = useState(false);
  const [newSTAROpen, setNewSTAROpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCV, setNewCV] = useState({ name: '', rawText: '' });
  const [newSTAR, setNewSTAR] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
  });

  const handleCreateCV = async () => {
    if (!newCV.name.trim()) return;
    setCreating(true);
    await createResume({
      name: newCV.name,
      raw_text: newCV.rawText || null,
      is_master: resumes.length === 0,
    });
    setCreating(false);
    setNewCVOpen(false);
    setNewCV({ name: '', rawText: '' });
  };

  const handleCreateSTAR = async () => {
    if (!newSTAR.situation || !newSTAR.result) return;
    setCreating(true);
    await createStory({
      title: newSTAR.title || 'Logro STAR',
      situation: newSTAR.situation,
      task: newSTAR.task,
      action: newSTAR.action,
      result: newSTAR.result,
    });
    setCreating(false);
    setNewSTAROpen(false);
    setNewSTAR({ title: '', situation: '', task: '', action: '', result: '' });
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
              CV & Motor STAR
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu CV Maestro, versiones adaptadas y logros cuantificables.
            </p>
          </div>
          <Dialog open={newCVOpen} onOpenChange={setNewCVOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva versión de CV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo CV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del CV</Label>
                  <Input
                    placeholder="Ej: CV para Product Manager"
                    value={newCV.name}
                    onChange={(e) => setNewCV({ ...newCV, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenido de tu CV</Label>
                  <Textarea
                    placeholder="Pega aquí el contenido de tu CV..."
                    value={newCV.rawText}
                    onChange={(e) => setNewCV({ ...newCV, rawText: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={handleCreateCV} disabled={creating || !newCV.name.trim()} className="w-full">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Crear CV
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              {resumes.map((cv) => (
                <Card
                  key={cv.id}
                  className={`border-border relative ${cv.is_master ? "ring-2 ring-primary" : ""}`}
                >
                  {cv.is_master && (
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
                        {!cv.is_master && (
                          <Button variant="ghost" size="icon" onClick={() => deleteResume(cv.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{cv.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Actualizado {format(new Date(cv.updated_at), "d MMM yyyy", { locale: es })}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Versión {cv.version || 1}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add new CV card */}
              <Card
                className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setNewCVOpen(true)}
              >
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Crear nueva versión</h3>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tus logros STAR
                </CardTitle>
                <Dialog open={newSTAROpen} onOpenChange={setNewSTAROpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar logro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nuevo logro STAR</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      <div className="space-y-2">
                        <Label>Título del logro</Label>
                        <Input
                          placeholder="Ej: Optimicé proceso de ventas"
                          value={newSTAR.title}
                          onChange={(e) => setNewSTAR({ ...newSTAR, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-medium">S - Situación</Label>
                        <Textarea
                          placeholder="¿Cuál era el contexto o problema inicial?"
                          value={newSTAR.situation}
                          onChange={(e) => setNewSTAR({ ...newSTAR, situation: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-medium">T - Tarea</Label>
                        <Textarea
                          placeholder="¿Cuál era tu responsabilidad o objetivo?"
                          value={newSTAR.task}
                          onChange={(e) => setNewSTAR({ ...newSTAR, task: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary font-medium">A - Acción</Label>
                        <Textarea
                          placeholder="¿Qué hiciste específicamente?"
                          value={newSTAR.action}
                          onChange={(e) => setNewSTAR({ ...newSTAR, action: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-success font-medium">R - Resultado (con métricas)</Label>
                        <Textarea
                          placeholder="¿Cuál fue el resultado cuantificable? Usa %, $, tiempo, volumen..."
                          value={newSTAR.result}
                          onChange={(e) => setNewSTAR({ ...newSTAR, result: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <Button onClick={handleCreateSTAR} disabled={creating || !newSTAR.situation || !newSTAR.result} className="w-full">
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Guardar logro STAR
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                {stories.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Aún no tienes logros STAR registrados
                    </p>
                    <Button variant="outline" onClick={() => setNewSTAROpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar tu primer logro
                    </Button>
                  </div>
                ) : (
                  stories.map((logro) => (
                    <div
                      key={logro.id}
                      className="p-4 rounded-xl border border-border bg-muted/30 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {logro.title}
                          </h4>
                          {logro.competencies && logro.competencies.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {logro.competencies.map((comp, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteStory(logro.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-primary">Situación:</span>
                          <p className="text-muted-foreground">{logro.situation || '-'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-primary">Tarea:</span>
                          <p className="text-muted-foreground">{logro.task || '-'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-primary">Acción:</span>
                          <p className="text-muted-foreground">{logro.action || '-'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-success">Resultado:</span>
                          <p className="text-foreground font-medium">{logro.result || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Situación:</strong> Describe el contexto o problema inicial</li>
                      <li>• <strong>Tarea:</strong> Tu responsabilidad específica</li>
                      <li>• <strong>Acción:</strong> Lo que hiciste concretamente</li>
                      <li>• <strong>Resultado:</strong> Impacto cuantificable (%, $, tiempo)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ATS Score Tab */}
          <TabsContent value="ats" className="space-y-4">
            <Card className="border-border">
              <CardContent className="pt-6 text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Análisis ATS próximamente
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Pronto podrás analizar tu CV contra ofertas de trabajo y optimizarlo para pasar filtros ATS.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
