import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

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
    
    // Remove o prefixo do base64 (data:image/jpeg;base64,)
    const imageData = base64Image.split(',')[1] || base64Image;
    console.log("Dados da imagem preparados para upload");
    
    // Cria uma referência para o arquivo no storage
    const storageRef = ref(storage, path);
    console.log("Referência do Storage criada:", path);
    
    // Faz o upload da imagem
    console.log("Iniciando uploadString...");
    const uploadResult = await uploadString(storageRef, imageData, 'base64');
    console.log("Upload concluído com sucesso:", uploadResult);
    
    // Obtém a URL de download da imagem
    console.log("Obtendo URL de download...");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("URL de download obtida:", downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error("Erro ao fazer upload da imagem:", error);
    console.error("Detalhes do erro:", error.message, error.code, error.serverResponse);
    throw error;
  }
}

export { storage };
