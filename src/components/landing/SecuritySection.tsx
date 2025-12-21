import { Shield, Lock, UserCheck, Server } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Acceso por usuario (RLS)",
    description: "Solo tu equipo ve a tus candidatos.",
  },
  {
    icon: UserCheck,
    title: "Autenticación segura",
    description: "Login con email verificado.",
  },
  {
    icon: Server,
    title: "Infraestructura enterprise",
    description: "Postgres con encriptación de datos.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-muted/30 rounded-2xl p-8 border border-border">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-10 h-10 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Tus CVs, protegidos
              </h2>
              <p className="text-muted-foreground mb-6">
                CVs protegidos con políticas de acceso por usuario (RLS) sobre Postgres. 
                Solo tu equipo ve a tus candidatos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {securityFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
