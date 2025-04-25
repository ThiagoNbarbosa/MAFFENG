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
import { Logo } from "@/components/ui/logo";

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
    setLocation(`/`);
  };
  
  const navigateToCapture = (environmentId: number) => {
    setLocation(`/environments/${environmentId}/capture`);
  };
  
  const isLoading = surveyLoading || environmentsLoading;
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={navigateBack} className="rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" />
        <div className="w-10"></div> {/* Spacer to balance the header */}
      </header>
      
      {/* Title */}
      <div className="pt-2 pb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Ambientes</h1>
        {!isLoading && survey && (
          <p className="text-muted-foreground mt-1">
            Agência: {survey.agencyName} | Prefixo: {survey.prefix}
          </p>
        )}
      </div>
      
      {/* Environment List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div>
              {environments && environments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {environments.map((env) => (
                    <div 
                      key={env.id}
                      className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigateToCapture(env.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <DoorOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{env.name}</h3>
                            <p className="text-xs text-gray-500">Clique para adicionar fotos</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <DoorOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Nenhum ambiente cadastrado</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-6">
                    Adicione ambientes para iniciar o levantamento fotográfico
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline"
                className="w-full py-6 mt-6 bg-white shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" /> Adicionar Ambiente
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
    </div>
  );
}
