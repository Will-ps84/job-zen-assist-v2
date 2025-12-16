import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  Edit3,
  Copy,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { useSTAR } from "@/hooks/useSTAR";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CVEditor() {
  const { resumes, loading, createResume, deleteResume, getResumeDownloadUrl } = useResumes();
  const { achievements, loading: starLoading, createAchievement, deleteAchievement } = useSTAR();
  
  const [newCVOpen, setNewCVOpen] = useState(false);
  const [newSTAROpen, setNewSTAROpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCV, setNewCV] = useState({ title: '', rawText: '', file: null as File | null });
  const [newSTAR, setNewSTAR] = useState({
    company: '',
    role_title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
  });

  const handleCreateCV = async () => {
    if (!newCV.title.trim()) return;
    setCreating(true);
    await createResume({
      title: newCV.title,
      raw_text: newCV.rawText || null,
      is_master: resumes.length === 0,
    }, newCV.file || undefined);
    setCreating(false);
    setNewCVOpen(false);
    setNewCV({ title: '', rawText: '', file: null });
  };

  const handleCreateSTAR = async () => {
    if (!newSTAR.situation || !newSTAR.result) return;
    setCreating(true);
    await createAchievement({
      ...newSTAR,
      confidence: 70,
    });
    setCreating(false);
    setNewSTAROpen(false);
    setNewSTAR({ company: '', role_title: '', situation: '', task: '', action: '', result: '' });
  };

  const handleDownload = async (fileUrl: string) => {
    const url = await getResumeDownloadUrl(fileUrl);
    if (url) {
      window.open(url, '_blank');
    }
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
                  <Label>Título del CV</Label>
                  <Input
                    placeholder="Ej: CV para Product Manager"
                    value={newCV.title}
                    onChange={(e) => setNewCV({ ...newCV, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subir archivo (opcional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-file"
                      onChange={(e) => setNewCV({ ...newCV, file: e.target.files?.[0] || null })}
                    />
                    <label htmlFor="cv-file" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {newCV.file ? newCV.file.name : "Arrastra o click para subir"}
                      </p>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>O pega el texto de tu CV</Label>
                  <Textarea
                    placeholder="Pega aquí el contenido de tu CV..."
                    value={newCV.rawText}
                    onChange={(e) => setNewCV({ ...newCV, rawText: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={handleCreateCV} disabled={creating || !newCV.title.trim()} className="w-full">
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
                    <h3 className="font-semibold text-foreground mb-1">{cv.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Actualizado {format(new Date(cv.updated_at), "d MMM yyyy", { locale: es })}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score ATS</span>
                        <span className="font-semibold text-foreground">{cv.ats_score || 0}%</span>
                      </div>
                      <Progress value={cv.ats_score || 0} className="h-2" />
                    </div>
                    {cv.file_url && (
                      <Button variant="outline" className="w-full mt-4" onClick={() => handleDownload(cv.file_url!)}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Add new CV card */}
              <Card
                className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setNewCVOpen(true)}
              >
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Empresa</Label>
                          <Input
                            placeholder="Nombre de la empresa"
                            value={newSTAR.company}
                            onChange={(e) => setNewSTAR({ ...newSTAR, company: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Puesto</Label>
                          <Input
                            placeholder="Tu rol en esa empresa"
                            value={newSTAR.role_title}
                            onChange={(e) => setNewSTAR({ ...newSTAR, role_title: e.target.value })}
                          />
                        </div>
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
                {achievements.length === 0 ? (
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
                  achievements.map((logro) => (
                    <div
                      key={logro.id}
                      className="p-4 rounded-xl border border-border bg-muted/30 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {logro.role_title || 'Sin puesto'} en {logro.company || 'Sin empresa'}
                          </h4>
                          <Badge variant="secondary" className="mt-1">
                            Confianza: {logro.confidence || 0}%
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAchievement(logro.id)}>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      El método STAR transforma tus responsabilidades en logros medibles.
                      Siempre incluye métricas: %, $, tiempo, volumen.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong className="text-primary">S:</strong> Contexto o problema inicial</p>
                      <p><strong className="text-primary">T:</strong> Tu responsabilidad específica</p>
                      <p><strong className="text-primary">A:</strong> Las acciones que tomaste</p>
                      <p><strong className="text-success">R:</strong> Resultados medibles</p>
                    </div>
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
                  {resumes.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Crea un CV para ver tu score ATS
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-primary mb-2">
                          {resumes.find(r => r.is_master)?.ats_score || 0}%
                        </div>
                        <p className="text-muted-foreground">
                          Score de tu CV Maestro
                        </p>
                      </div>
                      <Progress value={resumes.find(r => r.is_master)?.ats_score || 0} className="h-3 mb-6" />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-foreground">Logros STAR registrados</span>
                          {achievements.length >= 3 ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-foreground">CV con contenido</span>
                          {resumes.some(r => r.raw_text || r.file_url) ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
                  {achievements.length < 3 && (
                    <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Pocos logros STAR
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tienes {achievements.length} logro(s) STAR. Agrega al menos 3-5 para
                        mostrar tu impacto cuantificable.
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setNewSTAROpen(true)}>
                        Agregar logro
                      </Button>
                    </div>
                  )}

                  {!resumes.some(r => r.raw_text || r.file_url) && (
                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        CV sin contenido
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tu CV Maestro no tiene contenido. Sube un archivo o pega el texto.
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setNewCVOpen(true)}>
                        Actualizar CV
                      </Button>
                    </div>
                  )}

                  {achievements.length >= 3 && resumes.some(r => r.raw_text || r.file_url) && (
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5">
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        ¡Buen trabajo!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Tu CV tiene buena base. Sigue agregando logros para destacar más.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
