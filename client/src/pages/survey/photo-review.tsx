import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Environment, photoTypeEnum } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Wrench, Info, Ruler, Calculator } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/ui/logo";

// Tipos de fotos correspondentes ao enum no banco de dados
type PhotoType = typeof photoTypeEnum.enumValues[number];

// Configurações para os tipos de fotos
const photoTypeConfig = {
  'vista_ampla': {
    title: 'Vista Ampla',
    icon: Eye,
    description: 'Captura uma visão geral do ambiente para contextualização',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  'servicos_itens': {
    title: 'Serviços/Itens',
    icon: Wrench,
    description: 'Registre equipamentos, estruturas e instalações',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  'detalhes': {
    title: 'Detalhes',
    icon: Info,
    description: 'Capture detalhes específicos, problemas ou pontos de atenção',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  }
};

export default function PhotoReview() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType | null>(null);
  const [observation, setObservation] = useState("");
  const [selectedServiceItem, setSelectedServiceItem] = useState<string | null>(null);
  const [paintingWidth, setPaintingWidth] = useState<string | null>(null);
  const [paintingHeight, setPaintingHeight] = useState<string | null>(null);
  const [paintingArea, setPaintingArea] = useState<string | null>(null);
  
  const environmentId = parseInt(id || "0");
  
  const { data: environment, isLoading } = useQuery<Environment>({
    queryKey: [`/api/environments/${environmentId}`],
    enabled: !isNaN(environmentId) && environmentId > 0,
  });
  
  // Load photo from session storage when component mounts
  useEffect(() => {
    const savedPhoto = sessionStorage.getItem('capturedPhoto');
    const savedPhotoType = sessionStorage.getItem('photoType') as PhotoType | null;
    const savedServiceItem = sessionStorage.getItem('selectedServiceItem');
    const savedWidth = sessionStorage.getItem('paintingWidth');
    const savedHeight = sessionStorage.getItem('paintingHeight');
    const savedArea = sessionStorage.getItem('paintingArea');
    
    if (savedPhoto && savedPhotoType && Object.keys(photoTypeConfig).includes(savedPhotoType)) {
      setPhotoData(savedPhoto);
      setPhotoType(savedPhotoType);
      
      if (savedPhotoType === 'servicos_itens' && savedServiceItem) {
        setSelectedServiceItem(savedServiceItem);
        
        // Se for um item de pintura, carregar as dimensões
        if (savedServiceItem.toLowerCase().includes('pintura') && savedWidth && savedHeight && savedArea) {
          setPaintingWidth(savedWidth);
          setPaintingHeight(savedHeight);
          setPaintingArea(savedArea);
        }
      }
    } else {
      toast({
        title: "Dados não encontrados",
        description: "Não foi possível recuperar a foto capturada ou seu tipo",
        variant: "destructive",
      });
      navigateToCapture();
    }
  }, []);
  
  const savePhotoMutation = useMutation({
    mutationFn: async () => {
      if (!photoData || !photoType) throw new Error("Dados da foto incompletos");
      
      const res = await apiRequest("POST", "/api/photos", {
        environmentId,
        imageData: photoData,
        observation,
        photoType
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto salva",
        description: "A foto foi salva com sucesso",
      });
      
      // Clear stored photo data
      sessionStorage.removeItem('capturedPhoto');
      sessionStorage.removeItem('photoType');
      sessionStorage.removeItem('selectedServiceItem');
      sessionStorage.removeItem('paintingWidth');
      sessionStorage.removeItem('paintingHeight');
      sessionStorage.removeItem('paintingArea');
      
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
  
  if (!photoType || !photoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-4">
        <Logo size="md" />
        <p className="mt-4 text-gray-500">Carregando...</p>
      </div>
    );
  }
  
  // Obtenha a configuração do tipo de foto selecionado
  const selectedPhotoConfig = photoTypeConfig[photoType];
  const TypeIcon = selectedPhotoConfig.icon;
  
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
        <h1 className="text-2xl font-bold text-gray-800">Revisar Foto</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? "Carregando..." : environment?.name}
        </p>
      </div>
      
      {/* Photo Preview */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Photo Type Badge */}
          <div className="flex justify-center mb-4">
            <div className={`${selectedPhotoConfig.bgColor} ${selectedPhotoConfig.color} px-4 py-2 rounded-full flex items-center shadow-md`}>
              <TypeIcon className="mr-2 h-4 w-4" />
              <span className="font-medium text-sm">{selectedPhotoConfig.title}</span>
            </div>
          </div>
          
          {/* Service Item Display (if applicable) */}
          {photoType === 'servicos_itens' && selectedServiceItem && (
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">{selectedServiceItem}</div>
            </div>
          )}
          
          {/* Painting Dimensions (if applicable) */}
          {photoType === 'servicos_itens' && selectedServiceItem && 
           selectedServiceItem.toLowerCase().includes('pintura') && 
           paintingWidth && paintingHeight && paintingArea && (
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm mb-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <Calculator className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">Dimensões da Pintura</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm ml-11">
                <div className="flex items-center">
                  <Ruler className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-gray-600">Largura:</span>
                  <span className="ml-1 font-medium">{paintingWidth} m</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-gray-600">Altura:</span>
                  <span className="ml-1 font-medium">{paintingHeight} m</span>
                </div>
                <div className="flex items-center font-semibold text-green-700">
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-gray-600">Área:</span>
                  <span className="ml-1 font-medium">{paintingArea} m²</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Photo */}
          <div className="aspect-[3/4] w-full bg-white rounded-xl overflow-hidden shadow-md">
            <img 
              src={photoData} 
              alt="Foto capturada" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Observations */}
          <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <Textarea 
              id="observations" 
              placeholder="Adicione observações sobre esta foto (opcional)"
              className="h-24 bg-gray-50 border-gray-200"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button 
              variant="outline"
              className="py-4 bg-white"
              onClick={navigateToCapture}
            >
              Tirar Novamente
            </Button>
            <Button 
              className="py-4"
              onClick={savePhoto}
              disabled={savePhotoMutation.isPending}
            >
              {savePhotoMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
