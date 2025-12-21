import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileArchive, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configure PDF.js worker - use bundled worker for v5.x
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ExtractedFile {
  name: string;
  content: string;
  size: number;
}

interface FailedFile {
  name: string;
  reason: string;
}

interface CVUploadZoneProps {
  onFilesExtracted: (files: ExtractedFile[]) => void;
  isProcessing: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function CVUploadZone({ onFilesExtracted, isProcessing, maxFiles = 100, maxSizeMB = 50 }: CVUploadZoneProps) {
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer, fileName: string): Promise<{ text: string; error?: string }> => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
      
      const trimmedText = fullText.trim();
      if (trimmedText.length < 50) {
        return { text: "", error: "Texto insuficiente (PDF escaneado o vacío)" };
      }
      
      return { text: trimmedText };
    } catch (err) {
      console.error(`Error extracting PDF text from ${fileName}:`, err);
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      return { text: "", error: `Error al leer PDF: ${errorMsg}` };
    }
  };

  const processZipFile = async (file: File) => {
    setExtracting(true);
    setError(null);
    setExtractedFiles([]);
    setFailedFiles([]);
    setExtractionProgress(0);

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo es muy grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo permitido: ${maxSizeMB}MB`);
      setExtracting(false);
      return;
    }

    try {
      const zip = new JSZip();
      let contents;
      
      try {
        contents = await zip.loadAsync(file);
      } catch (zipErr) {
        console.error("Error loading ZIP:", zipErr);
        setError("El archivo ZIP no es válido o está corrupto. Intenta crear uno nuevo.");
        setExtracting(false);
        return;
      }
      
      // Filter PDF files excluding Mac OS metadata
      const allFiles = Object.keys(contents.files);
      const pdfFiles = allFiles.filter(
        (name) => name.toLowerCase().endsWith(".pdf") && 
                  !name.startsWith("__MACOSX") && 
                  !contents.files[name].dir
      );

      if (allFiles.length === 0) {
        setError("El archivo ZIP está vacío");
        setExtracting(false);
        return;
      }

      if (pdfFiles.length === 0) {
        const nonPdfFiles = allFiles.filter(n => !n.startsWith("__MACOSX") && !contents.files[n].dir);
        if (nonPdfFiles.length > 0) {
          setError(`No se encontraron PDFs. Archivos encontrados: ${nonPdfFiles.slice(0, 3).join(", ")}${nonPdfFiles.length > 3 ? "..." : ""}`);
        } else {
          setError("No se encontraron archivos PDF en el ZIP");
        }
        setExtracting(false);
        return;
      }

      if (pdfFiles.length > maxFiles) {
        setError(`Máximo ${maxFiles} CVs por análisis. Tu ZIP tiene ${pdfFiles.length} PDFs`);
        setExtracting(false);
        return;
      }

      const extracted: ExtractedFile[] = [];
      const failed: FailedFile[] = [];
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfName = pdfFiles[i];
        const pdfFile = contents.files[pdfName];
        const displayName = pdfName.split("/").pop() || pdfName;
        
        try {
          const arrayBuffer = await pdfFile.async("arraybuffer");
          const result = await extractTextFromPDF(arrayBuffer, displayName);
          
          if (result.text) {
            extracted.push({
              name: displayName,
              content: result.text,
              size: arrayBuffer.byteLength,
            });
          } else {
            failed.push({
              name: displayName,
              reason: result.error || "No se pudo extraer texto"
            });
          }
        } catch (err) {
          console.error(`Error processing ${pdfName}:`, err);
          failed.push({
            name: displayName,
            reason: err instanceof Error ? err.message : "Error al procesar"
          });
        }
        
        setExtractionProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
      }

      setExtractedFiles(extracted);
      setFailedFiles(failed);
      
      if (extracted.length === 0) {
        const failedList = failed.slice(0, 5).map(f => `${f.name}: ${f.reason}`).join("\n");
        setError(`No se pudo extraer texto de ningún PDF.\n\nDetalles:\n${failedList}`);
      } else {
        onFilesExtracted(extracted);
      }
    } catch (err) {
      console.error("Error processing ZIP:", err);
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al procesar el archivo ZIP: ${errorMsg}`);
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        processZipFile(file);
      } else {
        setError("Por favor sube un archivo ZIP");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
    disabled: extracting || isProcessing,
  });

  const clearFiles = () => {
    setExtractedFiles([]);
    setFailedFiles([]);
    setError(null);
    setExtractionProgress(0);
  };

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileArchive className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Subir CVs (ZIP)</h3>
        </div>

        {extractedFiles.length === 0 ? (
          <>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                (extracting || isProcessing) && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              
              {extracting ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
                  <div>
                    <p className="text-foreground font-medium">
                      Extrayendo PDFs...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {extractionProgress}% completado
                    </p>
                  </div>
                  <Progress value={extractionProgress} className="w-48 mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-foreground font-medium">
                      {isDragActive
                        ? "Suelta el archivo aquí..."
                        : "Arrastra tu ZIP de CVs aquí"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      o haz click para seleccionar
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Máx. {maxFiles} CVs en formato PDF · Hasta {maxSizeMB}MB
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap font-sans">{error}</pre>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm text-foreground font-medium">
                  {extractedFiles.length} CVs extraídos
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {extractedFiles.slice(0, 10).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(file.size / 1024)} KB
                  </Badge>
                </div>
              ))}
              {extractedFiles.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{extractedFiles.length - 10} más...
                </p>
              )}
            </div>

            {/* Show failed files warning */}
            {failedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-start gap-2 text-sm text-warning-foreground">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      No se pudo extraer texto de {failedFiles.length} archivo(s):
                    </p>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground text-xs">
                      {failedFiles.slice(0, 5).map((file, idx) => (
                        <li key={idx}>• {file.name}: {file.reason}</li>
                      ))}
                      {failedFiles.length > 5 && (
                        <li>• ...y {failedFiles.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
