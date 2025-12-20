import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CVData {
  name: string;
  content: string;
  preliminaryScore: number;
  extractedName: string;
  extractedExperience: string;
  extractedSkills: string[];
  email?: string;
  phone?: string;
}

interface AnalysisRequest {
  cvs: CVData[];
  jobDescription: string;
  jobTitle: string;
  roleCategory: string;
  maxResults?: number;
}

interface CandidateResult {
  name: string;
  score: number;
  starBullets: string[];
  skillsMatch: number;
  strengths: string[];
  gaps: string[];
  experience: string;
  email?: string;
  phone?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvs, jobDescription, jobTitle, roleCategory, maxResults = 5 }: AnalysisRequest = await req.json();

    // Validate input
    if (!cvs || !Array.isArray(cvs) || cvs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No CVs provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription || jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description too short" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${cvs.length} pre-filtered CVs for: ${jobTitle}`);

    // Build CV summaries for AI analysis
    const cvSummaries = cvs.map((cv, idx) => 
      `--- CV ${idx + 1}: ${cv.extractedName} (${cv.name}) ---
Experiencia detectada: ${cv.extractedExperience}
Skills detectados: ${cv.extractedSkills.join(', ') || 'No detectados'}
Score preliminar: ${cv.preliminaryScore}%
Contenido (extracto):
${cv.content.slice(0, 2500)}
---`
    ).join('\n\n');

    const systemPrompt = `Eres un experto reclutador senior de LATAM analizando CVs para un puesto.

Tu trabajo es:
1. Analizar cada CV contra el job description
2. Evaluar experiencia, skills y fit cultural
3. Identificar 2-3 logros STAR (Situation-Task-Action-Result) por candidato
4. Dar un score final de 0-100 basado en compatibilidad real
5. Generar un comentario general sobre la calidad del pool de candidatos

Responde ÚNICAMENTE con JSON válido. Sin markdown, sin texto adicional, solo JSON.`;

    const userPrompt = `PUESTO: ${jobTitle}
CATEGORÍA: ${roleCategory}

JOB DESCRIPTION:
${jobDescription.slice(0, 2500)}

CVS PRE-FILTRADOS (Top ${cvs.length} por score preliminar):
${cvSummaries}

Analiza cada CV y devuelve este JSON exacto:
{
  "candidates": [
    {
      "filename": "nombre_archivo.pdf",
      "name": "Nombre Completo",
      "score": 85,
      "starBullets": [
        "Logro STAR 1: Aumentó ventas 40% liderando equipo de 5 personas",
        "Logro STAR 2: Implementó sistema CRM reduciendo tiempo de respuesta en 60%"
      ],
      "skillsMatch": 80,
      "strengths": ["React", "Node.js", "Liderazgo"],
      "gaps": ["AWS", "Docker"],
      "experience": "5 años en desarrollo full-stack"
    }
  ],
  "poolQualityComment": "El pool muestra candidatos con sólida experiencia en desarrollo. 3 de 5 tienen las skills principales requeridas. Se recomienda entrevistar a los top 3 primero."
}`;

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error("Rate limited");
          return new Response(
            JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          console.error("Payment required");
          return new Response(
            JSON.stringify({ error: "Créditos de IA agotados." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error(`AI error: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ error: "Error del servicio de IA" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      console.log("AI response received, parsing...");
      
      // Parse JSON from response
      let parsed;
      try {
        // Try to extract JSON from potential markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                         content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        parsed = JSON.parse(jsonStr.trim());
      } catch (e) {
        console.error("Failed to parse AI response:", content.slice(0, 500));
        return new Response(
          JSON.stringify({ error: "Error al procesar respuesta de IA" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build final results with contact info from original CVs
      const topCandidates: CandidateResult[] = [];
      
      if (parsed.candidates && Array.isArray(parsed.candidates)) {
        for (const candidate of parsed.candidates) {
          // Find matching original CV for contact info
          const originalCV = cvs.find(cv => 
            cv.name.toLowerCase().includes(candidate.filename?.toLowerCase()?.replace('.pdf', '') || '') ||
            cv.extractedName.toLowerCase() === candidate.name?.toLowerCase()
          );
          
          topCandidates.push({
            name: candidate.name || "Candidato",
            score: Math.min(100, Math.max(0, candidate.score || 50)),
            starBullets: Array.isArray(candidate.starBullets) 
              ? candidate.starBullets.slice(0, 3) 
              : ["Sin logros STAR identificados"],
            skillsMatch: Math.min(100, Math.max(0, candidate.skillsMatch || 50)),
            strengths: Array.isArray(candidate.strengths) ? candidate.strengths.slice(0, 5) : [],
            gaps: Array.isArray(candidate.gaps) ? candidate.gaps.slice(0, 3) : [],
            experience: candidate.experience || "Experiencia no especificada",
            email: originalCV?.email || undefined,
            phone: originalCV?.phone || undefined,
          });
        }
      }

      // Sort by score and limit
      const finalCandidates = topCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

      console.log(`Returning ${finalCandidates.length} candidates`);

      return new Response(
        JSON.stringify({
          success: true,
          totalAnalyzed: cvs.length,
          topCandidates: finalCandidates,
          poolQualityComment: parsed.poolQualityComment || 
            "Pool de candidatos analizado con éxito. Se recomienda revisar los perfiles destacados."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      return new Response(
        JSON.stringify({ error: "Error al procesar con IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in analyze-cvs:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
