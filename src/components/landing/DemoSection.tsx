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
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchResult {
  score: number;
  gaps: string[];
  strengths: string[];
  recommendation: string;
}

export function DemoSection() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const analyzeJob = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      toast.error("Pega una descripción de vacante más completa (mínimo 50 caracteres)");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-job-demo", {
        body: { jobDescription },
      });

      if (error) throw error;
      setResult(data);

      // Track demo_used event (anonymous - no user_id required for landing)
      try {
        await supabase.from('kpi_events').insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Anonymous placeholder
          event_type: 'demo_used',
          value: 1,
          metadata: { source: 'landing' }
        }]);
      } catch (e) {
        // Silently fail - demo tracking is non-critical
        console.log('Demo tracking skipped (expected if not logged in)');
      }
    } catch (error) {
      console.error("Error analyzing job:", error);
      toast.error("Error al analizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente match";
    if (score >= 75) return "Buen match";
    if (score >= 60) return "Match moderado";
    return "Match bajo";
  };

  return (
    <section id="demo" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Zap className="w-3 h-3 mr-1" />
              Demo sin registro
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Prueba el poder del matching IA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pega una descripción de vacante y descubre cómo analizamos tu compatibilidad en segundos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input */}
            <Card className="border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Descripción de la vacante</h3>
                </div>
                <Textarea
                  placeholder="Pega aquí la descripción completa de una vacante de LinkedIn, Indeed, o cualquier portal de empleo..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 50 caracteres. Entre más detallada, mejor el análisis.
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
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analizar compatibilidad
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            <Card className={`border-border transition-all ${result ? "ring-2 ring-accent/50" : ""}`}>
              <CardContent className="pt-6">
                {!result && !loading && (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Tu análisis de compatibilidad aparecerá aquí
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Analizando vacante...</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getScoreLabel(result.score)}
                      </p>
                      <Progress value={result.score} className="mt-4 h-2" />
                    </div>

                    {/* Strengths */}
                    {result.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-success flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Fortalezas detectadas
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gaps */}
                    {result.gaps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-warning flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Áreas a mejorar
                        </h4>
                        <ul className="space-y-1">
                          {result.gaps.map((gap, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <p className="text-sm text-foreground">{result.recommendation}</p>
                    </div>

                    {/* CTA */}
                    <Button asChild className="w-full" variant="default">
                      <Link to="/registro">
                        Crear cuenta para análisis completo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
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
