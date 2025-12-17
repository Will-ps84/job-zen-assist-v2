import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  AlertCircle,
  Target,
  Loader2,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import { useSTAR } from "@/hooks/useSTAR";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COMPETENCY_OPTIONS = [
  "Liderazgo",
  "Trabajo en equipo",
  "Resolución de problemas",
  "Comunicación",
  "Gestión del tiempo",
  "Adaptabilidad",
  "Innovación",
  "Orientación a resultados",
  "Negociación",
  "Toma de decisiones",
];

const WIZARD_STEPS = [
  {
    key: "title",
    label: "Título del logro",
    question: "¿Cómo llamarías a este logro en una frase corta?",
    mentorTip: "Sé específico. En vez de 'Mejoré ventas', prueba 'Aumenté ventas B2B un 40% en Q2 2024'.",
    placeholder: "Ej: Reduje tiempo de onboarding de 2 semanas a 3 días",
    validation: (value: string) => value.length >= 10,
    errorMsg: "El título debe tener al menos 10 caracteres",
  },
  {
    key: "situation",
    label: "Situación",
    question: "¿Cuál era el contexto? ¿Qué problema o reto existía?",
    mentorTip: "Incluye datos concretos: ¿Cuántas personas? ¿Qué presupuesto? ¿Qué deadline? Ejemplo: 'El equipo de 8 personas tenía un backlog de 120 tickets y el SLA estaba en riesgo'.",
    placeholder: "Describe la situación inicial con números y contexto específico...",
    validation: (value: string) => value.length >= 50,
    errorMsg: "Describe la situación con más detalle (mínimo 50 caracteres)",
  },
  {
    key: "task",
    label: "Tarea",
    question: "¿Cuál era tu responsabilidad específica? ¿Qué se esperaba de ti?",
    mentorTip: "Enfócate en TU rol. ¿Eras líder, colaborador, el responsable directo? ¿Qué meta concreta tenías? Ejemplo: 'Mi responsabilidad era reducir el backlog a 40 tickets en 30 días'.",
    placeholder: "Explica tu rol y la meta que tenías que alcanzar...",
    validation: (value: string) => value.length >= 30,
    errorMsg: "Explica tu tarea con más claridad (mínimo 30 caracteres)",
  },
  {
    key: "action",
    label: "Acción",
    question: "¿Qué acciones específicas tomaste TÚ?",
    mentorTip: "Usa verbos de acción en primera persona: 'Implementé', 'Diseñé', 'Lideré', 'Negocié'. Evita 'nosotros' - esto es sobre TI. Menciona herramientas o métodos específicos.",
    placeholder: "Lista las acciones concretas que tomaste...",
    validation: (value: string) => value.length >= 50 && /\b(implementé|diseñé|lideré|creé|desarrollé|analicé|coordiné|negocié|optimicé|automaticé|reduje|aumenté)/i.test(value),
    errorMsg: "Usa verbos de acción en primera persona (implementé, diseñé, lideré...) y describe al menos 50 caracteres",
  },
  {
    key: "result",
    label: "Resultado",
    question: "¿Cuál fue el impacto medible de tus acciones?",
    mentorTip: "Los números son OBLIGATORIOS aquí. ¿Cuánto %? ¿Cuántos $? ¿Cuánto tiempo? Ejemplo: 'Reduje costos operativos en $15,000/mes y mejoré el NPS de 45 a 72'.",
    placeholder: "Incluye métricas: porcentajes, montos, tiempo ahorrado, clientes impactados...",
    validation: (value: string) => {
      const hasNumbers = /\d+/.test(value);
      const hasMetrics = /(%|dólar|\$|usd|mxn|ars|€|hora|día|semana|mes|año|cliente|usuario|venta|ingreso|ahorro|reducción|aumento|mejora)/i.test(value);
      return value.length >= 30 && hasNumbers && hasMetrics;
    },
    errorMsg: "IMPORTANTE: Incluye números y métricas específicas (%, $, tiempo, etc.)",
  },
  {
    key: "competencies",
    label: "Competencias",
    question: "¿Qué competencias demuestra este logro?",
    mentorTip: "Selecciona 2-4 competencias que se evidencian claramente en tu historia. Esto te ayudará a encontrar este logro cuando prepares entrevistas.",
    placeholder: "",
    validation: (value: string[]) => Array.isArray(value) && value.length >= 1 && value.length <= 4,
    errorMsg: "Selecciona entre 1 y 4 competencias",
  },
];

interface StoryForm {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  competencies: string[];
}

const initialForm: StoryForm = {
  title: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  competencies: [],
};

