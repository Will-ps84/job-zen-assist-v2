import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Users, Shield, ShieldOff, Loader2, AlertTriangle } from 'lucide-react';

const COUNTRIES: Record<string, string> = {
  MX: 'México',
  AR: 'Argentina',
  CO: 'Colombia',
  PE: 'Perú',
  CL: 'Chile',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { users, loading, assignRole, removeRole, adminCount, refetch } = useAdminData();
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent removing the last admin
    if (newRole === 'remove' && adminCount <= 1) {
      const targetUser = users.find(u => u.user_id === userId);
      if (targetUser?.role === 'admin') {
        toast.error('No puedes eliminar al último administrador');
        return;
      }
    }

    // Prevent self-demotion if last admin
    if (userId === user?.id && newRole !== 'admin' && adminCount <= 1) {
      toast.error('No puedes quitarte el rol de admin siendo el único');
      return;
    }

    setProcessing(userId);

    try {
      if (newRole === 'remove') {
        const { error } = await removeRole(userId);
        if (error) throw error;
        toast.success('Rol eliminado');
      } else {
        const { error } = await assignRole(userId, newRole as 'admin' | 'user');
        if (error) throw error;
        toast.success('Rol actualizado');
      }
    } catch (error) {
      toast.error('Error al actualizar rol');
    } finally {
      setProcessing(null);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              {users.length} usuarios • {adminCount} admin(s)
            </p>
          </div>
        </div>

        {adminCount <= 1 && (
          <Card className="mb-6 border-warning">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm">
                Solo hay {adminCount} administrador. Se recomienda tener al menos 2.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.user_id} className={u.user_id === user?.id ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm">
                        {u.user_id.slice(0, 8)}...
                      </span>
                      {u.user_id === user?.id && (
                        <Badge variant="outline">Tú</Badge>
                      )}
                      {u.role === 'admin' && (
                        <Badge className="bg-amber-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {u.country ? COUNTRIES[u.country] || u.country : 'Sin país'} • 
                      Registro: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={u.role || 'none'}
                      onValueChange={(value) => handleRoleChange(u.user_id, value === 'none' ? 'remove' : value)}
                      disabled={processing === u.user_id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin rol</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {processing === u.user_id && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay usuarios registrados</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
