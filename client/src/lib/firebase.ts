import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, UploadMetadata } from "firebase/storage";

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
 * @param path Caminho para salvar no storage (ex: 'surveys/123/environments/456/vista_ampla/foto1.jpg')
 * @param metadata Metadados adicionais para o arquivo (opcional)
 * @returns URL da imagem no Firebase Storage
 */
export async function uploadImageToFirebase(
  base64Image: string, 
  path: string, 
  metadata?: Record<string, string>
): Promise<string> {
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
    
    // Processa o array de bytes em chunks para evitar problemas de memória
    const chunkSize = 512;
    for (let i = 0; i < byteCharacters.length; i += chunkSize) {
      const slice = byteCharacters.slice(i, i + chunkSize);
      
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
    
    // Define os metadados para o upload
    const uploadMetadata: UploadMetadata = {
      contentType,
      customMetadata: metadata || {},
    };
    
    // Cria uma referência para o arquivo no storage
    const storageRef = ref(storage, path);
    console.log("Referência do Storage criada para:", path);
    
    // Faz o upload da imagem com os metadados
    console.log("Iniciando uploadBytes com metadados...");
    const uploadResult = await uploadBytes(storageRef, blob, uploadMetadata);
    console.log("Upload concluído com sucesso:", uploadResult.metadata);
    
    // Obtém a URL de download da imagem
    console.log("Obtendo URL de download...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("URL de download obtida com sucesso");
    
    return downloadURL;
  } catch (error: any) {
    console.error("Erro ao fazer upload da imagem:", error);
    console.error("Detalhes do erro:", error.message, error.code, error.serverResponse);
    throw error;
  }
}

/**
 * Gera um caminho estruturado para armazenar a foto no Firebase Storage
 * @param surveyId ID da pesquisa
 * @param environmentId ID do ambiente
 * @param photoType Tipo da foto (vista_ampla, servicos_itens, detalhes)
 * @param itemName Nome do item de serviço (opcional, apenas para serviços)
 * @returns Caminho formatado para o Firebase
 */
export function generateFirebasePath(
  surveyId: number, 
  environmentId: number, 
  photoType: string,
  itemName?: string
): string {
  const timestamp = new Date().getTime();
  const filename = `photo_${timestamp}.jpg`;
  
  // Base path sempre inclui survey e environment
  let path = `surveys/${surveyId}/environments/${environmentId}/${photoType}`;
  
  // Para serviços/itens, adiciona uma subpasta com o nome do serviço (normalizado)
  if (photoType === 'servicos_itens' && itemName) {
    // Normaliza o nome do item (remove espaços, acentos, etc)
    const normalizedItemName = itemName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");
    
    path = `${path}/${normalizedItemName}`;
  }
  
  // Adiciona o nome do arquivo
  return `${path}/${filename}`;
}

export { storage };
