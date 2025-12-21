import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - production and development
const ALLOWED_ORIGINS = [
  "https://olzwgallpissgwwvmqhe.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Input validation limits
const MAX_CVS_COUNT = 50;
const MAX_CV_CONTENT_SIZE = 50000; // 50KB per CV content
const MAX_JOB_DESC_LENGTH = 10000; // 10KB max for job description
const MAX_BODY_SIZE = 5000000; // 5MB max total body size
const MAX_RESULTS_LIMIT = 20;

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per user per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limiting store (per user_id)
const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry) {
    rateLimitStore.set(userId, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  const elapsed = now - entry.firstRequest;
  
  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: RATE_LIMIT_WINDOW_MS - elapsed };
  }

  entry.count++;
  rateLimitStore.set(userId, entry);
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, 
    resetIn: RATE_LIMIT_WINDOW_MS - elapsed 
  };
}

// Clean up old entries periodically
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [userId, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(userId);
    }
  }
}

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

function validateString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  return value.slice(0, maxLength);
}

function validateCVData(cv: unknown): CVData | null {
  if (!cv || typeof cv !== "object") return null;
  
  const cvObj = cv as Record<string, unknown>;
  
  const name = validateString(cvObj.name, 255);
  const content = validateString(cvObj.content, MAX_CV_CONTENT_SIZE);
  const extractedName = validateString(cvObj.extractedName, 255);
  const extractedExperience = validateString(cvObj.extractedExperience, 1000);
  
  if (!name || !content) return null;
  
  const preliminaryScore = typeof cvObj.preliminaryScore === "number" 
    ? Math.min(100, Math.max(0, cvObj.preliminaryScore)) 
    : 0;
  
  const extractedSkills = Array.isArray(cvObj.extractedSkills)
    ? (cvObj.extractedSkills as unknown[]).filter((s: unknown): s is string => typeof s === "string").slice(0, 50)
    : [];
  
  const email = validateString(cvObj.email, 255) || undefined;
  const phone = validateString(cvObj.phone, 50) || undefined;
  
  return {
    name,
    content,
    preliminaryScore,
    extractedName: extractedName || "Candidato",
    extractedExperience: extractedExperience || "",
    extractedSkills,
    email,
    phone,
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Server-side origin validation (not just CORS headers)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Clean up old rate limit entries
  cleanupRateLimitStore();

  try {
    // Validate Content-Length header
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "Payload demasiado grande. Máximo 5MB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user ID from auth header for rate limiting
    const authHeader = req.headers.get("authorization");
    let userId = "anonymous";
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      } catch (e) {
        console.warn("Failed to get user from auth header:", e);
      }
    }

    // Check rate limit by user ID
    const rateLimit = checkRateLimit(userId);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
    };

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: "Demasiadas solicitudes. Intenta más tarde.",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders,
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString()
          } 
        }
      );
    }

    // Parse and validate body
    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "Payload demasiado grande. Máximo 5MB." }),
        { status: 413, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: AnalysisRequest;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return new Response(
        JSON.stringify({ error: "JSON inválido" }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    const { cvs, jobDescription, jobTitle, roleCategory, maxResults } = body;

    // Validate CVs array
    if (!cvs || !Array.isArray(cvs)) {
      return new Response(
        JSON.stringify({ error: "No CVs provided" }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    if (cvs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No CVs provided" }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    if (cvs.length > MAX_CVS_COUNT) {
      return new Response(
        JSON.stringify({ error: `Demasiados CVs. Máximo ${MAX_CVS_COUNT}.` }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize each CV
    const validatedCVs: CVData[] = [];
    for (const cv of cvs) {
      const validated = validateCVData(cv);
      if (validated) {
        validatedCVs.push(validated);
      }
    }

    if (validatedCVs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se encontraron CVs válidos" }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate job description
    if (!jobDescription || typeof jobDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "Job description requerida" }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    if (jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Descripción muy corta. Mínimo 50 caracteres." }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Descripción muy larga. Máximo ${MAX_JOB_DESC_LENGTH.toLocaleString()} caracteres.` }),
        { status: 400, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize other fields
    const sanitizedJobTitle = validateString(jobTitle, 255) || "Puesto";
    const sanitizedRoleCategory = validateString(roleCategory, 100) || "General";
    const sanitizedMaxResults = typeof maxResults === "number" 
      ? Math.min(MAX_RESULTS_LIMIT, Math.max(1, maxResults)) 
      : 5;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${validatedCVs.length} pre-filtered CVs for: ${sanitizedJobTitle} (user: ${userId})`);

    // Build CV summaries for AI analysis (truncated for safety)
    const cvSummaries = validatedCVs.map((cv, idx) => 
      `--- CV ${idx + 1}: ${cv.extractedName} (${cv.name}) ---
Experiencia detectada: ${cv.extractedExperience.slice(0, 500)}
Skills detectados: ${cv.extractedSkills.slice(0, 20).join(', ') || 'No detectados'}
Score preliminar: ${cv.preliminaryScore}%
Contenido (extracto):
${cv.content.slice(0, 2000)}
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

    const userPrompt = `PUESTO: ${sanitizedJobTitle}
CATEGORÍA: ${sanitizedRoleCategory}

JOB DESCRIPTION:
${jobDescription.slice(0, 2500)}

CVS PRE-FILTRADOS (Top ${validatedCVs.length} por score preliminar):
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
          console.error("Rate limited by AI gateway");
          return new Response(
            JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }),
            { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          console.error("Payment required");
          return new Response(
            JSON.stringify({ error: "Créditos de IA agotados." }),
            { status: 402, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error(`AI error: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ error: "Error del servicio de IA" }),
          { status: 500, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
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
          { status: 500, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build final results with contact info from original CVs
      const topCandidates: CandidateResult[] = [];
      
      if (parsed.candidates && Array.isArray(parsed.candidates)) {
        for (const candidate of parsed.candidates) {
          // Find matching original CV for contact info
          const originalCV = validatedCVs.find(cv => 
            cv.name.toLowerCase().includes(candidate.filename?.toLowerCase()?.replace('.pdf', '') || '') ||
            cv.extractedName.toLowerCase() === candidate.name?.toLowerCase()
          );
          
          topCandidates.push({
            name: validateString(candidate.name, 255) || "Candidato",
            score: Math.min(100, Math.max(0, typeof candidate.score === "number" ? candidate.score : 50)),
            starBullets: Array.isArray(candidate.starBullets) 
              ? (candidate.starBullets as unknown[]).filter((s: unknown): s is string => typeof s === "string").slice(0, 3)
              : ["Sin logros STAR identificados"],
            skillsMatch: Math.min(100, Math.max(0, typeof candidate.skillsMatch === "number" ? candidate.skillsMatch : 50)),
            strengths: Array.isArray(candidate.strengths) 
              ? (candidate.strengths as unknown[]).filter((s: unknown): s is string => typeof s === "string").slice(0, 5) 
              : [],
            gaps: Array.isArray(candidate.gaps) 
              ? (candidate.gaps as unknown[]).filter((s: unknown): s is string => typeof s === "string").slice(0, 3) 
              : [],
            experience: validateString(candidate.experience, 500) || "Experiencia no especificada",
            email: originalCV?.email || undefined,
            phone: originalCV?.phone || undefined,
          });
        }
      }

      // Sort by score and limit
      const finalCandidates = topCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, sanitizedMaxResults);

      console.log(`Returning ${finalCandidates.length} candidates`);

      return new Response(
        JSON.stringify({
          success: true,
          totalAnalyzed: validatedCVs.length,
          topCandidates: finalCandidates,
          poolQualityComment: validateString(parsed.poolQualityComment, 500) || 
            "Pool de candidatos analizado con éxito. Se recomienda revisar los perfiles destacados."
        }),
        { headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      return new Response(
        JSON.stringify({ error: "Error al procesar con IA" }),
        { status: 500, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in analyze-cvs:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar solicitud" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
