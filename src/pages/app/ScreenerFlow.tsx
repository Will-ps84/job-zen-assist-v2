import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Eye,
  Mail,
  Phone,
  History,
  ChevronRight,
} from "lucide-react";
import { CVUploadZone } from "@/components/screener/CVUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCVAnalyses, CandidateResult } from "@/hooks/useCVAnalyses";
import { Link } from "react-router-dom";
import { parseCV, selectTopCandidates, ParsedCV } from "@/lib/cvHeuristics";
import { exportToPDF } from "@/lib/pdfExport";

interface ExtractedFile {
  name: string;
  content: string;
  size: number;
}

const ROLE_CATEGORIES = [
  { value: "desarrollo", label: "Desarrollo / TI" },
  { value: "ventas", label: "Ventas / Comercial" },
  { value: "marketing", label: "Marketing / Comunicación" },
  { value: "administracion", label: "Administración / Finanzas" },
  { value: "datos", label: "Data / Analytics" },
  { value: "general", label: "Otro / General" },
];

export default function ScreenerFlow() {
  const { user } = useAuth();
  const { analyses, saveAnalysis } = useCVAnalyses();
  
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [roleCategory, setRoleCategory] = useState("general");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [results, setResults] = useState<{
    topCandidates: CandidateResult[];
    totalAnalyzed: number;
    poolQualityComment: string;
  } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  const handleFilesExtracted = (files: ExtractedFile[]) => {
    setExtractedFiles(files);
    setResults(null);
  };

  const extractJobTitle = (description: string): string => {
    // Try to extract job title from first line or common patterns
    const lines = description.trim().split('\n');
    const firstLine = lines[0]?.trim() || '';
    
    // Check for common patterns
    const titleMatch = description.match(/(?:puesto|título|posición|vacante)[:\s]*([^\n]+)/i);
    if (titleMatch) return titleMatch[1].trim();
    
    // Use first line if it's short enough
    if (firstLine.length > 3 && firstLine.length < 80) {
      return firstLine.replace(/^[-:•*]/, '').trim();
    }
    
    return "Posición sin título";
  };

  const analyzeCandidates = async () => {
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
    setProgressMessage("Preparando análisis...");

    try {
      // Step 1: Local heuristic processing (0-30%)
      setProgressMessage(`Extrayendo datos de ${extractedFiles.length} CVs...`);
      
      const parsedCVs: ParsedCV[] = [];
      for (let i = 0; i < extractedFiles.length; i++) {
        const file = extractedFiles[i];
        const parsed = parseCV(file.name, file.content, jobDescription, roleCategory);
        parsedCVs.push(parsed);
        
        // Update progress
        const progress = Math.round((i / extractedFiles.length) * 30);
        setAnalysisProgress(progress);
        
        if (i % 10 === 0) {
          setProgressMessage(`Procesando CV ${i + 1} de ${extractedFiles.length}...`);
          // Small delay to allow UI updates
          await new Promise(r => setTimeout(r, 10));
        }
      }

      // Step 2: Select top 20 by preliminary score (30-40%)
      setAnalysisProgress(35);
      setProgressMessage("Seleccionando mejores candidatos por keywords...");
      
      const topCVs = selectTopCandidates(parsedCVs, 20);
      console.log(`Selected top ${topCVs.length} CVs for AI analysis`);

      // Step 3: Send to AI for deep analysis (40-90%)
      setAnalysisProgress(40);
      setProgressMessage(`Analizando Top ${topCVs.length} con IA...`);

      const jobTitle = extractJobTitle(jobDescription);

      // Prepare data for edge function
      const cvsForAI = topCVs.map(cv => ({
        name: cv.filename,
        content: cv.rawText,
        preliminaryScore: cv.preliminaryScore,
        extractedName: cv.name,
        extractedExperience: cv.experience,
        extractedSkills: cv.skills,
        email: cv.email,
        phone: cv.phone,
      }));

      // Progress simulation during AI call
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 2, 85));
      }, 1000);

      const { data, error } = await supabase.functions.invoke("analyze-cvs", {
        body: {
          cvs: cvsForAI,
          jobDescription,
          jobTitle,
          roleCategory,
          maxResults: 5,
        },
      });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Error en el análisis");
      }

      // Step 4: Process results (90-100%)
      setAnalysisProgress(95);
      setProgressMessage("Generando informe...");

      const analysisResult = {
        topCandidates: data.topCandidates as CandidateResult[],
        totalAnalyzed: extractedFiles.length,
        poolQualityComment: data.poolQualityComment,
      };

      setResults(analysisResult);
      setAnalysisProgress(100);

      // Save to history
      await saveAnalysis(
        jobTitle,
        jobDescription,
        roleCategory,
        extractedFiles.length,
        analysisResult.topCandidates,
        analysisResult.poolQualityComment
      );

      // Track event
      await supabase.from("kpi_events").insert({
        user_id: user?.id,
        event_type: "cv_analysis_completed",
        value: extractedFiles.length,
        metadata: { 
          top_score: analysisResult.topCandidates?.[0]?.score || 0,
          role_category: roleCategory,
          pre_filtered: topCVs.length
        },
      });

      toast.success(`Análisis completado: ${extractedFiles.length} CVs procesados`);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Error al analizar CVs. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
      setProgressMessage("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-50 border-green-200";
    if (score >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-muted border-border";
  };

  const handleExportPDF = () => {
    if (!results) return;
    
    const jobTitle = extractJobTitle(jobDescription);
    exportToPDF(
      jobTitle,
      jobDescription,
      results.totalAnalyzed,
      results.topCandidates,
      results.poolQualityComment
    );
    toast.success("Abriendo ventana de impresión...");
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setExtractedFiles([]);
    setJobDescription("");
    setRoleCategory("general");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-foreground">
                HR Screener
              </span>
              <span className="text-xs text-muted-foreground ml-1">LATAM</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/screener/history">
                <History className="w-4 h-4 mr-1" />
                Historial ({analyses.length})
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Análisis de CVs con IA
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sube hasta 100 CVs en un ZIP, pega el job description y obtén el Top 5
              candidatos con scores y logros STAR en menos de 2 minutos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              {/* CV Upload */}
              <CVUploadZone
                onFilesExtracted={handleFilesExtracted}
                isProcessing={isAnalyzing}
                maxFiles={100}
                maxSizeMB={50}
              />

              {/* Role Category */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Categoría del Rol
                    </h3>
                  </div>
                  <Select value={roleCategory} onValueChange={setRoleCategory} disabled={isAnalyzing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ayuda a mejorar la detección de skills relevantes.
                  </p>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Job Description
                    </h3>
                  </div>
                  <Textarea
                    placeholder="Pega aquí la descripción completa del puesto...

Incluye:
• Título del puesto
• Requisitos técnicos y experiencia
• Responsabilidades principales
• Skills deseables
• Cualquier otro requisito importante"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="resize-none"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {jobDescription.length}/50 caracteres mínimos
                  </p>
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={analyzeCandidates}
                disabled={
                  isAnalyzing ||
                  extractedFiles.length === 0 ||
                  jobDescription.length < 50
                }
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analizar y Rankear CVs
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{progressMessage}</span>
                        <span className="font-medium text-primary">{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Esto puede tardar hasta 2 minutos para 100 CVs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Results */}
            <Card className={`border-border transition-all ${results ? "ring-2 ring-primary/30" : ""}`}>
              <CardContent className="pt-6">
                {!results && !isAnalyzing && (
                  <div className="text-center py-20">
                    <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground font-medium text-lg">
                      Tu Top 5 candidatos aparecerá aquí
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                      Con score de compatibilidad, match de skills y logros tipo STAR
                    </p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="text-center py-20">
                    <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-medium text-lg">
                      Analizando {extractedFiles.length} CVs...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {progressMessage}
                    </p>
                  </div>
                )}

                {results && (
                  <div className="space-y-4">
                    {/* Summary Header */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="text-foreground">
                        <strong>Analizados {results.totalAnalyzed} CVs</strong> — estos son tus{" "}
                        <strong className="text-primary">{results.topCandidates.length} mejores candidatos</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Top {results.topCandidates.length} Candidatos
                      </h3>
                      <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <Download className="w-4 h-4 mr-1" />
                        Descargar PDF
                      </Button>
                    </div>

                    {/* Candidates List */}
                    {results.topCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getScoreBg(candidate.score)} transition-all hover:shadow-md cursor-pointer`}
                        onClick={() => setSelectedCandidate(
                          selectedCandidate?.name === candidate.name ? null : candidate
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-foreground truncate">
                                {candidate.name}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 ml-9">
                              {candidate.experience}
                            </p>

                            {/* STAR Bullets */}
                            <div className="ml-9 space-y-1 mb-2">
                              {candidate.starBullets.slice(0, 2).map((bullet, i) => (
                                <p key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                                  <Star className="w-3 h-3 mt-1 shrink-0 text-primary" />
                                  <span>{bullet}</span>
                                </p>
                              ))}
                            </div>

                            {/* Skills Tags */}
                            <div className="ml-9 flex flex-wrap gap-1">
                              {candidate.strengths.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.gaps.slice(0, 2).map((gap) => (
                                <Badge key={gap} variant="outline" className="text-xs text-muted-foreground">
                                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                  {gap}
                                </Badge>
                              ))}
                            </div>

                            {/* Expanded Details */}
                            {selectedCandidate?.name === candidate.name && (
                              <div className="ml-9 mt-4 pt-4 border-t space-y-2">
                                {candidate.email && (
                                  <p className="text-sm flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                                      {candidate.email}
                                    </a>
                                  </p>
                                )}
                                {candidate.phone && (
                                  <p className="text-sm flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <a href={`tel:${candidate.phone}`} className="text-primary hover:underline">
                                      {candidate.phone}
                                    </a>
                                  </p>
                                )}
                                {candidate.starBullets.length > 2 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Más logros:</p>
                                    {candidate.starBullets.slice(2).map((bullet, i) => (
                                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                                        <Star className="w-3 h-3 mt-1 shrink-0 text-primary" />
                                        <span>{bullet}</span>
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Score */}
                          <div className="text-right shrink-0">
                            <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                              {candidate.score}%
                            </div>
                            <div className="text-xs text-muted-foreground">Match</div>
                            <div className="mt-2">
                              <Progress value={candidate.skillsMatch} className="w-16 h-1.5" />
                              <span className="text-xs text-muted-foreground">{candidate.skillsMatch}% skills</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 mt-2 text-muted-foreground transition-transform ${
                              selectedCandidate?.name === candidate.name ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pool Quality Comment */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
                      <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Comentario sobre el pool
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {results.poolQualityComment}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <Button className="flex-1" variant="default" onClick={handleExportPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Informe PDF
                      </Button>
                      <Button variant="outline" onClick={handleNewAnalysis}>
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
