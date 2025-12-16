import { 
  Brain, 
  FileCheck, 
  Target, 
  Kanban, 
  MessageSquare, 
  BarChart, 
  Shield, 
  Globe 
} from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "CV Maestro + Versiones",
    description: "Un CV base optimizado que se adapta automáticamente a cada vacante específica.",
  },
  {
    icon: Brain,
    title: "Motor STAR Guiado",
    description: "Preguntas inteligentes para transformar tus responsabilidades en logros cuantificables.",
  },
  {
    icon: Target,
    title: "Matching Semántico",
    description: "Embeddings + IA para encontrar solo vacantes con ≥90% de compatibilidad real.",
  },
  {
    icon: Kanban,
    title: "Pipeline de Postulaciones",
    description: "Kanban visual para seguir cada oportunidad: Guardada → Aplicada → Entrevista → Oferta.",
  },
  {
    icon: MessageSquare,
    title: "Simulador de Entrevistas",
    description: "Practica con preguntas típicas y recibe feedback estructurado para mejorar.",
  },
  {
    icon: BarChart,
    title: "Analítica Personal",
    description: "KPIs de tu campaña: tasa de entrevistas, eficacia por canal, tiempo promedio.",
  },
  {
    icon: Shield,
    title: "IA Explicable (XAI)",
    description: "Cada sugerencia incluye el 'porqué' estratégico. Entiendes y aprendes.",
  },
  {
    icon: Globe,
    title: "Multi-país LATAM",
    description: "México, Argentina, Colombia, Perú y Chile con portales y plantillas locales.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Funcionalidades
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para conseguir tu trabajo ideal
          </h2>
          <p className="text-muted-foreground">
            Herramientas potentes diseñadas para profesionales que buscan
            resultados, no solo postulaciones.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-all duration-300 card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
