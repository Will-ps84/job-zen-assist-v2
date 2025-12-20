import { useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
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
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

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
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Análisis de CVs con IA
            </h1>
            <p className="text-muted-foreground">
              Sube hasta 100 CVs, pega la descripción del puesto y obtén el Top 5 candidatos.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link to="/app/screener/history">
              <History className="w-4 h-4 mr-1" />
              Historial ({analyses.length})
            </Link>
          </Button>
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
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">
                          Analizados {results.totalAnalyzed} CVs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estos son tus 5 mejores candidatos para{" "}
                          <span className="font-medium text-foreground">
                            {extractJobTitle(jobDescription)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pool Quality Comment */}
                  {results.poolQualityComment && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 mb-1">
                          Análisis del pool de candidatos
                        </p>
                        <p className="text-sm text-amber-700">
                          {results.poolQualityComment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Candidates List */}
                  <div className="space-y-3">
                    {results.topCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${getScoreBg(
                          candidate.score
                        )} ${
                          expandedCandidate === index
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() =>
                          setExpandedCandidate(
                            expandedCandidate === index ? null : index
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                #{index + 1}
                              </span>
                              <span className="font-medium text-foreground truncate">
                                {candidate.name}
                              </span>
                              {index === 0 && (
                                <Badge
                                  variant="default"
                                  className="bg-green-600"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Top Pick
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span
                                className={`font-semibold ${getScoreColor(
                                  candidate.score
                                )}`}
                              >
                                Score: {candidate.score}%
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                Skills: {candidate.skillsMatch}%
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              expandedCandidate === index ? "rotate-90" : ""
                            }`}
                          />
                        </div>

                        {expandedCandidate === index && (
                          <div className="mt-4 pt-4 border-t border-border">
                            {/* Contact Info */}
                            {(candidate.email || candidate.phone) && (
                              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                                {candidate.email && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>{candidate.email}</span>
                                  </div>
                                )}
                                {candidate.phone && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{candidate.phone}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* STAR Bullets */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                <FileStack className="w-4 h-4" />
                                Logros destacados (STAR)
                              </p>
                              <ul className="space-y-1.5">
                                {candidate.starBullets.map((bullet, bulletIdx) => (
                                  <li
                                    key={bulletIdx}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <ArrowRight className="w-3 h-3 mt-1.5 shrink-0 text-primary" />
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
    </AppLayout>
  );
}