export default function STARWizard() {
  const { stories, loading, createStory, updateStory, deleteStory } = useSTAR();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<StoryForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const validateCurrentStep = (): boolean => {
    const step = WIZARD_STEPS[currentStep];
    const value = step.key === "competencies" ? form.competencies : form[step.key as keyof StoryForm];
    const isValid = step.validation(value as never);
    
    if (!isValid) {
      setErrors({ [step.key]: step.errorMsg });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateStory(editingId, form);
      } else {
        await createStory(form);
      }
      resetWizard();
    } catch (error) {
      toast.error("Error al guardar el logro");
    } finally {
      setSaving(false);
    }
  };

  const resetWizard = () => {
    setIsWizardOpen(false);
    setCurrentStep(0);
    setForm(initialForm);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (story: typeof stories[0]) => {
    setForm({
      title: story.title,
      situation: story.situation || "",
      task: story.task || "",
      action: story.action || "",
      result: story.result || "",
      competencies: story.competencies || [],
    });
    setEditingId(story.id);
    setCurrentStep(0);
    setIsWizardOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este logro STAR?")) {
      await deleteStory(id);
    }
  };

  const toggleCompetency = (competency: string) => {
    setForm((prev) => {
      const current = prev.competencies;
      if (current.includes(competency)) {
        return { ...prev, competencies: current.filter((c) => c !== competency) };
      }
      if (current.length >= 4) {
        toast.error("Máximo 4 competencias");
        return prev;
      }
      return { ...prev, competencies: [...current, competency] };
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Star className="w-8 h-8 text-primary" />
              STAR Wizard
            </h1>
            <p className="text-muted-foreground mt-1">
              Documenta tus logros con el método STAR para destacar en entrevistas
            </p>
          </div>
          <Button onClick={() => setIsWizardOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo logro STAR
          </Button>
        </div>

        {/* Wizard Modal */}
        {isWizardOpen && (
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {editingId ? "Editar logro STAR" : "Nuevo logro STAR"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Paso {currentStep + 1} de {WIZARD_STEPS.length}: {currentStepData.label}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={resetWizard}>
                  Cancelar
                </Button>
              </div>
              <Progress value={progress} className="h-2 mt-4" />
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Mentor Question */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {currentStepData.question}
                </h3>

                {/* Mentor Tip */}
                <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Tip del mentor:</span>{" "}
                    {currentStepData.mentorTip}
                  </p>
                </div>

                {/* Input Field */}
                {currentStepData.key === "competencies" ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {COMPETENCY_OPTIONS.map((comp) => (
                        <Badge
                          key={comp}
                          variant={form.competencies.includes(comp) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            form.competencies.includes(comp) && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => toggleCompetency(comp)}
                        >
                          {form.competencies.includes(comp) && (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {comp}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Seleccionadas: {form.competencies.length}/4
                    </p>
                  </div>
                ) : currentStepData.key === "title" ? (
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={currentStepData.placeholder}
                    className="text-lg"
                  />
                ) : (
                  <Textarea
                    value={form[currentStepData.key as keyof StoryForm] as string}
                    onChange={(e) =>
                      setForm({ ...form, [currentStepData.key]: e.target.value })
                    }
                    placeholder={currentStepData.placeholder}
                    rows={5}
                    className="resize-none"
                  />
                )}

                {/* Error Message */}
                {errors[currentStepData.key] && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors[currentStepData.key]}</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <Button onClick={handleNext} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {currentStep === WIZARD_STEPS.length - 1 ? (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Stories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Tus logros STAR ({stories.length})
          </h2>

          {stories.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Aún no tienes logros documentados
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Documenta tus logros con el método STAR para prepararte para entrevistas
                </p>
                <Button onClick={() => setIsWizardOpen(true)}>
                  Crear mi primer logro STAR
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {stories.map((story) => (
                <Card key={story.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2">
                          {story.title}
                        </h3>
                        
                        <div className="grid gap-3 text-sm">
                          {story.situation && (
                            <div>
                              <span className="font-medium text-primary">S - Situación:</span>{" "}
                              <span className="text-muted-foreground line-clamp-2">
                                {story.situation}
                              </span>
                            </div>
                          )}
                          {story.task && (
                            <div>
                              <span className="font-medium text-primary">T - Tarea:</span>{" "}
                              <span className="text-muted-foreground line-clamp-2">
                                {story.task}
                              </span>
                            </div>
                          )}
                          {story.action && (
                            <div>
                              <span className="font-medium text-primary">A - Acción:</span>{" "}
                              <span className="text-muted-foreground line-clamp-2">
                                {story.action}
                              </span>
                            </div>
                          )}
                          {story.result && (
                            <div>
                              <span className="font-medium text-primary">R - Resultado:</span>{" "}
                              <span className="text-muted-foreground line-clamp-2">
                                {story.result}
                              </span>
                            </div>
                          )}
                        </div>

                        {story.competencies && story.competencies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {story.competencies.map((comp) => (
                              <Badge key={comp} variant="secondary" className="text-xs">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(story)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(story.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
