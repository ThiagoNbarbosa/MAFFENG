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
    // Remove o prefixo do base64 (data:image/jpeg;base64,)
    const imageData = base64Image.split(',')[1] || base64Image;
    
    // Cria uma referência para o arquivo no storage
    const storageRef = ref(storage, path);
    
    // Faz o upload da imagem
    await uploadString(storageRef, imageData, 'base64');
    
    // Obtém a URL de download da imagem
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
}

export { storage };
