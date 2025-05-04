export interface CameraOptions {
  element: HTMLVideoElement;
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export class Camera {
  private videoElement: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private facingMode: "user" | "environment";
  private width: number;
  private height: number;
  private onError?: (error: Error) => void;
  private onSuccess?: () => void;
  private hasPermission: boolean = false;
  private availableCameras: MediaDeviceInfo[] = [];

  constructor(options: CameraOptions) {
    this.videoElement = options.element;
    this.facingMode = options.facingMode || "environment";
    this.width = options.width || 1280;
    this.height = options.height || 720;
    this.onError = options.onError;
    this.onSuccess = options.onSuccess;
    
    // Enumerar câmeras disponíveis se o navegador suportar
    this.enumerateDevices();
  }
  
  /**
   * Enumera as câmeras disponíveis no dispositivo
   */
  private async enumerateDevices(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === "videoinput");
      console.log("Câmeras disponíveis:", this.availableCameras.length);
    } catch (error) {
      console.error("Erro ao enumerar dispositivos:", error);
    }
  }

  /**
   * Verifica se o navegador suporta acesso à câmera
   */
  public static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Inicia a câmera com configurações adicionais para melhorar a qualidade
   */
  public async start(): Promise<boolean> {
    try {
      if (this.stream) {
        this.stop();
      }

      // Verificar novamente as câmeras disponíveis
      await this.enumerateDevices();

      // Configurações avançadas para tentar melhorar a qualidade da imagem
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: this.width },
          height: { ideal: this.height },
          // Configurações adicionais para melhorar a qualidade
          frameRate: { ideal: 30 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };

      try {
        // Primeiro tenta com as configurações ideais
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (initialError) {
        console.warn("Não foi possível iniciar câmera com configurações ideais, tentando com configurações básicas", initialError);
        
        // Se falhar, tenta com configurações mais básicas
        const basicConstraints: MediaStreamConstraints = {
          video: true,
          audio: false
        };
        
        this.stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

      this.videoElement.srcObject = this.stream;
      this.hasPermission = true;
      
      // Aplicar configurações para melhorar a performance em dispositivos móveis
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('muted', 'true');
      
      if (this.onSuccess) {
        this.onSuccess();
      }
      
      return new Promise<boolean>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play()
            .then(() => {
              console.log("Câmera inicializada com sucesso!");
              resolve(true);
            })
            .catch((playError) => {
              console.error("Erro ao reproduzir vídeo:", playError);
              if (this.onError) {
                this.onError(playError instanceof Error ? playError : new Error(String(playError)));
              }
              resolve(false);
            });
        };
      });
    } catch (error) {
      console.error("Erro ao iniciar câmera:", error);
      this.hasPermission = false;
      
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      return false;
    }
  }

  /**
   * Para a câmera e libera os recursos
   */
  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Alterna entre as câmeras frontal e traseira
   */
  public toggleCamera(): Promise<boolean> {
    // Verifica se há mais de uma câmera disponível
    if (this.availableCameras.length > 1) {
      this.facingMode = this.facingMode === "user" ? "environment" : "user";
      console.log(`Alternando para câmera: ${this.facingMode}`);
      return this.start();
    } else {
      // Se só há uma câmera, tentar iniciar com essa mesma
      console.log("Apenas uma câmera disponível, não é possível alternar");
      return this.start();
    }
  }
  
  /**
   * Retorna a quantidade de câmeras disponíveis
   */
  public getCameraCount(): number {
    return this.availableCameras.length;
  }

  /**
   * Captura uma foto da câmera com melhorias de qualidade
   */
  public capturePhoto(): string {
    console.log("Iniciando captura de foto...");
    
    if (!this.videoElement) {
      console.error("Falha na captura: elemento de vídeo não inicializado");
      return "";
    }
    
    if (!this.hasPermission) {
      console.error("Falha na captura: sem permissão para a câmera");
      return "";
    }

    try {
      // Cria um canvas com as dimensões exatas do vídeo
      const canvas = document.createElement("canvas");
      const videoWidth = this.videoElement.videoWidth;
      const videoHeight = this.videoElement.videoHeight;
      
      console.log(`Dimensões originais do vídeo: ${videoWidth}x${videoHeight}`);
      
      // Garante que o canvas não seja muito grande para evitar problemas de memória
      // mas também não tão pequeno que comprometa a qualidade
      const maxDimension = 1280; // Reduzido para garantir melhor compatibilidade
      let targetWidth = videoWidth;
      let targetHeight = videoHeight;
      
      // Redimensiona se necessário, mantendo a proporção
      if (videoWidth > maxDimension || videoHeight > maxDimension) {
        if (videoWidth > videoHeight) {
          targetWidth = maxDimension;
          targetHeight = Math.floor(videoHeight * (maxDimension / videoWidth));
        } else {
          targetHeight = maxDimension;
          targetWidth = Math.floor(videoWidth * (maxDimension / videoHeight));
        }
        console.log(`Imagem redimensionada para: ${targetWidth}x${targetHeight}`);
      }
      
      // Define as dimensões do canvas
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!context) {
        console.error("Falha na captura: não foi possível obter o contexto 2D");
        return "";
      }
      
      // Aplica configurações de suavização para melhorar a qualidade
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      
      // Desenha a imagem no canvas
      context.drawImage(this.videoElement, 0, 0, targetWidth, targetHeight);
      console.log("Imagem desenhada no canvas");
      
      // Aplica melhorias de imagem - versão simplificada para maior compatibilidade
      try {
        console.log("Aplicando filtros básicos para melhorar a qualidade");
        
        // Usa filtros CSS que são mais eficientes que manipular pixel por pixel
        context.filter = "brightness(1.05) contrast(1.05) saturate(1.1)";
        context.drawImage(canvas, 0, 0);
        context.filter = "none";
      } catch (e) {
        console.error("Erro ao aplicar filtros de imagem:", e);
        // Continua mesmo se o processamento falhar
      }
      
      // Gera o base64 - menor qualidade (0.85) para reduzir tamanho e melhorar upload
      console.log("Gerando base64 da imagem...");
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      
      // Verifica se o dataUrl foi gerado corretamente
      if (!dataUrl || dataUrl === "data:,") {
        console.error("Erro: dataUrl inválido gerado");
        return "";
      }
      
      console.log(`Foto capturada com sucesso. Tamanho aproximado: ${Math.round(dataUrl.length / 1024)}KB`);
      return dataUrl;
    } catch (error) {
      console.error("Erro inesperado ao capturar foto:", error);
      return "";
    }
  }
  
  /**
   * Verifica se o usuário concedeu permissão para a câmera
   */
  public hasPermissionGranted(): boolean {
    return this.hasPermission;
  }
  
  /**
   * Converte um arquivo de imagem para base64
   */
  public static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
