import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - production and development
const ALLOWED_ORIGINS = [
  "https://olzwgallpissgwwvmqhe.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const MAX_JOB_DESC_LENGTH = 20000; // 20KB max for job description
const MAX_BODY_SIZE = 50000; // 50KB max total body size
const RATE_LIMIT_MAX_REQUESTS = 5; // Max requests per IP per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory rate limiting store (resets on function cold start, but provides basic protection)
const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  // Fallback to a default if no IP found
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  const elapsed = now - entry.firstRequest;
  
  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    // Window expired, reset
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    const resetIn = RATE_LIMIT_WINDOW_MS - elapsed;
    return { allowed: false, remaining: 0, resetIn };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(ip, entry);
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, 
    resetIn: RATE_LIMIT_WINDOW_MS - elapsed 
  };
}

// Clean up old entries periodically to prevent memory bloat
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Reject requests from non-allowed origins (server-side check, not just CORS)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Clean up old rate limit entries
  cleanupRateLimitStore();

  // Get client IP and check rate limit
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  // Add rate limit headers
  const rateLimitHeaders = {
    "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
  };

  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
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

  try {
    // Check Content-Length header first
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "Payload demasiado grande. Máximo 50KB." }),
        { status: 413, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }

    const bodyText = await req.text();
    
    // Validate actual body size
    if (bodyText.length > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "Payload demasiado grande. Máximo 50KB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return new Response(
        JSON.stringify({ error: "JSON inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { jobDescription } = body;

    // Validate jobDescription exists and is a string
    if (!jobDescription || typeof jobDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "Se requiere una descripción de vacante" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate minimum length
    if (jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Descripción muy corta. Mínimo 50 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate maximum length
    if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Descripción muy larga. Máximo ${MAX_JOB_DESC_LENGTH.toLocaleString()} caracteres.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
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
          { role: "user", content: `Analiza esta vacante:\n\n${jobDescription.slice(0, MAX_JOB_DESC_LENGTH)}` },
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
