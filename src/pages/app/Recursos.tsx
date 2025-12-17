import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { useResources } from '@/hooks/useResources';
import { useJobPortals } from '@/hooks/useJobPortals';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Globe, 
  ExternalLink, 
  FileSearch, 
  Star, 
  MessageSquare, 
  Linkedin, 
  Briefcase,
  ChevronRight
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  FileSearch,
  Star,
  MessageSquare,
  Linkedin,
  Briefcase,
  Globe,
};

export default function Recursos() {
  const { resources, categories, loading: resourcesLoading, getPublished } = useResources();
  const { portals, loading: portalsLoading, getByCountry } = useJobPortals();
  const { profile } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const userCountry = profile?.country || 'MX';
  const publishedResources = getPublished(userCountry);
  const countryPortals = getByCountry(userCountry);

  const filteredResources = selectedCategory === 'all'
    ? publishedResources
    : publishedResources.filter(r => {
        const cat = categories.find(c => c.id === r.category_id);
        return cat?.slug === selectedCategory;
      });

  const loading = resourcesLoading || portalsLoading;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Centro de Recursos
          </h1>
          <p className="text-muted-foreground">
            Guías, artículos y portales de empleo para tu búsqueda laboral
          </p>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="portals" className="gap-2">
              <Globe className="w-4 h-4" />
              Portales de Empleo
            </TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                Todos
              </Badge>
              {categories.map(cat => {
                const Icon = iconMap[cat.icon || ''] || BookOpen;
                return (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                    className="cursor-pointer gap-1"
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    <Icon className="w-3 h-3" />
                    {cat.name}
                  </Badge>
                );
              })}
            </div>

            {/* Resources Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map(resource => {
                const category = categories.find(c => c.id === resource.category_id);
                const Icon = category?.icon ? iconMap[category.icon] || BookOpen : BookOpen;
                const isExpanded = expandedResource === resource.id;

                return (
                  <Card 
                    key={resource.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setExpandedResource(isExpanded ? null : resource.id)}
                  >
                    {resource.cover_image_url && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img
                          src={resource.cover_image_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                      {category && (
                        <Badge variant="secondary" className="w-fit gap-1">
                          <Icon className="w-3 h-3" />
                          {category.name}
                        </Badge>
                      )}
                    </CardHeader>
                    {isExpanded && resource.content && (
                      <CardContent className="pt-0">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {resource.content.slice(0, 500)}
                            {resource.content.length > 500 && '...'}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {filteredResources.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay recursos disponibles</p>
                    <p className="text-sm">Próximamente más contenido</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Portals Tab */}
          <TabsContent value="portals" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Portales para {userCountry}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {countryPortals.length} portales recomendados
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {countryPortals.map(portal => (
                <Card key={portal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{portal.name}</h3>
                        <Badge variant="secondary" className="mt-1">{portal.type}</Badge>
                      </div>
                      {portal.logo_url && (
                        <img
                          src={portal.logo_url}
                          alt={portal.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                    </div>
                    {portal.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {portal.description}
                      </p>
                    )}
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={portal.url} target="_blank" rel="noopener noreferrer">
                        Visitar portal
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {countryPortals.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay portales para tu país</p>
                    <p className="text-sm">Actualiza tu perfil para ver portales relevantes</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* All Portals Section */}
            {countryPortals.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Otros portales internacionales</h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                  {portals
                    .filter(p => p.is_active && p.country !== userCountry)
                    .slice(0, 8)
                    .map(portal => (
                      <a
                        key={portal.id}
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Badge variant="outline" className="shrink-0">{portal.country}</Badge>
                        <span className="text-sm truncate">{portal.name}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                      </a>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
