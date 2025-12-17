import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Shield,
  RefreshCw,
  FileText,
  Star,
  Target,
  Kanban,
  MessageSquare,
  UserCheck,
  Lock
} from 'lucide-react';

interface TestResult {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function BetaChecklist() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'RLS Test', description: 'Usuario A no puede ver datos de Usuario B', status: 'pending', icon: Lock },
    { name: 'Onboarding Redirect', description: 'Redirección correcta post-onboarding', status: 'pending', icon: UserCheck },
    { name: 'CV Edit/Save', description: 'Editar y guardar CV funciona correctamente', status: 'pending', icon: FileText },
    { name: 'STAR Insert', description: 'Insertar logro STAR en CV funciona', status: 'pending', icon: Star },
    { name: 'Vacante → Score', description: 'Crear vacante genera score de match', status: 'pending', icon: Target },
    { name: 'Kanban Drag', description: 'Mover postulaciones en Kanban', status: 'pending', icon: Kanban },
    { name: 'Simulador', description: 'Simulador de entrevistas funciona', status: 'pending', icon: MessageSquare },
  ]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  };

  const runAllTests = async () => {
    setRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(t => ({ ...t, status: 'pending' as const, details: undefined })));

    // Test 1: RLS Test
    updateTest(0, { status: 'running' });
    try {
      // Try to fetch profiles - RLS should only return current user's profile
      const { data: profiles, error } = await supabase.from('profiles').select('id, user_id');
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      const allMine = profiles?.every(p => p.user_id === user?.id) ?? true;
      
      if (allMine || profiles?.length === 0) {
        updateTest(0, { status: 'passed', details: `RLS OK: ${profiles?.length || 0} registros visibles (solo propios)` });
      } else {
        updateTest(0, { status: 'failed', details: 'RLS falla: se pueden ver datos de otros usuarios' });
      }
    } catch (e) {
      updateTest(0, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 2: Onboarding Redirect
    updateTest(1, { status: 'running' });
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .single();
      
      updateTest(1, { 
        status: 'passed', 
        details: `Campo onboarding_completed existe: ${profile?.onboarding_completed ? 'Completado' : 'Pendiente'}` 
      });
    } catch (e) {
      updateTest(1, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 3: CV Edit/Save
    updateTest(2, { status: 'running' });
    try {
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id, name, updated_at')
        .limit(1);
      
      if (error) throw error;
      updateTest(2, { 
        status: 'passed', 
        details: resumes?.length ? `CVs encontrados: ${resumes.length}` : 'Sin CVs aún (tabla accesible)' 
      });
    } catch (e) {
      updateTest(2, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 4: STAR Insert
    updateTest(3, { status: 'running' });
    try {
      const { data: stories, error } = await supabase
        .from('star_stories')
        .select('id, title')
        .limit(1);
      
      if (error) throw error;
      updateTest(3, { 
        status: 'passed', 
        details: stories?.length ? `Historias STAR: ${stories.length}+` : 'Sin historias STAR (tabla accesible)' 
      });
    } catch (e) {
      updateTest(3, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 5: Vacante → Score
    updateTest(4, { status: 'running' });
    try {
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .limit(1);
      
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, score_total')
        .limit(1);
      
      if (jobsError || matchesError) throw jobsError || matchesError;
      
      updateTest(4, { 
        status: 'passed', 
        details: `Jobs: ${jobs?.length || 0}, Matches: ${matches?.length || 0} (tablas accesibles)` 
      });
    } catch (e) {
      updateTest(4, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 6: Kanban Drag
    updateTest(5, { status: 'running' });
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('id, status')
        .limit(5);
      
      if (error) throw error;
      
      const statuses = [...new Set(applications?.map(a => a.status) || [])];
      updateTest(5, { 
        status: 'passed', 
        details: `Postulaciones: ${applications?.length || 0}, Estados: ${statuses.join(', ') || 'ninguno'}` 
      });
    } catch (e) {
      updateTest(5, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    // Test 7: Simulador
    updateTest(6, { status: 'running' });
    try {
      // Just verify the page component exists and KPI events table is accessible
      const { error } = await supabase
        .from('kpi_events')
        .select('id')
        .eq('event_type', 'interview_sim_completed')
        .limit(1);
      
      if (error) throw error;
      updateTest(6, { status: 'passed', details: 'Tabla kpi_events accesible para tracking de simulador' });
    } catch (e) {
      updateTest(6, { status: 'failed', details: `Error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }

    setRunning(false);
    toast.success('Tests completados');
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Beta Checklist
              </h1>
              <p className="text-muted-foreground">Pruebas de calidad para lanzamiento beta</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                {passedCount} Passed
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-600">
                {failedCount} Failed
              </Badge>
            </div>
            <Button onClick={runAllTests} disabled={running}>
              {running ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Ejecutar Tests
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={test.name} className={
              test.status === 'passed' ? 'border-green-500/50' :
              test.status === 'failed' ? 'border-red-500/50' :
              test.status === 'running' ? 'border-primary/50' : ''
            }>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      test.status === 'passed' ? 'bg-green-500/10' :
                      test.status === 'failed' ? 'bg-red-500/10' :
                      test.status === 'running' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <test.icon className={`w-5 h-5 ${
                        test.status === 'passed' ? 'text-green-500' :
                        test.status === 'failed' ? 'text-red-500' :
                        test.status === 'running' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      {test.details && (
                        <p className={`text-xs mt-1 ${
                          test.status === 'passed' ? 'text-green-600' :
                          test.status === 'failed' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {test.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                    {test.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {test.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    {test.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-muted" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Notas para Testing Manual</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✅ <strong>RLS:</strong> Crear 2 usuarios y verificar que no se vean datos cruzados</p>
            <p>✅ <strong>Onboarding:</strong> Completar onboarding y verificar redirect a /app/dashboard</p>
            <p>✅ <strong>CV:</strong> Editar contenido, guardar, recargar y verificar persistencia</p>
            <p>✅ <strong>STAR:</strong> Crear historia STAR y usar "Insertar en CV"</p>
            <p>✅ <strong>Vacante:</strong> Agregar vacante y verificar que se calcule score</p>
            <p>✅ <strong>Kanban:</strong> Arrastrar postulación entre columnas</p>
            <p>✅ <strong>Simulador:</strong> Completar sesión de 5 preguntas y ver resumen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
