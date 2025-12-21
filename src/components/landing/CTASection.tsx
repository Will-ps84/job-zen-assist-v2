import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto gradient-hero rounded-3xl p-12 md:p-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">
                Comienza hoy, gratis
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              ¿Listo para filtrar CVs 95% más rápido?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Únete a +500 PYMEs en LATAM que ya transformaron su proceso de reclutamiento.
              Crea tu cuenta gratis y comienza a filtrar CVs en minutos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="accent" asChild>
                <Link to="/registro">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/precios">Ver planes</Link>
              </Button>
            </div>

            {/* Social proof */}
            <p className="text-sm text-primary-foreground/60 mt-8">
              ⭐ 4.8/5 de satisfacción | 50,000+ CVs procesados | 5 países LATAM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
