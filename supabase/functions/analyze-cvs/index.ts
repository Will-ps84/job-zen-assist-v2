import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CVData {
  name: string;
  content: string;
}

interface AnalysisRequest {
  cvs: CVData[];
  jobDescription: string;
  maxResults?: number;
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvs, jobDescription, maxResults = 5 }: AnalysisRequest = await req.json();

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

    console.log(`Analyzing ${cvs.length} CVs against job description...`);

    // Process CVs in batches for efficiency
    const batchSize = 10;
    const allResults: CandidateResult[] = [];

    for (let i = 0; i < cvs.length; i += batchSize) {
      const batch = cvs.slice(i, i + batchSize);
      
      const cvsText = batch.map((cv, idx) => 
        `--- CV ${i + idx + 1}: ${cv.name} ---\n${cv.content.slice(0, 3000)}\n`
      ).join("\n");

      const systemPrompt = `Eres un experto reclutador de HR analizando CVs para un puesto.
Tu trabajo es:
1. Extraer el nombre completo del candidato de cada CV
2. Identificar logros usando metodología STAR (Situation-Task-Action-Result)
3. Evaluar compatibilidad con el job description
4. Dar un score de 0-100 basado en fit

Responde SOLO con JSON válido, sin markdown ni texto adicional.`;

      const userPrompt = `JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

CVS A ANALIZAR:
${cvsText}

Para cada CV, extrae y devuelve un JSON array con objetos:
{
  "candidates": [
    {
      "filename": "nombre_archivo.pdf",
      "name": "Nombre Completo del Candidato",
      "score": 85,
      "starSummary": "Logro STAR más relevante en 1 oración",
      "skillsMatch": 80,
      "strengths": ["skill1", "skill2", "skill3"],
      "gaps": ["gap1"],
      "experience": "X años en Y industria"
    }
  ]
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
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.error("Rate limited, waiting...");
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          console.error(`AI error: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        // Parse JSON from response
        let parsed;
        try {
          // Try to extract JSON from potential markdown code blocks
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                           content.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
          parsed = JSON.parse(jsonStr.trim());
        } catch (e) {
          console.error("Failed to parse AI response:", content.slice(0, 200));
          continue;
        }

        if (parsed.candidates && Array.isArray(parsed.candidates)) {
          for (const candidate of parsed.candidates) {
            allResults.push({
              name: candidate.name || "Candidato Desconocido",
              score: Math.min(100, Math.max(0, candidate.score || 50)),
              starSummary: candidate.starSummary || "Sin logros STAR identificados",
              skillsMatch: Math.min(100, Math.max(0, candidate.skillsMatch || 50)),
              strengths: Array.isArray(candidate.strengths) ? candidate.strengths.slice(0, 5) : [],
              gaps: Array.isArray(candidate.gaps) ? candidate.gaps.slice(0, 3) : [],
              experience: candidate.experience || "Experiencia no especificada",
            });
          }
        }
      } catch (batchError) {
        console.error("Batch processing error:", batchError);
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < cvs.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Sort by score and take top N
    const topCandidates = allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    console.log(`Returning top ${topCandidates.length} candidates`);

    return new Response(
      JSON.stringify({
        success: true,
        totalAnalyzed: cvs.length,
        topCandidates,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-cvs:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
