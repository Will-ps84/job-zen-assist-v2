import { Clock, UserX, Share2 } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Ahorra hasta 90% del tiempo",
    description: "Lo que antes tomaba 4+ horas de filtrado manual, ahora son 2 minutos.",
    stat: "90%",
    statLabel: "menos tiempo",
  },
  {
    icon: UserX,
    title: "Evita descartar buenos candidatos",
    description: "La IA analiza contexto y logros, no solo keywords. Reduce errores humanos.",
    stat: "0",
    statLabel: "buenos perdidos",
  },
  {
    icon: Share2,
    title: "Comparte reportes en un clic",
    description: "PDF profesional listo para enviar al gerente de contratación.",
    stat: "1-clic",
    statLabel: "para compartir",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Beneficios
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Por qué reclutadores LATAM eligen HR Screener?
          </h2>
          <p className="text-muted-foreground">
            Hecho para equipos de RRHH en LATAM que reciben decenas de CVs por vacante.
            Funciona con CVs en español e inglés.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-card rounded-2xl p-8 border border-border hover:border-primary/20 transition-all duration-300 card-hover text-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Stat */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">{benefit.stat}</span>
                <p className="text-sm text-muted-foreground">{benefit.statLabel}</p>
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
