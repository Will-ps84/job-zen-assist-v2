import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Precios from "./pages/Precios";
import Dashboard from "./pages/app/Dashboard";
import Onboarding from "./pages/app/Onboarding";
import CVEditor from "./pages/app/CVEditor";
import Vacantes from "./pages/app/Vacantes";
import Postulaciones from "./pages/app/Postulaciones";
import Analitica from "./pages/app/Analitica";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/precios" element={<Precios />} />
          
          {/* App routes */}
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/onboarding" element={<Onboarding />} />
          <Route path="/app/cv" element={<CVEditor />} />
          <Route path="/app/vacantes" element={<Vacantes />} />
          <Route path="/app/postulaciones" element={<Postulaciones />} />
          <Route path="/app/analitica" element={<Analitica />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
