import { Button } from "@/components/ui/button";
import { Check, Sparkles, Rocket, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "trial",
    name: "Free Trial",
    description: "Prueba el poder del HR Screener",
    price: "Gratis",
    priceNote: "7 días",
    icon: Sparkles,
    features: [
      "50 CVs procesados",
      "1 job description activo",
      "Top 5 con análisis STAR",
      "Export PDF básico",
      "Soporte por email",
    ],
    cta: "Comenzar prueba gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Para PYMEs con contratación ocasional",
    price: "$49",
    priceNote: "USD/mes",
    icon: Rocket,
    features: [
      "500 CVs/mes",
      "5 jobs simultáneos",
      "Análisis STAR completo",
      "Ranking explicado con IA",
      "Export PDF profesional",
      "Historial 3 meses",
      "Soporte prioritario",
    ],
    cta: "Elegir Starter",
    variant: "default" as const,
    popular: true,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Para equipos de HR con alto volumen",
    price: "$99",
    priceNote: "USD/mes",
    icon: Crown,
    features: [
      "2,000 CVs/mes",
      "Jobs ilimitados",
      "API access",
      "Emails automatizados",
      "Múltiples usuarios",
      "Historial ilimitado",
      "Soporte dedicado",
      "Onboarding personalizado",
    ],
    cta: "Elegir Growth",
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
            Ahorra tiempo = Ahorra dinero
          </h2>
          <p className="text-muted-foreground">
            Planes diseñados para el tamaño de tu operación de HR.
            ROI positivo desde el primer mes.
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
          Cancela cuando quieras. Garantía de devolución 30 días.
        </p>
      </div>
    </section>
  );
}
