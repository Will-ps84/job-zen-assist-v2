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
const STARWizard = lazy(() => import("./pages/app/STARWizard"));
const Vacantes = lazy(() => import("./pages/app/Vacantes"));
const Postulaciones = lazy(() => import("./pages/app/Postulaciones"));
const Analitica = lazy(() => import("./pages/app/Analitica"));
const Recursos = lazy(() => import("./pages/app/Recursos"));
const InterviewSimulator = lazy(() => import("./pages/app/InterviewSimulator"));
const ScreenerFlow = lazy(() => import("./pages/app/ScreenerFlow"));

// Lazy load - admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const BrandSettings = lazy(() => import("./pages/admin/BrandSettings"));
const AdminResources = lazy(() => import("./pages/admin/AdminResources"));
const AdminPortals = lazy(() => import("./pages/admin/AdminPortals"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminMetrics = lazy(() => import("./pages/admin/AdminMetrics"));
const BetaChecklist = lazy(() => import("./pages/admin/BetaChecklist"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
              <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/app/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/app/cv" element={<ProtectedRoute><CVEditor /></ProtectedRoute>} />
              <Route path="/app/star" element={<ProtectedRoute><STARWizard /></ProtectedRoute>} />
              <Route path="/app/vacantes" element={<ProtectedRoute><Vacantes /></ProtectedRoute>} />
              <Route path="/app/postulaciones" element={<ProtectedRoute><Postulaciones /></ProtectedRoute>} />
              <Route path="/app/entrevistas" element={<ProtectedRoute><InterviewSimulator /></ProtectedRoute>} />
              <Route path="/app/screener" element={<ProtectedRoute><ScreenerFlow /></ProtectedRoute>} />
              <Route path="/app/analitica" element={<ProtectedRoute><Analitica /></ProtectedRoute>} />
              <Route path="/app/recursos" element={<ProtectedRoute><Recursos /></ProtectedRoute>} />
              
              {/* Admin routes (protected + role checked in component) */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/brand" element={<ProtectedRoute><BrandSettings /></ProtectedRoute>} />
              <Route path="/admin/resources" element={<ProtectedRoute><AdminResources /></ProtectedRoute>} />
              <Route path="/admin/portals" element={<ProtectedRoute><AdminPortals /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/metrics" element={<ProtectedRoute><AdminMetrics /></ProtectedRoute>} />
              <Route path="/admin/beta-checklist" element={<ProtectedRoute><BetaChecklist /></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedback /></ProtectedRoute>} />
              
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
