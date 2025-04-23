import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Environment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "@/lib/camera";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera as CameraIcon } from "lucide-react";

export default function Capture() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const environmentId = parseInt(id);
  
  const { data: environment, isLoading } = useQuery<Environment>({
    queryKey: [`/api/environments/${environmentId}`],
    enabled: !isNaN(environmentId),
  });
  
  // Initialize camera when component mounts
  useEffect(() => {
    if (videoRef.current && !camera) {
      const newCamera = new Camera({
        element: videoRef.current,
        facingMode: "environment",
      });
      setCamera(newCamera);
      
      // Start camera
      newCamera.start().then((success) => {
        if (success) {
          setCameraActive(true);
        } else {
          toast({
            title: "Erro na câmera",
            description: "Não foi possível acessar a câmera do dispositivo",
            variant: "destructive",
          });
        }
      });
    }
    
    // Clean up camera on unmount
    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [videoRef, toast]);
  
  const capturePhoto = () => {
    if (!camera) return;
    
    try {
      const photoData = camera.capturePhoto();
      // Save photo data to state/context or pass it to the next screen
      if (photoData) {
        // Save captured photo in session storage to avoid passing large data in URL
        sessionStorage.setItem('capturedPhoto', photoData);
        setLocation(`/environments/${environmentId}/review`);
      } else {
        toast({
          title: "Erro ao capturar foto",
          description: "Não foi possível capturar a foto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao capturar foto",
        description: "Ocorreu um erro ao processar a imagem",
        variant: "destructive",
      });
    }
  };
  
  const navigateBack = () => {
    const surveyId = environment?.surveyId;
    setLocation(surveyId ? `/surveys/${surveyId}/environments` : '/');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black">
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
      
      {/* Camera View */}
      <div className="flex-1 bg-black flex flex-col">
        <div className="relative w-full h-full">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="flex flex-col items-center">
                <CameraIcon size={48} className="mb-2" />
                <p>Iniciando câmera...</p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-10 inset-x-0 flex items-center justify-center">
            <button 
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-gray-400 focus:outline-none"
              onClick={capturePhoto}
              disabled={!cameraActive}
            >
              <div className="w-16 h-16 rounded-full border-2 border-gray-500"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
