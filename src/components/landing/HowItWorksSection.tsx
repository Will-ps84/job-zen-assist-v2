import { FileText, Search, Send, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Optimización Proactiva del CV",
    description:
      "La IA analiza y adapta tu CV para superar los filtros ATS de cada oferta específica. Metodología STAR guiada para logros cuantificables.",
    color: "primary",
  },
  {
    icon: Search,
    number: "02",
    title: "Búsqueda y Filtro de Alto Umbral",
    description:
      "Solo te alertamos de ofertas con más del 90% de similitud semántica. Sin spam, solo oportunidades reales que encajan con tu perfil.",
    color: "info",
  },
  {
    icon: Send,
    number: "03",
    title: "Postulación Asistida y Estratégica",
    description:
      "Prepara tu paquete de postulación: CV personalizado, cover letter y respuestas sugeridas. Tú tienes el control total.",
    color: "accent",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Análisis de Resultados y Aprendizaje",
    description:
      "Mide KPIs como la Tasa de Entrevistas por Postulación para convertir tu búsqueda en una campaña de datos.",
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
            Tu camino hacia el empleo ideal
          </h2>
          <p className="text-muted-foreground">
            Cuatro pasos estratégicos para transformar tu búsqueda de empleo de
            esfuerzo sin conversión a estrategia con resultados.
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
