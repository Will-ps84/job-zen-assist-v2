import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Globe,
  Target,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useResumes } from "@/hooks/useResumes";
import type { Enums } from "@/integrations/supabase/types";

const steps = [
  { id: 1, title: "Ubicación", icon: Globe },
  { id: 2, title: "Objetivo", icon: Target },
  { id: 3, title: "Experiencia", icon: Briefcase },
  { id: 4, title: "CV", icon: Upload },
  { id: 5, title: "Expectativas", icon: DollarSign },
];

const paises = [
  { value: "MX", label: "México", currency: "MXN" },
  { value: "AR", label: "Argentina", currency: "ARS" },
  { value: "CO", label: "Colombia", currency: "COP" },
  { value: "PE", label: "Perú", currency: "PEN" },
  { value: "CL", label: "Chile", currency: "CLP" },
];

const industries = [
  "Tecnología",
  "Finanzas",
  "Salud",
  "Educación",
  "Retail",
  "Manufactura",
  "Consultoría",
  "Marketing",
  "Recursos Humanos",
  "Otro",
];

const seniorities = [
  { value: "junior", label: "Junior (0-2 años)" },
  { value: "mid", label: "Mid-level (2-5 años)" },
  { value: "senior", label: "Senior (5-10 años)" },
  { value: "lead", label: "Lead/Manager (10+ años)" },
  { value: "executive", label: "Ejecutivo/Director" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useProfile();
  const { createResume } = useResumes();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    country: "",
    roleTarget: "",
    industries: [] as string[],
    seniority: "" as Enums<'seniority_level'> | "",
    skills: "",
    englishLevel: "",
    salaryMin: "",
    salaryMax: "",
    availability: "",
    cvFile: null as File | null,
    cvText: "",
    linkedinUrl: "",
  });

  const progress = (currentStep / steps.length) * 100;

  const getCurrency = () => {
    const pais = paises.find(p => p.value === formData.country);
    return pais?.currency || "USD";
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and save to DB
      setSaving(true);
      try {
        // Save profile data
        const profileData = {
          country: formData.country || null,
          currency: getCurrency(),
          role_target: formData.roleTarget || null,
          industries: formData.industries.length > 0 ? formData.industries : null,
          seniority: formData.seniority as Enums<'seniority_level'> || null,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
          english_level: formData.englishLevel || null,
          salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          availability: formData.availability || null,
          linkedin_url: formData.linkedinUrl || null,
        };

        const { error } = await completeOnboarding(profileData);
        if (error) throw error;

        // Create master resume if CV was provided
        if (formData.cvText || formData.cvFile) {
          await createResume({
            title: 'CV Maestro',
            raw_text: formData.cvText || null,
            is_master: true,
          }, formData.cvFile || undefined);
        }

        navigate("/app");
      } catch (error) {
        console.error('Error saving onboarding:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight">
                El Mentor
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Digital</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/app")}>
            Omitir por ahora
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center",
                  currentStep >= step.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "bg-primary/10 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  ¿Desde dónde nos acompañas?
                </h2>
                <p className="text-muted-foreground">
                  Esto nos ayuda a mostrarte vacantes y plantillas relevantes para
                  tu mercado.
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="country">País</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map((pais) => (
                      <SelectItem key={pais.value} value={pais.value}>
                        {pais.label} ({pais.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Career Objective */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  ¿Qué rol buscas?
                </h2>
                <p className="text-muted-foreground">
                  Cuéntanos sobre tu objetivo profesional para personalizar tu
                  experiencia.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleTarget">Rol objetivo</Label>
                  <Input
                    id="roleTarget"
                    placeholder="Ej: Product Manager, Software Engineer, Data Analyst"
                    value={formData.roleTarget}
                    onChange={(e) =>
                      setFormData({ ...formData, roleTarget: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industrias de interés (selecciona hasta 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleIndustry(industry)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                          formData.industries.includes(industry)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        disabled={
                          formData.industries.length >= 3 &&
                          !formData.industries.includes(industry)
                        }
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Tu experiencia
                </h2>
                <p className="text-muted-foreground">
                  Esto nos ayuda a encontrar vacantes que se ajusten a tu nivel.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nivel de seniority</Label>
                  <Select
                    value={formData.seniority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, seniority: value as Enums<'seniority_level'> | "" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {seniorities.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills principales (separados por coma)</Label>
                  <Textarea
                    id="skills"
                    placeholder="Ej: Product Management, Agile, SQL, Figma, Leadership"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nivel de inglés</Label>
                  <Select
                    value={formData.englishLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, englishLevel: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="native">Nativo/Bilingüe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: CV Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Sube tu CV actual
                </h2>
                <p className="text-muted-foreground">
                  Lo analizaremos para crear tu CV Maestro y aplicar metodología
                  STAR a tus logros.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="cv-upload"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cvFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-1">
                      {formData.cvFile
                        ? formData.cvFile.name
                        : "Arrastra tu CV o haz click para subir"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF o Word, máximo 5MB
                    </p>
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      O pega el texto
                    </span>
                  </div>
                </div>

                <Textarea
                  placeholder="Pega aquí el contenido de tu CV..."
                  value={formData.cvText}
                  onChange={(e) =>
                    setFormData({ ...formData, cvText: e.target.value })
                  }
                  rows={6}
                />

                <div className="space-y-2">
                  <Label htmlFor="linkedin">URL de LinkedIn (opcional)</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Expectations */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Expectativas
                </h2>
                <p className="text-muted-foreground">
                  Último paso. ¿Cuáles son tus expectativas salariales y de
                  disponibilidad?
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salario mínimo (USD/mes)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="2000"
                      value={formData.salaryMin}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMin: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salario objetivo (USD/mes)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="4000"
                      value={formData.salaryMax}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMax: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Disponibilidad para comenzar</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) =>
                      setFormData({ ...formData, availability: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tu disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Inmediata</SelectItem>
                      <SelectItem value="2weeks">2 semanas</SelectItem>
                      <SelectItem value="1month">1 mes</SelectItem>
                      <SelectItem value="2months">2 meses</SelectItem>
                      <SelectItem value="negotiable">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            <Button onClick={handleNext} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : currentStep === steps.length ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Comenzar
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
