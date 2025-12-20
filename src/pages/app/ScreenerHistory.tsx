import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileStack,
  ArrowLeft,
  Eye,
  Trash2,
  Download,
  Calendar,
  Users,
  Loader2,
  Star,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCVAnalyses, CVAnalysis, CandidateResult } from "@/hooks/useCVAnalyses";
import { exportToPDF } from "@/lib/pdfExport";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function ScreenerHistory() {
  const { analyses, loading, deleteAnalysis } = useCVAnalyses();
  const [selectedAnalysis, setSelectedAnalysis] = useState<CVAnalysis | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteAnalysis(id);
    setDeletingId(null);
  };

  const handleExport = (analysis: CVAnalysis) => {
    if (!analysis.top_candidates) {
      toast.error("No hay candidatos para exportar");
      return;
    }
    
    exportToPDF(
      analysis.job_title,
      analysis.job_description,
      analysis.total_cvs,
      analysis.top_candidates,
      analysis.pool_quality_comment || "Sin comentario disponible"
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-muted-foreground";
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
            <Button variant="outline" asChild>
              <Link to="/app/screener">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Nuevo Análisis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Historial de Análisis
            </h1>
            <p className="text-muted-foreground">
              Revisa y descarga tus análisis anteriores de CVs
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : analyses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileStack className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground font-medium text-lg mb-2">
                  No hay análisis guardados
                </p>
                <p className="text-muted-foreground mb-6">
                  Tus análisis de CVs aparecerán aquí
                </p>
                <Button asChild>
                  <Link to="/app/screener">Crear primer análisis</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {analyses.length} análisis guardados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Puesto</TableHead>
                      <TableHead className="text-center">CVs</TableHead>
                      <TableHead className="text-center">Top Score</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground truncate max-w-xs">
                              {analysis.job_title}
                            </p>
                            {analysis.role_category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {analysis.role_category}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {analysis.total_cvs}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {analysis.top_candidates?.[0] ? (
                            <span className={`font-bold ${getScoreColor(analysis.top_candidates[0].score)}`}>
                              {analysis.top_candidates[0].score}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(analysis.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAnalysis(analysis)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExport(analysis)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(analysis.id)}
                              disabled={deletingId === analysis.id}
                            >
                              {deletingId === analysis.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileStack className="w-5 h-5 text-primary" />
              {selectedAnalysis?.job_title}
            </DialogTitle>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{selectedAnalysis.total_cvs} CVs analizados</strong> el{" "}
                  {formatDate(selectedAnalysis.created_at)}
                </p>
              </div>

              {/* Candidates */}
              {selectedAnalysis.top_candidates && selectedAnalysis.top_candidates.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold">Top {selectedAnalysis.top_candidates.length} Candidatos</h4>
                  {selectedAnalysis.top_candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <h5 className="font-semibold">{candidate.name}</h5>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 ml-8">
                            {candidate.experience}
                          </p>
                          <div className="ml-8 space-y-1 mb-2">
                            {candidate.starBullets?.map((bullet, i) => (
                              <p key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                                <Star className="w-3 h-3 mt-1 shrink-0 text-primary" />
                                <span>{bullet}</span>
                              </p>
                            ))}
                          </div>
                          <div className="ml-8 flex flex-wrap gap-1">
                            {candidate.strengths?.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                            {candidate.gaps?.map((gap) => (
                              <Badge key={gap} variant="outline" className="text-xs text-muted-foreground">
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                            {candidate.score}%
                          </div>
                          <Progress value={candidate.skillsMatch} className="w-16 h-1.5 mt-2" />
                          <span className="text-xs text-muted-foreground">{candidate.skillsMatch}% skills</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay candidatos guardados</p>
              )}

              {/* Pool Comment */}
              {selectedAnalysis.pool_quality_comment && (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border">
                  <p className="text-sm font-medium mb-1">Comentario del pool:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnalysis.pool_quality_comment}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => handleExport(selectedAnalysis)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
