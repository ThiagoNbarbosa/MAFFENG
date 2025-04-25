import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Environment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "@/lib/camera";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera as CameraIcon, Image as ImageIcon, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Capture() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  
  const environmentId = parseInt(id || "0");
  
  const { data: environment, isLoading } = useQuery<Environment>({
    queryKey: [`/api/environments/${environmentId}`],
    enabled: !isNaN(environmentId) && environmentId > 0,
  });
  
  // Initialize camera when component mounts and camera mode is selected
  useEffect(() => {
    if (captureMode === "camera" && videoRef.current && !camera) {
      const newCamera = new Camera({
        element: videoRef.current,
        facingMode: "environment",
        onError: (error) => {
          console.error("Camera error:", error);
          setCameraError(true);
          setCameraActive(false);
          toast({
            title: "Erro na câmera",
            description: "Não foi possível acessar a câmera do dispositivo. Tente usar o modo de upload.",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          setCameraError(false);
          setCameraActive(true);
        }
      });
      setCamera(newCamera);
      
      // Start camera
      newCamera.start().catch(error => {
        console.error("Failed to start camera:", error);
        setCameraError(true);
      });
    }
    
    // Clean up camera on unmount or when switching modes
    return () => {
      if (camera) {
        camera.stop();
        setCameraActive(false);
      }
    };
  }, [videoRef, captureMode, toast]);
  
  // Switch to upload mode if camera initialization fails
  useEffect(() => {
    if (cameraError && captureMode === "camera") {
      setCaptureMode("upload" as "camera" | "upload");
    }
  }, [cameraError, captureMode]);
  
  const capturePhoto = () => {
    if (!camera) return;
    
    try {
      const photoData = camera.capturePhoto();
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
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    try {
      setSelectedFile(file);
      const base64Data = await Camera.fileToBase64(file);
      setSelectedImagePreview(base64Data);
    } catch (error) {
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível processar a imagem selecionada",
        variant: "destructive",
      });
    }
  };
  
  const useSelectedImage = () => {
    if (!selectedImagePreview) return;
    
    sessionStorage.setItem('capturedPhoto', selectedImagePreview);
    setLocation(`/environments/${environmentId}/review`);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const restartCamera = () => {
    if (camera) {
      camera.stop();
      setCameraActive(false);
      setCameraError(false);
      
      // Start camera again after a brief delay
      setTimeout(() => {
        camera.start().then((success) => {
          setCameraActive(success);
          if (!success) {
            setCameraError(true);
          }
        }).catch(() => {
          setCameraError(true);
        });
      }, 500);
    }
  };
  
  const navigateBack = () => {
    const surveyId = environment?.surveyId;
    setLocation(surveyId ? `/surveys/${surveyId}/environments` : '/');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
      
      {/* Tabs for switching between camera and upload */}
      <Tabs value={captureMode} onValueChange={(value) => setCaptureMode(value as "camera" | "upload")} className="w-full">
        <div className="bg-white border-b">
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="camera" disabled={Camera.isSupported() === false}>
              <CameraIcon className="mr-2 h-4 w-4" />
              Câmera
            </TabsTrigger>
            <TabsTrigger value="upload">
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Camera Tab Content */}
        <TabsContent value="camera" className="flex-1 bg-black m-0 p-0 flex flex-col">
          <div className="relative w-full h-[calc(100vh-10rem)]">
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            
            {!cameraActive && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="flex flex-col items-center">
                  <CameraIcon size={48} className="mb-2" />
                  <p>Iniciando câmera...</p>
                </div>
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-80">
                <div className="flex flex-col items-center text-center px-4">
                  <CameraIcon size={48} className="mb-2 text-red-500" />
                  <p className="mb-4">Não foi possível acessar a câmera.</p>
                  <p className="mb-4 text-sm">Verifique se você concedeu permissão de câmera ao navegador.</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={restartCamera}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Tentar novamente
                    </Button>
                    <Button onClick={() => setCaptureMode("upload" as "camera" | "upload")}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Usar upload
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {cameraActive && (
              <div className="absolute bottom-10 inset-x-0 flex items-center justify-center">
                <button 
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-gray-400 focus:outline-none"
                  onClick={capturePhoto}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-gray-500"></div>
                </button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Upload Tab Content */}
        <TabsContent value="upload" className="flex-1 m-0 p-0 flex flex-col">
          <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-10rem)] bg-gray-100 p-6">
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {!selectedImagePreview ? (
              <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer" onClick={triggerFileInput}>
                <ImageIcon size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Selecionar imagem</h3>
                <p className="text-sm text-gray-500 text-center mb-4">Clique aqui para escolher uma imagem da sua galeria</p>
                <Button onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                  Escolher imagem
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="aspect-[3/4] w-full bg-white rounded-lg overflow-hidden shadow-md mb-4">
                  <img src={selectedImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex w-full gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => { setSelectedFile(null); setSelectedImagePreview(null); }}>
                    Escolher outra
                  </Button>
                  <Button className="flex-1" onClick={useSelectedImage}>
                    Usar esta imagem
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
