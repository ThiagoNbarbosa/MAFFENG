import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Environment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function PhotoReview() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  
  const environmentId = parseInt(id);
  
  const { data: environment, isLoading } = useQuery<Environment>({
    queryKey: [`/api/environments/${environmentId}`],
    enabled: !isNaN(environmentId),
  });
  
  // Load photo from session storage when component mounts
  useEffect(() => {
    const savedPhoto = sessionStorage.getItem('capturedPhoto');
    if (savedPhoto) {
      setPhotoData(savedPhoto);
    } else {
      toast({
        title: "Foto não encontrada",
        description: "Não foi possível recuperar a foto capturada",
        variant: "destructive",
      });
      navigateToCapture();
    }
  }, []);
  
  const savePhotoMutation = useMutation({
    mutationFn: async () => {
      if (!photoData) throw new Error("No photo data");
      
      const res = await apiRequest("POST", "/api/photos", {
        environmentId,
        imageData: photoData,
        observation,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto salva",
        description: "A foto foi salva com sucesso",
      });
      
      // Clear stored photo
      sessionStorage.removeItem('capturedPhoto');
      
      // Navigate back to environments
      const surveyId = environment?.surveyId;
      if (surveyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/surveys/${surveyId}/environments`] });
        setLocation(`/surveys/${surveyId}/environments`);
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar foto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const navigateToCapture = () => {
    setLocation(`/environments/${environmentId}/capture`);
  };
  
  const savePhoto = () => {
    savePhotoMutation.mutate();
  };
  
  const navigateBack = () => {
    navigateToCapture();
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={navigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-secondary truncate max-w-[200px]">
            {isLoading ? "Carregando..." : environment?.name || "Ambiente"}
          </h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </header>
      
      {/* Photo Preview */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {/* Photo */}
          <div className="aspect-[3/4] w-full bg-gray-200 rounded-lg overflow-hidden">
            {photoData ? (
              <img 
                src={photoData} 
                alt="Foto capturada" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Carregando foto...</p>
              </div>
            )}
          </div>
          
          {/* Observations */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-secondary mb-2">
              Observações
            </label>
            <Textarea 
              id="observations" 
              placeholder="Adicione observações sobre esta foto"
              className="h-24"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Footer with Buttons */}
      <div className="p-6 bg-white shadow-inner">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Button 
            variant="outline"
            className="py-6"
            onClick={navigateToCapture}
          >
            Tirar Novamente
          </Button>
          <Button 
            className="py-6"
            onClick={savePhoto}
            disabled={!photoData || savePhotoMutation.isPending}
          >
            {savePhotoMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
