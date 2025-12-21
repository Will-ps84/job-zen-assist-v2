import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileStack } from "lucide-react";
import { useCallback } from "react";

const footerLinks = {
  producto: [
    { label: "Cómo funciona", href: "/#como-funciona", isAnchor: true },
    { label: "Precios", href: "/precios", isAnchor: false },
    { label: "FAQ", href: "/#faq", isAnchor: true },
  ],
  legal: [
    { label: "Privacidad", href: "/privacidad" },
    { label: "Términos", href: "/terminos" },
  ],
  paises: ["México", "Argentina", "Colombia", "Perú", "Chile"],
};

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = useCallback((href: string, isAnchor: boolean) => {
    if (isAnchor) {
      const [path, hash] = href.split('#');
      if (location.pathname === '/' || location.pathname === path) {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(path || '/');
        setTimeout(() => {
          const element = document.getElementById(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  }, [location.pathname, navigate]);

  return (
    <footer className="bg-sidebar text-sidebar-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <FileStack className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-primary-foreground">
                  HR Screener
                </span>
                <span className="text-xs -mt-1 text-primary-foreground">
                  LATAM
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-primary-foreground">
              Filtra CVs en minutos con IA explicable y análisis STAR para tus
              procesos de selección en LATAM.
            </p>
          </div>

          {/* Producto */}
          <div className="text-primary-foreground">
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.producto.map((link) => (
                <li key={link.href} className="text-primary-foreground">
                  <button
                    onClick={() => handleNavClick(link.href, link.isAnchor)}
                    className="text-sm transition-colors text-primary-foreground hover:text-primary-foreground/80 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors text-primary-foreground hover:text-primary-foreground/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Países */}
          <div className="text-primary-foreground">
            <h4 className="font-semibold mb-4">Países</h4>
            <ul className="space-y-3 text-primary-foreground">
              {footerLinks.paises.map((pais) => (
                <li key={pais} className="text-primary-foreground">
                  <span className="text-sm text-primary-foreground">{pais}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-sidebar-border my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground">
            © {new Date().getFullYear()} HR Screener LATAM. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/60">
            <span className="text-primary-foreground">Hecho con</span>
            <span className="text-destructive">❤</span>
            <span className="text-primary-foreground">en LATAM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}