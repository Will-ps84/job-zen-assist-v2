import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
const footerLinks = {
  producto: [{
    label: "Cómo funciona",
    href: "/#como-funciona"
  }, {
    label: "Precios",
    href: "/precios"
  }, {
    label: "FAQ",
    href: "/#faq"
  }],
  legal: [{
    label: "Privacidad",
    href: "/privacidad"
  }, {
    label: "Términos",
    href: "/terminos"
  }],
  paises: ["México", "Argentina", "Colombia", "Perú", "Chile"]
};
export function Footer() {
  return <footer className="bg-sidebar text-sidebar-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-primary-foreground">
                  El Mentor
                </span>
                <span className="text-xs -mt-1 text-primary-foreground">
                  Digital
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-primary-foreground">
              De la postulación manual a la estrategia IA. Tu copiloto para
              conseguir el trabajo que mereces.
            </p>
          </div>

          {/* Producto */}
          <div className="text-primary-foreground">
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.producto.map(link => <li key={link.href} className="text-primary-foreground">
                  <a href={link.href} className="text-sm transition-colors text-primary-foreground">
                    {link.label}
                  </a>
                </li>)}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.legal.map(link => <li key={link.href}>
                  <Link to={link.href} className="text-sm transition-colors text-primary-foreground">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Países */}
          <div className="text-primary-foreground">
            <h4 className="font-semibold mb-4">Países</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.paises.map(pais => <li key={pais} className="text-primary-foreground">
                  <span className="text-sm text-primary-foreground">
                    {pais}
                  </span>
                </li>)}
            </ul>
          </div>
        </div>

        <hr className="border-sidebar-border my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground">
            © {new Date().getFullYear()} El Mentor Digital. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/60">
            <span className="text-primary-foreground">Hecho con</span>
            <span className="text-destructive">❤</span>
            <span className="text-primary-foreground">en LATAM</span>
          </div>
        </div>
      </div>
    </footer>;
}