import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoofvcyqwyviidrewlj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb29mdmN5cXd5dmlpZHJld2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODM3MjIsImV4cCI6MjA2NDU1OTcyMn0.L3CBz5Q-MN_sk5ZGCb_4HnfIaDrCh0lU3AYjvAu6QN8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados baseados no nosso schema atual
export interface Survey {
  id: number
  user_id: string
  agency_name: string
  prefix: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  manager_name: string
  registration: string
  created_at: string
}

export interface Environment {
  id: number
  survey_id: number
  name: string
}

export interface Photo {
  id: number
  environment_id: number
  image_data?: string
  image_url?: string
  observation?: string
  photo_type: 'vista_ampla' | 'servicos_itens' | 'detalhes'
  painting_dimensions?: {
    width: string
    height: string
    area: string
  }
  created_at: string
}

// Função para upload de imagem para o Supabase Storage
export async function uploadImageToSupabase(
  file: File | Blob,
  path: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('survey-photos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      return null
    }

    // Obter URL pública da imagem
    const { data: publicData } = supabase.storage
      .from('survey-photos')
      .getPublicUrl(data.path)

    return publicData.publicUrl
  } catch (error) {
    console.error('Erro no upload:', error)
    return null
  }
}

// Função para gerar caminho estruturado para a imagem
export function generateSupabasePath(
  userId: string,
  surveyId: number,
  environmentId: number,
  photoType: string,
  itemName?: string
): string {
  const timestamp = new Date().getTime()
  const filename = `photo_${timestamp}.jpg`
  
  let path = `${userId}/surveys/${surveyId}/environments/${environmentId}/${photoType}`
  
  if (photoType === 'servicos_itens' && itemName) {
    const normalizedItemName = itemName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
    
    path = `${path}/${normalizedItemName}`
  }
  
  return `${path}/${filename}`
}

// Converter base64 para File/Blob para upload
export function base64ToBlob(base64: string): Blob {
  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  
  if (!matches || matches.length !== 3) {
    throw new Error("Formato de imagem inválido")
  }
  
  const contentType = matches[1]
  const base64Data = matches[2]
  const byteCharacters = atob(base64Data)
  const byteArrays = []
  
  const chunkSize = 512
  for (let i = 0; i < byteCharacters.length; i += chunkSize) {
    const slice = byteCharacters.slice(i, i + chunkSize)
    
    const byteNumbers = new Array(slice.length)
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  
  return new Blob(byteArrays, { type: contentType })
}