export interface CameraOptions {
  element: HTMLVideoElement;
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

export class Camera {
  private videoElement: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private facingMode: "user" | "environment";
  private width: number;
  private height: number;

  constructor(options: CameraOptions) {
    this.videoElement = options.element;
    this.facingMode = options.facingMode || "environment";
    this.width = options.width || 1280;
    this.height = options.height || 720;
  }

  public async start(): Promise<boolean> {
    try {
      if (this.stream) {
        this.stop();
      }

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
      
      return new Promise<boolean>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve(true);
        };
      });
    } catch (error) {
      console.error("Error starting camera:", error);
      return false;
    }
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.videoElement.srcObject = null;
    }
  }

  public toggleCamera(): Promise<boolean> {
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    return this.start();
  }

  public capturePhoto(): string {
    if (!this.videoElement) return "";

    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return "";
    
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }
}
