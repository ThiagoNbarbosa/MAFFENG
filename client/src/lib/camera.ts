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

  constructor(options: CameraOptions) {
    this.videoElement = options.element;
    this.facingMode = options.facingMode || "environment";
    this.width = options.width || 1280;
    this.height = options.height || 720;
    this.onError = options.onError;
    this.onSuccess = options.onSuccess;
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

      // Configurações avançadas para tentar melhorar a qualidade da imagem
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: this.width },
          height: { ideal: this.height }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      this.hasPermission = true;
      
      if (this.onSuccess) {
        this.onSuccess();
      }
      
      return new Promise<boolean>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve(true);
        };
      });
    } catch (error) {
      console.error("Error starting camera:", error);
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
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    return this.start();
  }

  /**
   * Captura uma foto da câmera
   */
  public capturePhoto(): string {
    if (!this.videoElement || !this.hasPermission) return "";

    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return "";
    
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    
    // Tenta melhorar o contraste da imagem (pode ajudar em imagens escuras)
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Aplica um pequeno aumento de brilho e contraste
      for (let i = 0; i < data.length; i += 4) {
        // Aumento de brilho
        data[i] = Math.min(255, data[i] * 1.1);     // R
        data[i+1] = Math.min(255, data[i+1] * 1.1); // G
        data[i+2] = Math.min(255, data[i+2] * 1.1); // B
      }
      
      context.putImageData(imageData, 0, 0);
    } catch (e) {
      console.error("Error processing image:", e);
      // Continua mesmo se o processamento falhar
    }
    
    return canvas.toDataURL("image/jpeg", 0.9); // Aumenta a qualidade para 90%
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
