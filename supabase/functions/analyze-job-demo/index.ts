import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description too short" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Eres un experto en recursos humanos y análisis de vacantes para LATAM.
Tu tarea es analizar una descripción de vacante y generar un score de compatibilidad simulado.

IMPORTANTE: Este es un demo, así que genera resultados realistas pero variados.

Responde SOLO con JSON válido en este formato exacto:
{
  "score": <número entre 65 y 95>,
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "gaps": ["gap 1", "gap 2"],
  "recommendation": "Recomendación de 1-2 oraciones sobre qué hacer para mejorar el match"
}

Las fortalezas y gaps deben ser específicos a la vacante analizada.
El score debe ser realista basado en lo que pide la vacante.`;

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
          { role: "user", content: `Analiza esta vacante:\n\n${jobDescription}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio no disponible temporalmente." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const sanitizedResult = {
      score: Math.min(95, Math.max(50, Number(result.score) || 75)),
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : [],
      gaps: Array.isArray(result.gaps) ? result.gaps.slice(0, 3) : [],
      recommendation: result.recommendation || "Crea una cuenta para obtener un análisis personalizado completo.",
    };

    return new Response(JSON.stringify(sanitizedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-job-demo:", error);
    return new Response(
      JSON.stringify({ error: "Error al analizar. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
