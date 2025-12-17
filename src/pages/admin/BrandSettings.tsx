import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrandSettings } from '@/hooks/useBrandSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Palette, Type, Image as ImageIcon } from 'lucide-react';

export default function BrandSettings() {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading, updateSettings } = useBrandSettings();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: '',
    slogan: '',
    logo_url: '',
    primary_color: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        slogan: settings.slogan || '',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#8B5CF6',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('Acceso denegado');
      navigate('/app/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateSettings(form);
    setSaving(false);

    if (error) {
      toast.error('Error al guardar configuración');
    } else {
      toast.success('Configuración guardada');
    }
  };

  if (settingsLoading || roleLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Admin
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Configuración de Marca
            </CardTitle>
            <CardDescription>
              Personaliza el nombre, logo y eslogan de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand_name" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Nombre de la marca
              </Label>
              <Input
                id="brand_name"
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                placeholder="Job Zen Assist"
              />
              <p className="text-xs text-muted-foreground">
                Se mostrará en el header y landing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">Eslogan</Label>
              <Input
                id="slogan"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                placeholder="Tu mentor digital para encontrar el trabajo ideal"
              />
              <p className="text-xs text-muted-foreground">
                Se mostrará en el hero de la landing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                URL del Logo
              </Label>
              <Input
                id="logo_url"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
              />
              {form.logo_url && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Color primario</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nota: El color primario requiere actualizar el CSS para aplicarse
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
