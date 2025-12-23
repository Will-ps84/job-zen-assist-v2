import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Gauge, Settings, Clock } from "lucide-react";

export default function Configuracion() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración y Facturación</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu cuenta y plan de suscripción
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan actual */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Tu Plan
                </CardTitle>
                <Badge variant="secondary">Beta</Badge>
              </div>
              <CardDescription>
                Información sobre tu suscripción actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">En construcción</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Aquí podrás ver tu plan activo, fechas de renovación y métodos de pago configurados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Límites de uso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Límites de Análisis
              </CardTitle>
              <CardDescription>
                Tu uso mensual y límites disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">En construcción</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Aquí podrás ver cuántos análisis de CVs has realizado este mes y cuántos te quedan disponibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos de facturación */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Datos de Facturación
              </CardTitle>
              <CardDescription>
                Información fiscal y de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-muted/50 rounded-lg border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Próximamente</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Estamos trabajando en esta sección. Pronto podrás ver tu plan, tus límites de análisis de CVs 
                  y gestionar tus datos de pago directamente desde aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
