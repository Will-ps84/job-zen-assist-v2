import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Loader2,
  Sparkles,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  FileStack,
} from "lucide-react";
import { CVUploadZone } from "@/components/screener/CVUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface ExtractedFile {
  name: string;
  content: string;
  size: number;
}

interface CandidateResult {
  name: string;
  score: number;
  starSummary: string;
  skillsMatch: number;
  strengths: string[];
  gaps: string[];
  experience: string;
}

interface AnalysisResult {
  success: boolean;
  totalAnalyzed: number;
  topCandidates: CandidateResult[];
}

export default function ScreenerFlow() {
  const { user } = useAuth();
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleFilesExtracted = (files: ExtractedFile[]) => {
    setExtractedFiles(files);
    setResults(null);
  };

  const analyzeCandicates = async () => {
    if (extractedFiles.length === 0) {
      toast.error("Primero sube un ZIP con CVs");
      return;
    }

    if (jobDescription.length < 50) {
      toast.error("El job description debe tener al menos 50 caracteres");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setResults(null);

    try {
      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("analyze-cvs", {
        body: {
          cvs: extractedFiles.map((f) => ({ name: f.name, content: f.content })),
          jobDescription,
          maxResults: 5,
        },
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) {
        throw error;
      }

      setResults(data as AnalysisResult);

      // Track event
      await supabase.from("kpi_events").insert({
        user_id: user?.id,
        event_type: "cv_analysis_completed",
        value: extractedFiles.length,
        metadata: { top_score: data?.topCandidates?.[0]?.score || 0 },
      });

      toast.success(`Análisis completado: ${data.totalAnalyzed} CVs procesados`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Error al analizar CVs. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
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

  const exportToPDF = () => {
    // In production, this would generate a proper PDF
    toast.info("Exportando PDF... (próximamente)");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-foreground">
                HR Screener
              </span>
              <span className="text-xs text-muted-foreground ml-1">LATAM</span>
            </div>
          </Link>
          <Button variant="outline" asChild>
            <Link to="/app">Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Análisis de CVs con IA
            </h1>
            <p className="text-muted-foreground">
              Sube tu ZIP de CVs y pega el job description para obtener el Top 5
              candidatos rankeados
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              {/* CV Upload */}
              <CVUploadZone
                onFilesExtracted={handleFilesExtracted}
                isProcessing={isAnalyzing}
              />

              {/* Job Description */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">
                      Job Description
                    </h3>
                  </div>
                  <Textarea
                    placeholder="Pega aquí la descripción del puesto...

Ejemplo:
- Título: Desarrollador Full Stack Senior
- Requisitos: 5+ años de experiencia, React, Node.js, PostgreSQL
- Responsabilidades: Liderar equipo técnico, arquitectura de software
- Nice to have: AWS, Docker, metodologías ágiles"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="resize-none"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Mínimo 50 caracteres. Incluye requisitos, skills y
                    responsabilidades.
                  </p>
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={analyzeCandicates}
                disabled={
                  isAnalyzing ||
                  extractedFiles.length === 0 ||
                  jobDescription.length < 50
                }
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizando {extractedFiles.length} CVs...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analizar y Rankear CVs
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {analysisProgress}% - Extrayendo skills, experiencia y logros
                    STAR...
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <Card
              className={`border-border transition-all ${
                results ? "ring-2 ring-accent/50" : ""
              }`}
            >
              <CardContent className="pt-6">
                {!results && !isAnalyzing && (
                  <div className="text-center py-16">
                    <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground font-medium">
                      Tu Top 5 candidatos aparecerá aquí
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Con score de compatibilidad y análisis STAR
                    </p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-medium">
                      Analizando {extractedFiles.length} CVs...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Extrayendo skills, experiencia y logros STAR
                    </p>
                  </div>
                )}

                {results && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Top {results.topCandidates.length} Candidatos
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          De {results.totalAnalyzed} CVs
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToPDF}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>

                    {results.topCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getScoreBg(
                          candidate.score
                        )} transition-all hover:shadow-md`}
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
                            <p className="text-xs text-muted-foreground mb-2">
                              {candidate.experience}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2 flex items-start gap-1">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 text-accent" />
                              <span className="italic">
                                "{candidate.starSummary}"
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.strengths.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  <CheckCircle2 className="w-2 h-2 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.gaps.map((gap) => (
                                <Badge
                                  key={gap}
                                  variant="outline"
                                  className="text-xs text-muted-foreground"
                                >
                                  <AlertTriangle className="w-2 h-2 mr-1" />
                                  {gap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                candidate.score
                              )}`}
                            >
                              {candidate.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Match
                            </div>
                            <Progress
                              value={candidate.skillsMatch}
                              className="w-16 h-1.5 mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <Button className="flex-1" variant="default">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Contactar Top 5
                      </Button>
                      <Button variant="outline" onClick={() => setResults(null)}>
                        Nuevo Análisis
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
