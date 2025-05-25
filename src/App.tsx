import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Institutions from "./pages/Institutions";
import Families from "./pages/Families";
import Reports from "./pages/Reports";
import DeliveryManagement from "./pages/DeliveryManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente de transição de página
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  return (
    <div 
      className={`transition-opacity duration-300 ease-in-out ${transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"}`}
      onTransitionEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

// Componente para envolver as rotas
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/families" element={<Families />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/delivery" element={<DeliveryManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AnimatedRoutes />
            </TooltipProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
