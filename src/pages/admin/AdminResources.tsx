import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useResources } from '@/hooks/useResources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, FileText, Eye, EyeOff } from 'lucide-react';

const COUNTRIES = ['ALL', 'MX', 'AR', 'CO', 'PE', 'CL'];

export default function AdminResources() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { resources, categories, loading, createResource, updateResource, deleteResource, refetch } = useResources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category_id: '',
    content: '',
    cover_image_url: '',
    country_scope: ['ALL'],
    is_published: false,
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      category_id: '',
      content: '',
      cover_image_url: '',
      country_scope: ['ALL'],
      is_published: false,
    });
    setEditingId(null);
  };

  const handleEdit = (resource: any) => {
    setForm({
      title: resource.title,
      slug: resource.slug,
      category_id: resource.category_id || '',
      content: resource.content || '',
      cover_image_url: resource.cover_image_url || '',
      country_scope: resource.country_scope || ['ALL'],
      is_published: resource.is_published,
    });
    setEditingId(resource.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug) {
      toast.error('Título y slug son requeridos');
      return;
    }

    if (editingId) {
      const { error } = await updateResource(editingId, form);
      if (!error) {
        toast.success('Recurso actualizado');
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await createResource(form);
      if (!error) {
        toast.success('Recurso creado');
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este recurso?')) {
      const { error } = await deleteResource(id);
      if (!error) toast.success('Recurso eliminado');
    }
  };

  const toggleCountry = (country: string) => {
    if (country === 'ALL') {
      setForm(f => ({ ...f, country_scope: ['ALL'] }));
    } else {
      setForm(f => {
        const current = f.country_scope.filter(c => c !== 'ALL');
        const updated = current.includes(country)
          ? current.filter(c => c !== country)
          : [...current, country];
        return { ...f, country_scope: updated.length ? updated : ['ALL'] };
      });
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Gestión de Recursos
              </h1>
              <p className="text-muted-foreground">{resources.length} recursos</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Nuevo Recurso</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Recurso' : 'Nuevo Recurso'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Cómo optimizar tu CV"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="como-optimizar-cv"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={form.category_id}
                      onValueChange={(value) => setForm(f => ({ ...f, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Imagen de portada (URL)</Label>
                    <Input
                      value={form.cover_image_url}
                      onChange={(e) => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contenido (Markdown)</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="# Título&#10;&#10;Contenido del recurso..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Países (scope)</Label>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map(country => (
                      <Badge
                        key={country}
                        variant={form.country_scope.includes(country) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCountry(country)}
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_published}
                    onCheckedChange={(checked) => setForm(f => ({ ...f, is_published: checked }))}
                  />
                  <Label>Publicado</Label>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? 'Guardar Cambios' : 'Crear Recurso'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {resources.map(resource => {
            const category = categories.find(c => c.id === resource.category_id);
            return (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.is_published ? (
                          <Badge variant="default" className="gap-1">
                            <Eye className="w-3 h-3" />Publicado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <EyeOff className="w-3 h-3" />Borrador
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{resource.slug} • {category?.name || 'Sin categoría'} • 
                        Países: {resource.country_scope?.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {resources.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay recursos aún</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
