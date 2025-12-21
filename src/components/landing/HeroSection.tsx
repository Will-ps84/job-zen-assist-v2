import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Users, Zap, FileStack } from "lucide-react";

const benefits = [
  "Sube ZIP de CVs de Bumeran/Computrabajo",
  "Pega la descripción del puesto",
  "Recibe Top 5 con análisis STAR",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary-foreground/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/5 rounded-full" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">
              Reclutamiento IA para PYMEs LATAM
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-primary-foreground leading-[1.1] mb-6 animate-slide-up text-[clamp(2rem,5vw,3.75rem)]">
            <span className="block">Filtra 200 CVs en 2 minutos:</span>
            <span className="block mt-2">
              <span className="text-underline-accent">Top 5 candidatos</span>
              {" "}listos para entrevista
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-slide-up delay-100">
            Sube un ZIP con CVs de Bumeran/Computrabajo, pega la oferta, 
            y la IA te entrega los mejores candidatos explicados con método STAR.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slide-up delay-200">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm text-primary-foreground/80"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
            <Button size="xl" variant="accent" asChild>
              <Link to="/registro">
                Probar análisis de CVs
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="hero-outline"
              onClick={() => {
                const element = document.getElementById('demo');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver demo sin registro
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in delay-500">
            <StatCard icon={Clock} value="2 min" label="Por análisis" />
            <StatCard icon={Users} value="500+" label="PYMEs LATAM" />
            <StatCard icon={FileStack} value="50K+" label="CVs procesados" />
            <StatCard icon={CheckCircle2} value="5" label="Países" />
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
      <Icon className="w-5 h-5 text-accent" />
      <span className="text-2xl font-bold text-primary-foreground">{value}</span>
      <span className="text-xs text-primary-foreground/60">{label}</span>
    </div>
  );
}
