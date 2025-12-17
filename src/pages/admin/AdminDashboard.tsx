import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Palette, 
  FileText, 
  Globe, 
  Settings, 
  BarChart3, 
  Users,
  Shield,
  Loader2,
  ArrowLeft
} from 'lucide-react';

const adminModules = [
  {
    title: 'Configuración de Marca',
    description: 'Edita nombre, logo y eslogan',
    icon: Palette,
    href: '/admin/brand',
    color: 'text-purple-500',
  },
  {
    title: 'Recursos (CMS)',
    description: 'Gestiona artículos y guías',
    icon: FileText,
    href: '/admin/resources',
    color: 'text-blue-500',
  },
  {
    title: 'Portales por País',
    description: 'Configura fuentes de empleo',
    icon: Globe,
    href: '/admin/portals',
    color: 'text-green-500',
  },
  {
    title: 'Gestión de Usuarios',
    description: 'Asigna roles admin/usuario',
    icon: Users,
    href: '/admin/users',
    color: 'text-pink-500',
  },
  {
    title: 'Métricas Globales',
    description: 'KPIs anonimizados del sistema',
    icon: BarChart3,
    href: '/admin/metrics',
    color: 'text-cyan-500',
  },
  {
    title: 'Planes y Límites',
    description: 'Ajusta configuración de planes',
    icon: Settings,
    href: '/admin/plans',
    color: 'text-orange-500',
    comingSoon: true,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Acceso denegado - Se requiere rol de administrador');
      navigate('/app/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Gestiona la configuración del sistema
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((module) => (
            <Card
              key={module.href}
              className={`transition-all hover:shadow-md ${
                module.comingSoon ? 'opacity-60' : 'hover:border-primary/50'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <module.icon className={`w-5 h-5 ${module.color}`} />
                  {module.title}
                  {module.comingSoon && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      Próximamente
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {module.comingSoon ? (
                  <Button variant="outline" disabled className="w-full">
                    No disponible
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={module.href}>Acceder</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
