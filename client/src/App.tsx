import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AccountPage from "@/pages/account-page";
import InitializeSurvey from "@/pages/survey/initialize-survey";
import Environments from "@/pages/survey/environments";
import Capture from "@/pages/survey/capture";
import PhotoReview from "@/pages/survey/photo-review";
import SurveysPage from "@/pages/surveys-page";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/account" component={AccountPage} />
      <ProtectedRoute path="/surveys" component={SurveysPage} />
      <ProtectedRoute path="/surveys/new" component={InitializeSurvey} />
      <ProtectedRoute path="/surveys/:id/environments" component={Environments} />
      <ProtectedRoute path="/environments/:id/capture" component={Capture} />
      <ProtectedRoute path="/environments/:id/review" component={PhotoReview} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
