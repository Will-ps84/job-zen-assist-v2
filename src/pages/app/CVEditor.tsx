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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Check,
  Star,
  ArrowRight,
  Clipboard,
} from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { useSTAR } from "@/hooks/useSTAR";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Format STAR story as a CV bullet point
const formatSTARForCV = (story: {
  title: string;
  action?: string | null;
  result?: string | null;
}) => {
  const action = story.action || "";
  const result = story.result || "";
  
  // Extract the main action verb and combine with result
  if (action && result) {
    return `${action.charAt(0).toUpperCase()}${action.slice(1)}. ${result}`;
  }
  if (result) {
    return result;
  }
  return story.title;
};

export default function CVEditor() {
  const { resumes, loading, createResume, deleteResume } = useResumes();
  const { stories, loading: starLoading } = useSTAR();
  
  const [newCVOpen, setNewCVOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCV, setNewCV] = useState({ name: '', rawText: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [starPanelOpen, setStarPanelOpen] = useState(false);

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

  const copySTARToClipboard = async (story: typeof stories[0]) => {
    const formatted = formatSTARForCV(story);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedId(story.id);
      toast.success("Logro copiado al portapapeles");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Error al copiar");
    }
  };

  const insertSTARIntoCV = (story: typeof stories[0]) => {
    const formatted = formatSTARForCV(story);
    setNewCV(prev => ({
      ...prev,
      rawText: prev.rawText ? `${prev.rawText}\n\n• ${formatted}` : `• ${formatted}`
    }));
    toast.success("Logro insertado en el CV");
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
              CV Maestro
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu CV principal y crea versiones adaptadas para cada vacante.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/star">
                <Star className="w-4 h-4 mr-2" />
                STAR Wizard
              </Link>
            </Button>
            <Dialog open={newCVOpen} onOpenChange={setNewCVOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva versión
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Crear nuevo CV</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* CV Form */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre del CV</Label>
                      <Input
                        placeholder="Ej: CV para Product Manager"
                        value={newCV.name}
                        onChange={(e) => setNewCV({ ...newCV, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Contenido de tu CV</Label>
                        <Sheet open={starPanelOpen} onOpenChange={setStarPanelOpen}>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-primary">
                              <Sparkles className="w-4 h-4 mr-1" />
                              Insertar STAR
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                              <SheetTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Tus logros STAR
                              </SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
                              {stories.length === 0 ? (
                                <div className="text-center py-12">
                                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground mb-4">
                                    No tienes logros STAR aún
                                  </p>
                                  <Button asChild>
                                    <Link to="/app/star">
                                      Crear en STAR Wizard
                                      <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Haz clic en un logro para insertarlo en tu CV
                                  </p>
                                  {stories.map((story) => (
                                    <Card
                                      key={story.id}
                                      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                                      onClick={() => {
                                        insertSTARIntoCV(story);
                                        setStarPanelOpen(false);
                                      }}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-foreground text-sm mb-1 truncate">
                                              {story.title}
                                            </h4>
                                            {story.result && (
                                              <p className="text-xs text-success line-clamp-2">
                                                {story.result}
                                              </p>
                                            )}
                                            {story.competencies && story.competencies.length > 0 && (
                                              <div className="flex gap-1 mt-2 flex-wrap">
                                                {story.competencies.slice(0, 2).map((comp) => (
                                                  <Badge key={comp} variant="secondary" className="text-xs">
                                                    {comp}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          <Plus className="w-4 h-4 text-primary shrink-0" />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      </div>
                      <Textarea
                        placeholder="Pega aquí el contenido de tu CV o inserta logros STAR..."
                        value={newCV.rawText}
                        onChange={(e) => setNewCV({ ...newCV, rawText: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button onClick={handleCreateCV} disabled={creating || !newCV.name.trim()} className="w-full">
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Crear CV
                    </Button>
                  </div>

                  {/* Quick STAR Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Logros rápidos</Label>
                      <Badge variant="secondary">{stories.length}</Badge>
                    </div>
                    <ScrollArea className="h-[300px] rounded-lg border border-border p-2">
                      {stories.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-muted-foreground">
                            Sin logros STAR
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {stories.map((story) => (
                            <button
                              key={story.id}
                              onClick={() => insertSTARIntoCV(story)}
                              className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group"
                            >
                              <p className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                                {story.title}
                              </p>
                              {story.result && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {story.result.slice(0, 50)}...
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/app/star">
                        <Plus className="w-3 h-3 mr-1" />
                        Nuevo STAR
                      </Link>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="versions">
              <FileText className="w-4 h-4 mr-2" />
              Mis CVs
            </TabsTrigger>
            <TabsTrigger value="star">
              <Sparkles className="w-4 h-4 mr-2" />
              Logros STAR
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

          {/* STAR Tab - Quick view with copy functionality */}
          <TabsContent value="star" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tus logros STAR
                </CardTitle>
                <Button asChild>
                  <Link to="/app/star">
                    <Plus className="w-4 h-4 mr-2" />
                    STAR Wizard
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {stories.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Aún no tienes logros STAR registrados
                    </p>
                    <Button asChild>
                      <Link to="/app/star">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear con STAR Wizard
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Copia tus logros formateados para pegarlos directamente en tu CV.
                    </p>
                    <div className="grid gap-4">
                      {stories.map((story) => (
                        <Card key={story.id} className="border-border">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-foreground">
                                    {story.title}
                                  </h4>
                                  {story.competencies && story.competencies.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {story.competencies.slice(0, 2).map((comp) => (
                                        <Badge key={comp} variant="secondary" className="text-xs">
                                          {comp}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Formatted preview */}
                                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                  <p className="text-sm text-foreground font-mono">
                                    • {formatSTARForCV(story)}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copySTARToClipboard(story)}
                                className={cn(
                                  "shrink-0 gap-2",
                                  copiedId === story.id && "bg-success/10 text-success border-success"
                                )}
                              >
                                {copiedId === story.id ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Copiado
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="w-4 h-4" />
                                    Copiar
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
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
                      Usa el STAR Wizard para mejores resultados
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      El STAR Wizard te guía paso a paso para crear logros con métricas cuantificables que impresionan a reclutadores.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/app/star">
                        Ir al STAR Wizard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
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
