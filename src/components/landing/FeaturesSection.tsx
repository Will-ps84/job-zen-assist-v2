import { 
  Brain, 
  FileStack, 
  Target, 
  BarChart, 
  Mail, 
  Shield, 
  Globe,
  Zap 
} from "lucide-react";

const features = [
  {
    icon: FileStack,
    title: "Bulk Upload CVs",
    description: "Sube ZIPs de hasta 200 CVs de cualquier portal: Bumeran, Computrabajo, Indeed, LinkedIn.",
  },
  {
    icon: Brain,
    title: "Análisis STAR Automático",
    description: "La IA identifica Situation-Task-Action-Result en cada experiencia laboral del candidato.",
  },
  {
    icon: Target,
    title: "Matching Semántico",
    description: "No solo keywords: entendemos contexto para encontrar candidatos que realmente encajan.",
  },
  {
    icon: BarChart,
    title: "Ranking con Explicación",
    description: "Score 0-100 con desglose: por qué cada candidato sube o baja en el ranking.",
  },
  {
    icon: Mail,
    title: "Emails Automatizados",
    description: "Contacta a tu Top 5 con un click. Templates personalizables por puesto.",
  },
  {
    icon: Zap,
    title: "Velocidad 95% Mayor",
    description: "Lo que antes tomaba 4 horas de filtrado manual, ahora son 2 minutos.",
  },
  {
    icon: Shield,
    title: "Datos Seguros",
    description: "Encriptación enterprise. Cumplimiento GDPR. Los CVs se borran tras 30 días.",
  },
  {
    icon: Globe,
    title: "Multi-país LATAM",
    description: "Optimizado para México, Argentina, Colombia, Perú y Chile. Portales locales incluidos.",
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
            Todo lo que necesita tu equipo de HR
          </h2>
          <p className="text-muted-foreground">
            Herramientas potentes diseñadas para PYMEs que necesitan 
            contratar rápido sin perder calidad.
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
