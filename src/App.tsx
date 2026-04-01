import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/Layout";
import JarvisChat from "./pages/JarvisChat";
import Business from "./pages/Business";
import { ContentStudio } from "./pages/ContentStudio";
import Content from "./pages/Content";
import Career from "./pages/Career";
import Life from "./pages/Life";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<JarvisChat />} />
            <Route path="/voxov" element={<Business />} />
            <Route path="/content-studio" element={<ImageStudio />} />
            <Route path="/content" element={<Content />} />
            <Route path="/career" element={<Career />} />
            <Route path="/home" element={<Life />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
