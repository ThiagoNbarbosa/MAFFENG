import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Storage
const storage = getStorage(app);

/**
 * Faz upload de uma imagem em base64 para o Firebase Storage
 * @param base64Image Imagem em formato base64
 * @param path Caminho para salvar no storage (ex: 'surveys/123/photos/1')
 * @returns URL da imagem no Firebase Storage
 */
export async function uploadImageToFirebase(base64Image: string, path: string): Promise<string> {
  try {
    console.log("Iniciando upload para o Firebase - path:", path);
    
    // Verificação inicial se a imagem contém dados
    if (!base64Image) {
      throw new Error("Dados da imagem estão vazios");
    }
    
    // Separa o cabeçalho do base64 do conteúdo
    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem inválido");
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    // Cria um Blob a partir dos dados binários
    const blob = new Blob(byteArrays, { type: contentType });
    console.log("Blob criado com sucesso. Tamanho:", blob.size, "bytes");
    
    // Cria uma referência para o arquivo no storage
    const storageRef = ref(storage, path);
    console.log("Referência do Storage criada para:", path);
    
    // Faz o upload da imagem usando uploadBytes em vez de uploadString
    console.log("Iniciando uploadBytes...");
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log("Upload concluído com sucesso:", uploadResult.metadata);
    
    // Obtém a URL de download da imagem
    console.log("Obtendo URL de download...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("URL de download obtida!");
    
    return downloadURL;
  } catch (error: any) {
    console.error("Erro ao fazer upload da imagem:", error);
    console.error("Detalhes do erro:", error.message, error.code, error.serverResponse);
    throw error;
  }
}

export { storage };
