import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, Plus, LogOut, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: surveys, isLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigateToNewSurvey = () => {
    setLocation("/surveys/new");
  };
  
  const navigateToSurvey = (id: number) => {
    setLocation(`/surveys/${id}/environments`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-secondary">Início</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-secondary">
              Bem-vindo(a), {user?.username}
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie seus levantamentos de agências bancárias
            </p>
          </div>
          
          {/* Card: Meus Levantamentos */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Meus Levantamentos</h2>
                <Folder className="h-6 w-6 text-primary" />
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : surveys && surveys.length > 0 ? (
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <div 
                      key={survey.id}
                      onClick={() => navigateToSurvey(survey.id)}
                      className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-medium text-secondary">{survey.agencyName}</h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Prefixo: {survey.prefix}</span>
                        <span>
                          {format(new Date(survey.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Você ainda não possui levantamentos</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Card: Novo Levantamento */}
          <Card 
            className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={navigateToNewSurvey}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Novo Levantamento</h2>
                  <p className="text-sm text-muted-foreground">Iniciar um novo levantamento</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
