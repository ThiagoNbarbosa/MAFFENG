import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Survey, Environment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentDialog } from "@/components/survey/environment-dialog";

import { Button } from "@/components/ui/button";
import { ArrowLeft, DoorOpen, Plus, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Environments() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const surveyId = parseInt(id);
  
  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${surveyId}`],
    enabled: !isNaN(surveyId),
  });
  
  const { data: environments, isLoading: environmentsLoading } = useQuery<Environment[]>({
    queryKey: [`/api/surveys/${surveyId}/environments`],
    enabled: !isNaN(surveyId),
  });
  
  const createEnvironmentMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/environments", {
        surveyId,
        name,
      });
      return res.json() as Promise<Environment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/surveys/${surveyId}/environments`] });
      setDialogOpen(false);
      toast({
        title: "Ambiente adicionado",
        description: "O ambiente foi adicionado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar ambiente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddEnvironment = (name: string) => {
    createEnvironmentMutation.mutate(name);
  };
  
  const navigateBack = () => {
    setLocation(`/surveys/new`);
  };
  
  const navigateToCapture = (environmentId: number) => {
    setLocation(`/environments/${environmentId}/capture`);
  };
  
  const isLoading = surveyLoading || environmentsLoading;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={navigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-secondary">Seleção de Ambientes</h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </header>
      
      {/* Environment List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary">Ambientes</h2>
            {!isLoading && survey && (
              <p className="text-sm text-muted-foreground">
                Agência: {survey.agencyName}
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {environments && environments.length > 0 ? (
                environments.map((env) => (
                  <div 
                    key={env.id}
                    className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                    onClick={() => navigateToCapture(env.id)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <DoorOpen className="text-primary mr-3 h-5 w-5" />
                      <span>{env.name}</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum ambiente adicionado</p>
                  <p className="text-sm mt-1">
                    Adicione ambientes para iniciar o levantamento
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline"
                className="w-full py-6 mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Ambiente
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Environment Dialog */}
      <EnvironmentDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddEnvironment}
        isPending={createEnvironmentMutation.isPending}
      />
      
      {/* Footer with Button */}
      <div className="p-6 bg-white shadow-inner">
        <Button 
          className="w-full py-6"
          disabled={!environments || environments.length === 0}
          onClick={() => environments && environments.length > 0 && navigateToCapture(environments[0].id)}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
