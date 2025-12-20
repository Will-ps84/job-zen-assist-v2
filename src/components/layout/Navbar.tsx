import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileStack } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#demo", label: "Demo", isAnchor: true },
  { href: "/#como-funciona", label: "Cómo funciona", isAnchor: true },
  { href: "/precios", label: "Precios", isAnchor: false },
  { href: "/#faq", label: "FAQ", isAnchor: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = useCallback((href: string, isAnchor: boolean) => {
    setIsOpen(false);
    
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
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <FileStack className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-foreground">
              HR Screener
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              LATAM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href, link.isAnchor)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link to="/registro">Prueba gratis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden transition-all duration-300",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isAnchor)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
              >
                {link.label}
              </button>
            ))}
            <hr className="border-border" />
            <div className="flex flex-col gap-2">
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/registro">Prueba gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
