import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Eager load - landing page (critical path)
import Index from "./pages/Index";

// Lazy load - auth pages
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const Precios = lazy(() => import("./pages/Precios"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load - app pages (heavy)
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Onboarding = lazy(() => import("./pages/app/Onboarding"));
const CVEditor = lazy(() => import("./pages/app/CVEditor"));
const Vacantes = lazy(() => import("./pages/app/Vacantes"));
const Postulaciones = lazy(() => import("./pages/app/Postulaciones"));
const Analitica = lazy(() => import("./pages/app/Analitica"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/precios" element={<Precios />} />
              
              {/* App routes (protected) */}
              <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/app/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/app/cv" element={<ProtectedRoute><CVEditor /></ProtectedRoute>} />
              <Route path="/app/vacantes" element={<ProtectedRoute><Vacantes /></ProtectedRoute>} />
              <Route path="/app/postulaciones" element={<ProtectedRoute><Postulaciones /></ProtectedRoute>} />
              <Route path="/app/analitica" element={<ProtectedRoute><Analitica /></ProtectedRoute>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
