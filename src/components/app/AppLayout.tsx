import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Target,
  Kanban,
  MessageSquare,
  BarChart3,
  BookOpen,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  Star,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/perfil", label: "Perfil & Objetivos", icon: User },
  { href: "/app/cv", label: "CV Maestro", icon: FileText },
  { href: "/app/star", label: "STAR Wizard", icon: Star },
  { href: "/app/vacantes", label: "Vacantes", icon: Target },
  { href: "/app/postulaciones", label: "Postulaciones", icon: Kanban },
  { href: "/app/entrevistas", label: "Simulador", icon: MessageSquare },
  { href: "/app/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/app/recursos", label: "Recursos", icon: BookOpen },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { settings } = useBrandSettings();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/app" className="flex items-center gap-2">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.brand_name}
                  className="w-10 h-10 rounded-xl object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-sidebar-foreground">
                  {settings.brand_name.split(' ')[0] || 'El Mentor'}
                </span>
                <span className="text-xs text-sidebar-foreground/60 -mt-1">
                  {settings.brand_name.split(' ').slice(1).join(' ') || 'Digital'}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/app" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Settings + Admin */}
          <div className="p-4 border-t border-sidebar-border space-y-1">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Panel Admin
              </Link>
            )}
            <Link
              to="/app/configuracion"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              Configuración
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Breadcrumb placeholder */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm">{displayName}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/app/perfil">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/app/configuracion">Configuración</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
