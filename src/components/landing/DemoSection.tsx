import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  ArrowRight,
  Zap,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CandidateResult {
  name: string;
  score: number;
  starSummary: string;
  skillsMatch: number;
  strengths: string[];
  gaps: string[];
}

// Mock top 5 candidates for demo
const mockCandidates: CandidateResult[] = [
  {
    name: "Juan Pérez García",
    score: 94,
    starSummary: "Reduje churn 35% en ecommerce implementando sistema de retención automatizado",
    skillsMatch: 92,
    strengths: ["React", "Node.js", "Liderazgo técnico"],
    gaps: ["GraphQL"],
  },
  {
    name: "María López Ruiz",
    score: 89,
    starSummary: "Implementé CRM que generó +$2M en pipeline en 6 meses",
    skillsMatch: 87,
    strengths: ["Salesforce", "Gestión de equipos", "KPIs"],
    gaps: ["HubSpot"],
  },
  {
    name: "Carlos Rodríguez M.",
    score: 85,
    starSummary: "Optimicé procesos de onboarding reduciendo tiempo 40%",
    skillsMatch: 83,
    strengths: ["HR Tech", "Automatización", "Comunicación"],
    gaps: ["Análisis de datos"],
  },
  {
    name: "Ana Martínez V.",
    score: 78,
    starSummary: "Lideré migración cloud ahorrando $50K/año en infraestructura",
    skillsMatch: 75,
    strengths: ["AWS", "DevOps", "Scrum"],
    gaps: ["Kubernetes", "Terraform"],
  },
  {
    name: "Roberto Sánchez L.",
    score: 72,
    starSummary: "Desarrollé API REST que procesó +1M transacciones/día",
    skillsMatch: 70,
    strengths: ["Python", "APIs", "Bases de datos"],
    gaps: ["Frontend", "Testing"],
  },
];

export function DemoSection() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CandidateResult[] | null>(null);

  const analyzeJob = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      toast.error("Pega una descripción de vacante más completa (mínimo 50 caracteres)");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call the edge function to analyze CVs
      // For demo, we use mock data with slight randomization
      const shuffledCandidates = [...mockCandidates].map(c => ({
        ...c,
        score: Math.min(100, c.score + Math.floor(Math.random() * 6) - 3),
        skillsMatch: Math.min(100, c.skillsMatch + Math.floor(Math.random() * 8) - 4),
      })).sort((a, b) => b.score - a.score);

      setResults(shuffledCandidates);

      // Track demo_used event
      try {
        await supabase.from('kpi_events').insert([{
          user_id: '00000000-0000-0000-0000-000000000000',
          event_type: 'demo_used',
          value: 1,
          metadata: { source: 'landing', type: 'hr_screener' }
        }]);
      } catch (e) {
        console.log('Demo tracking skipped');
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      toast.error("Error al analizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-success/10 border-success/30";
    if (score >= 75) return "bg-warning/10 border-warning/30";
    return "bg-muted border-border";
  };

  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Zap className="w-3 h-3 mr-1" />
              Prueba en 30 segundos
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mira el poder del HR Screener
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pega un job description y te mostramos cómo rankeamos candidatos con análisis STAR.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input - 2 cols */}
            <Card className="border-border lg:col-span-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Job Description</h3>
                </div>
                <Textarea
                  placeholder="Pega aquí la descripción del puesto de Bumeran, Computrabajo, LinkedIn...

Ejemplo:
- Desarrollador Full Stack Senior
- 5+ años de experiencia
- React, Node.js, PostgreSQL
- Liderazgo de equipos
- Metodologías ágiles"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className="resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 50 caracteres. En la versión real, también subirías el ZIP de CVs.
                </p>
                <Button
                  onClick={analyzeJob}
                  disabled={loading || jobDescription.length < 50}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analizando candidatos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calcular Top 5
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results - 3 cols */}
            <Card className={`border-border lg:col-span-3 transition-all ${results ? "ring-2 ring-accent/50" : ""}`}>
              <CardContent className="pt-6">
                {!results && !loading && (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Tu Top 5 candidatos aparecerá aquí
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-2">
                      Con score de compatibilidad y análisis STAR
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-medium">Analizando 47 CVs...</p>
                    <p className="text-sm text-muted-foreground mt-2">Extrayendo skills, experiencia y logros STAR</p>
                  </div>
                )}

                {results && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Top 5 Candidatos
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        De 47 CVs analizados
                      </Badge>
                    </div>

                    {results.map((candidate, index) => (
                      <div
                        key={candidate.name}
                        className={`p-4 rounded-lg border ${getScoreBg(candidate.score)} transition-all hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-foreground truncate">
                                {candidate.name}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 flex items-start gap-1">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 text-accent" />
                              <span className="italic">"{candidate.starSummary}"</span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.strengths.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  <CheckCircle2 className="w-2 h-2 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.gaps.map((gap) => (
                                <Badge key={gap} variant="outline" className="text-xs text-muted-foreground">
                                  <AlertTriangle className="w-2 h-2 mr-1" />
                                  {gap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                              {candidate.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">Match</div>
                            <Progress value={candidate.skillsMatch} className="w-16 h-1.5 mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* CTA */}
                    <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20 text-center">
                      <p className="text-sm text-foreground mb-3">
                        ¿Te gustaría analizar tus propios CVs? Prueba gratis 7 días.
                      </p>
                      <Button asChild variant="default">
                        <Link to="/registro">
                          Crear cuenta gratis
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
