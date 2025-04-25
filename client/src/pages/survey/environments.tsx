import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Survey, Environment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentDialog } from "@/components/survey/environment-dialog";

import { Button } from "@/components/ui/button";
import { ArrowLeft, DoorOpen, Plus, ArrowRight, Check, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";

// Lista de ambientes padrão
const DEFAULT_ENVIRONMENTS = [
  "Sala de Autoatendimento",
  "Área de Espera (Caixas)",
  "Bateria de Caixas",
  "Atendimento (Posto Personalizado)",
  "Atendimento Reativo",
  "Área de Espera (Atendimento)",
  "Apoio Administrativo | Suporte",
  "Almoxarifado",
  "Sala Online",
  "Casa de Máquinas do Ar Condicionado",
  "Sala de Múltiplo Uso",
  "Espaço QVT (Qualidade de Vida no Trabalho)",
  "Sanitário para pessoa com deficiência",
  "SAO | Sala de Apoio Operacional",
  "Tesouraria",
  "Copa",
  "Sanitários Feminino e Masculino (área total)",
  "Depósito para Material de Limpeza (DML)"
];

export default function Environments() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const environmentsContainerRef = useRef<HTMLDivElement>(null);
  
  const surveyId = parseInt(id || "0");
  
  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${surveyId}`],
    enabled: !isNaN(surveyId) && surveyId > 0,
  });
  
  const { data: environments, isLoading: environmentsLoading } = useQuery<Environment[]>({
    queryKey: [`/api/surveys/${surveyId}/environments`],
    enabled: !isNaN(surveyId) && surveyId > 0,
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
      
      // Scroll to bottom to show the newly added environment
      if (environmentsContainerRef.current) {
        setTimeout(() => {
          environmentsContainerRef.current?.scrollTo({
            top: environmentsContainerRef.current.scrollHeight,
            behavior: "smooth"
          });
        }, 100);
      }
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
    setLocation(`/surveys`);
  };
  
  const navigateToCapture = (environmentId: number) => {
    setLocation(`/environments/${environmentId}/capture`);
  };
  
  const isLoading = surveyLoading || environmentsLoading;
  
  // Filtra os ambientes padrão baseado na pesquisa
  const filteredDefaultEnvironments = DEFAULT_ENVIRONMENTS.filter(env => 
    env.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Checa se um ambiente já está na lista de ambientes do usuário
  const isEnvironmentAdded = (name: string) => {
    return environments?.some(env => env.name.toLowerCase() === name.toLowerCase());
  };
  
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
      
      {/* Search Input */}
      <div className="px-6 mb-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar ambientes..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Default Environments */}
      <div className="px-6 pb-3">
        <div className="max-w-md mx-auto">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Ambientes padrão</h2>
          <div className="max-h-[200px] overflow-y-auto bg-white rounded-xl shadow-sm p-2">
            {filteredDefaultEnvironments.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {filteredDefaultEnvironments.map((env, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg hover:bg-gray-50 flex justify-between items-center cursor-pointer
                      ${isEnvironmentAdded(env) ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!isEnvironmentAdded(env) && !createEnvironmentMutation.isPending) {
                        handleAddEnvironment(env);
                      } else if (isEnvironmentAdded(env)) {
                        toast({
                          title: "Ambiente já adicionado",
                          description: `"${env}" já está na sua lista de ambientes`,
                        });
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <DoorOpen className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">{env}</span>
                    </div>
                    {isEnvironmentAdded(env) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                Nenhum ambiente encontrado com "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Environments List */}
      <div className="px-6 pb-3">
        <div className="max-w-md mx-auto">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Seus ambientes</h2>
          <div 
            ref={environmentsContainerRef}
            className="max-h-[300px] overflow-y-auto"
          >
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div>
                {environments && environments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {environments.map((env) => (
                      <div 
                        key={env.id}
                        className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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
                  <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                      <DoorOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-800">Nenhum ambiente selecionado</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecione ambientes acima ou adicione um novo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Add Custom Environment Button */}
          <Button 
            variant="outline"
            className="w-full py-5 mt-4 bg-white shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Ambiente Personalizado
          </Button>
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