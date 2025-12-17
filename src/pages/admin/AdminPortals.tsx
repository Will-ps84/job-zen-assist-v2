import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useJobPortals } from '@/hooks/useJobPortals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Globe, ExternalLink } from 'lucide-react';

const COUNTRIES = [
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Perú' },
  { code: 'CL', name: 'Chile' },
];

const PORTAL_TYPES = ['general', 'professional', 'tech', 'remote', 'freelance'];

export default function AdminPortals() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { portals, loading, createPortal, updatePortal, deletePortal } = useJobPortals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [form, setForm] = useState({
    name: '',
    url: '',
    country: 'MX',
    type: 'general',
    description: '',
    logo_url: '',
    is_active: true,
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const resetForm = () => {
    setForm({
      name: '',
      url: '',
      country: 'MX',
      type: 'general',
      description: '',
      logo_url: '',
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (portal: any) => {
    setForm({
      name: portal.name,
      url: portal.url,
      country: portal.country,
      type: portal.type || 'general',
      description: portal.description || '',
      logo_url: portal.logo_url || '',
      is_active: portal.is_active,
    });
    setEditingId(portal.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.url) {
      toast.error('Nombre y URL son requeridos');
      return;
    }

    if (editingId) {
      const { error } = await updatePortal(editingId, form);
      if (!error) {
        toast.success('Portal actualizado');
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await createPortal(form);
      if (!error) {
        toast.success('Portal creado');
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este portal?')) {
      const { error } = await deletePortal(id);
      if (!error) toast.success('Portal eliminado');
    }
  };

  const filteredPortals = filterCountry === 'all' 
    ? portals 
    : portals.filter(p => p.country === filterCountry);

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Portales por País
              </h1>
              <p className="text-muted-foreground">{portals.length} portales configurados</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Nuevo Portal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Portal' : 'Nuevo Portal'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="OCC Mundial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Select
                        value={form.country}
                        onValueChange={(value) => setForm(f => ({ ...f, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={form.url}
                      onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="https://www.ejemplo.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={form.type}
                        onValueChange={(value) => setForm(f => ({ ...f, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PORTAL_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input
                        value={form.logo_url}
                        onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descripción breve del portal"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm(f => ({ ...f, is_active: checked }))}
                    />
                    <Label>Activo</Label>
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    {editingId ? 'Guardar Cambios' : 'Crear Portal'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortals.map(portal => (
            <Card key={portal.id} className={!portal.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{portal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{portal.country}</Badge>
                      <Badge variant="secondary">{portal.type}</Badge>
                      {!portal.is_active && <Badge variant="destructive">Inactivo</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(portal)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(portal.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {portal.description && (
                  <p className="text-sm text-muted-foreground mb-3">{portal.description}</p>
                )}
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Visitar <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          ))}

          {filteredPortals.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay portales para este filtro</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
