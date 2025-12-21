import { useState, useEffect } from "react";
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
  FileStack,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Globe,
  Target,
  DollarSign,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useResumes } from "@/hooks/useResumes";
import { useResumeStorage } from "@/hooks/useResumeStorage";
import { toast } from "sonner";

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
  const { profile, completeOnboarding, loading: profileLoading } = useProfile();
  const { createResume } = useResumes();
  const { uploadResume, uploading: fileUploading } = useResumeStorage();
  
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // P0.1: Skip country step if already set from registration
  const hasCountry = !!profile?.country;
  
  // Dynamically determine steps based on whether country is already set
  const steps = hasCountry ? [
    { id: 1, title: "Objetivo", icon: Target },
    { id: 2, title: "Experiencia", icon: FileStack },
    { id: 3, title: "CV", icon: Upload },
    { id: 4, title: "Expectativas", icon: DollarSign },
  ] : [
    { id: 1, title: "Ubicación", icon: Globe },
    { id: 2, title: "Objetivo", icon: Target },
    { id: 3, title: "Experiencia", icon: FileStack },
    { id: 4, title: "CV", icon: Upload },
    { id: 5, title: "Expectativas", icon: DollarSign },
  ];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "",
    roleTarget: "",
    industries: [] as string[],
    seniority: "",
    skills: "",
    englishLevel: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
    salaryPeriod: "monthly" as "monthly" | "annual",
    availability: "",
    cvText: "",
    linkedinUrl: "",
  });

  // P0.1: Pre-fill country from profile if exists
  useEffect(() => {
    if (profile?.country && !formData.country) {
      const pais = paises.find(p => p.value === profile.country);
      setFormData(prev => ({
        ...prev,
        country: profile.country || "",
        salaryCurrency: pais?.currency || "USD",
      }));
    }
  }, [profile]);

  // P0.4: Redirect if onboarding already completed
  useEffect(() => {
    if (!profileLoading && profile?.onboarding_completed) {
      navigate("/app/dashboard");
    }
  }, [profile, profileLoading, navigate]);

  const progress = (currentStep / steps.length) * 100;

  const getCurrency = () => {
    if (formData.salaryCurrency) return formData.salaryCurrency;
    const pais = paises.find(p => p.value === formData.country);
    return pais?.currency || "USD";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error("Solo se permiten archivos PDF o DOCX");
        return;
      }
      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo no puede superar 5MB");
        return;
      }
      setUploadedFile(file);
    }
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
          country: formData.country || profile?.country || null,
          currency: getCurrency(),
          role_target: formData.roleTarget || null,
          industries: formData.industries.length > 0 ? formData.industries : null,
          seniority: formData.seniority || null,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
          english_level: formData.englishLevel || null,
          salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          salary_period: formData.salaryPeriod,
          availability: formData.availability || null,
          linkedin_url: formData.linkedinUrl || null,
        };

        const { error } = await completeOnboarding(profileData);
        if (error) throw error;

        // Create master resume
        let masterResume = null;
        if (formData.cvText || uploadedFile) {
          const { data: resumeData } = await createResume({
            name: 'CV Maestro',
            raw_text: formData.cvText || null,
            is_master: true,
          });
          masterResume = resumeData;
        }

        // P0.2: Upload file if provided
        if (uploadedFile && masterResume?.id) {
          await uploadResume(uploadedFile, masterResume.id);
        }

        // P0.4: Redirect to dashboard
        navigate("/app/dashboard");
      } catch (error) {
        console.error('Error saving onboarding:', error);
        toast.error("Error al guardar. Intenta de nuevo.");
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

  // Determine which step content to show based on hasCountry
  const getStepContent = () => {
    if (hasCountry) {
      // Steps without country: Objetivo, Experiencia, CV, Expectativas
      switch (currentStep) {
        case 1: return renderObjectiveStep();
        case 2: return renderExperienceStep();
        case 3: return renderCVStep();
        case 4: return renderExpectationsStep();
        default: return null;
      }
    } else {
      // Steps with country: Ubicación, Objetivo, Experiencia, CV, Expectativas
      switch (currentStep) {
        case 1: return renderLocationStep();
        case 2: return renderObjectiveStep();
        case 3: return renderExperienceStep();
        case 4: return renderCVStep();
        case 5: return renderExpectationsStep();
        default: return null;
      }
    }
  };

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          ¿Desde dónde nos acompañas?
        </h2>
        <p className="text-muted-foreground">
          Esto nos ayuda a mostrarte vacantes y plantillas relevantes para tu mercado.
        </p>
      </div>
      <div className="space-y-4">
        <Label htmlFor="country">País</Label>
        <Select
          value={formData.country}
          onValueChange={(value) => {
            const pais = paises.find(p => p.value === value);
            setFormData({ 
              ...formData, 
              country: value,
              salaryCurrency: pais?.currency || "USD"
            });
          }}
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
  );

  const renderObjectiveStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          ¿Qué rol buscas?
        </h2>
        <p className="text-muted-foreground">
          Cuéntanos sobre tu objetivo profesional para personalizar tu experiencia.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roleTarget">Rol objetivo</Label>
          <Input
            id="roleTarget"
            placeholder="Ej: Product Manager, Software Engineer, Data Analyst"
            value={formData.roleTarget}
            onChange={(e) => setFormData({ ...formData, roleTarget: e.target.value })}
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
  );

  const renderExperienceStep = () => (
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
            onValueChange={(value) => setFormData({ ...formData, seniority: value })}
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
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Nivel de inglés</Label>
          <Select
            value={formData.englishLevel}
            onValueChange={(value) => setFormData({ ...formData, englishLevel: value })}
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
  );

  const renderCVStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Tu CV actual
        </h2>
        <p className="text-muted-foreground">
          Sube tu CV o pega el contenido para crear tu CV Maestro.
        </p>
      </div>
      <div className="space-y-4">
        {/* P0.2: File upload */}
        <div className="space-y-2">
          <Label>Subir archivo (PDF o DOCX)</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Arrastra tu archivo aquí o <span className="text-primary font-medium">haz clic para seleccionar</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF o DOCX, máximo 5MB</p>
              </label>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">O pega el texto</span>
          </div>
        </div>

        <Textarea
          placeholder="Pega aquí el contenido de tu CV..."
          value={formData.cvText}
          onChange={(e) => setFormData({ ...formData, cvText: e.target.value })}
          rows={6}
        />

        <div className="space-y-2">
          <Label htmlFor="linkedin">URL de LinkedIn (opcional)</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/tu-perfil"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderExpectationsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Expectativas
        </h2>
        <p className="text-muted-foreground">
          Último paso. ¿Cuáles son tus expectativas salariales y de disponibilidad?
        </p>
      </div>
      <div className="space-y-4">
        {/* P0.3: Salary with currency and period */}
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select
            value={formData.salaryCurrency || getCurrency()}
            onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD (Dólar)</SelectItem>
              <SelectItem value="MXN">MXN (Peso mexicano)</SelectItem>
              <SelectItem value="ARS">ARS (Peso argentino)</SelectItem>
              <SelectItem value="COP">COP (Peso colombiano)</SelectItem>
              <SelectItem value="PEN">PEN (Sol peruano)</SelectItem>
              <SelectItem value="CLP">CLP (Peso chileno)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <Select
            value={formData.salaryPeriod}
            onValueChange={(value: "monthly" | "annual") => setFormData({ ...formData, salaryPeriod: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Salario mínimo</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder={formData.salaryPeriod === "monthly" ? "2000" : "24000"}
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax">Salario deseado</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder={formData.salaryPeriod === "monthly" ? "4000" : "48000"}
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
            />
          </div>
        </div>

        {formData.salaryCurrency && formData.salaryCurrency !== "USD" && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 USD referencial: sin conversión automática por ahora.
          </p>
        )}

        <div className="space-y-2">
          <Label>Disponibilidad</Label>
          <Select
            value={formData.availability}
            onValueChange={(value) => setFormData({ ...formData, availability: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="¿Cuándo podrías empezar?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Inmediata</SelectItem>
              <SelectItem value="2_weeks">En 2 semanas</SelectItem>
              <SelectItem value="1_month">En 1 mes</SelectItem>
              <SelectItem value="2_months">En 2 meses</SelectItem>
              <SelectItem value="exploring">Solo explorando</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight">
                HR Screener
              </span>
              <span className="text-xs text-muted-foreground -mt-1">LATAM</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/app/dashboard")}>
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
          {getStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={handleNext} disabled={saving || fileUploading}>
              {saving || fileUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : currentStep === steps.length ? (
                <>
                  Completar
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Siguiente
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