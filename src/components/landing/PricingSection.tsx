import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Explorador",
    description: "Para comenzar tu transformación profesional",
    price: "Gratis",
    priceNote: "sin costo",
    icon: Sparkles,
    features: [
      "Diagnóstico de perfil completo",
      "1 CV optimizado (con marca de agua)",
      "Motor STAR: 5 logros/mes",
      "Matching: 10 vacantes/mes",
      "Score ATS básico",
    ],
    cta: "Comenzar gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    id: "premium",
    name: "Estratega",
    description: "Para quien busca activamente y quiere resultados",
    price: "$9.99",
    priceNote: "USD/mes",
    icon: Rocket,
    features: [
      "Todo de Explorador +",
      "Motor STAR ilimitado",
      "CV sin marca de agua",
      "Matching: 200 vacantes/mes",
      "Adaptación multi-vacante",
      "Simulador de entrevistas",
      "Export PDF profesional",
    ],
    cta: "Elegir Estratega",
    variant: "default" as const,
    popular: true,
  },
  {
    id: "vip",
    name: "Copiloto",
    description: "Máxima prioridad y herramientas avanzadas",
    price: "$24.99",
    priceNote: "USD/mes",
    icon: Crown,
    features: [
      "Todo de Estratega +",
      "Priorización de alertas",
      "Plantillas por industria",
      "Simulador avanzado",
      "Reporte mensual PDF",
      "Soporte prioritario",
    ],
    cta: "Elegir Copiloto",
    variant: "accent" as const,
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="precios" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Precios
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Invierte en tu futuro profesional
          </h2>
          <p className="text-muted-foreground">
            Planes diseñados para cada etapa de tu búsqueda. Comienza gratis y
            escala cuando lo necesites.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative bg-card rounded-2xl border p-8 transition-all duration-300",
                plan.popular
                  ? "border-primary shadow-lg scale-105 z-10"
                  : "border-border hover:border-primary/30"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                  Más popular
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                  plan.popular
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <plan.icon className="w-7 h-7" />
              </div>

              {/* Plan info */}
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {plan.priceNote}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant}
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/registro">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Precios en USD. Acepta pago en moneda local (MXN, ARS, COP, PEN, CLP).
          Cancela cuando quieras.
        </p>
      </div>
    </section>
  );
}
