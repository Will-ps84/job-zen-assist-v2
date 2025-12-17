import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useFeedback } from '@/hooks/useFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MessageSquare, 
  Bug, 
  Lightbulb,
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { feedbacks, loading, updateFeedbackStatus } = useFeedback();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStatusChange = async (id: string, status: string) => {
    const result = await updateFeedbackStatus(id, status as any);
    if (result.success) {
      toast.success('Estado actualizado');
    } else {
      toast.error('Error al actualizar');
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-600',
    reviewing: 'bg-amber-500/10 text-amber-600',
    resolved: 'bg-green-500/10 text-green-600',
    wontfix: 'bg-gray-500/10 text-gray-600',
  };

  const statusLabels: Record<string, string> = {
    new: 'Nuevo',
    reviewing: 'En revisión',
    resolved: 'Resuelto',
    wontfix: 'No se hará',
  };

  const severityColors: Record<string, string> = {
    low: 'bg-gray-500/10 text-gray-600',
    medium: 'bg-amber-500/10 text-amber-600',
    high: 'bg-orange-500/10 text-orange-600',
    critical: 'bg-red-500/10 text-red-600',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Feedback de Usuarios
            </h1>
            <p className="text-muted-foreground">{feedbacks.length} feedbacks recibidos</p>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay feedbacks aún</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {feedback.type === 'bug' ? (
                          <Bug className="w-4 h-4 text-red-500" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-medium">
                          {feedback.type === 'bug' ? 'Bug Report' : 'Sugerencia'}
                        </span>
                        {feedback.severity && (
                          <Badge variant="outline" className={severityColors[feedback.severity]}>
                            {feedback.severity}
                          </Badge>
                        )}
                        <Badge variant="outline" className={statusColors[feedback.status]}>
                          {statusLabels[feedback.status]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-2">{feedback.comment}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(feedback.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                        </span>
                        {feedback.page_url && (
                          <span>Página: {feedback.page_url}</span>
                        )}
                      </div>
                    </div>

                    <Select
                      value={feedback.status}
                      onValueChange={(value) => handleStatusChange(feedback.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nuevo</SelectItem>
                        <SelectItem value="reviewing">En revisión</SelectItem>
                        <SelectItem value="resolved">Resuelto</SelectItem>
                        <SelectItem value="wontfix">No se hará</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
