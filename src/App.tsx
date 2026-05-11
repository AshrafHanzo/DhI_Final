import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DigitalPublishing from "./pages/DigitalPublishing";
import PremediaServices from "./pages/PremediaServices";
import Illustrations from "./pages/Illustrations";
import LandingPage from "./pages/LandingPage";
import LandingPage2 from "./pages/LandingPage2";
import LandingPage3 from "./pages/LandingPage3";
import LandingPage4 from "./pages/LandingPage4";
import LandingPage5 from "./pages/LandingPage5";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/digital-publishing" element={<DigitalPublishing />} />
          <Route path="/premedia-services" element={<PremediaServices />} />
          <Route path="/illustrations" element={<Illustrations />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/landingpage2" element={<LandingPage2 />} />
          <Route path="/landingpage3" element={<LandingPage3 />} />
          <Route path="/landingpage4" element={<LandingPage4 />} />
          <Route path="/landingpage5" element={<LandingPage5 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
