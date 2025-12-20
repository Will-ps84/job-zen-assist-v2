import { Upload, FileText, BarChart3, Mail, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Sube el ZIP de CVs",
    description:
      "Arrastra el archivo ZIP descargado de Bumeran, Computrabajo o Indeed. Soportamos hasta 200 CVs por análisis.",
    color: "primary",
  },
  {
    icon: FileText,
    number: "02",
    title: "Pega el Job Description",
    description:
      "Copia y pega la descripción del puesto. La IA extrae skills requeridos, experiencia y competencias clave.",
    color: "info",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Recibe el Top 5 Rankeado",
    description:
      "En 2 minutos: score de compatibilidad, análisis STAR de cada candidato, heatmap de skills match.",
    color: "accent",
  },
  {
    icon: Mail,
    number: "04",
    title: "Contacta y Contrata",
    description:
      "Exporta PDF para el equipo, envía emails automáticos a candidatos, agenda entrevistas directamente.",
    color: "success",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Cómo funciona
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            De caos a candidatos en 4 pasos
          </h2>
          <p className="text-muted-foreground">
            Transforma horas de filtrado manual en minutos de análisis inteligente.
            ROI inmediato desde el primer uso.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-border to-transparent z-0">
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              )}

              <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full card-hover">
                {/* Number badge */}
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    step.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : step.color === "info"
                      ? "bg-info/10 text-info"
                      : step.color === "accent"
                      ? "bg-accent/10 text-accent"
                      : "bg-success/10 text-success"
                  }`}
                >
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
