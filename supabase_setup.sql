-- Configuração inicial do banco de dados Supabase para TMS-MAFFENG

-- Criar enum para tipos de foto
CREATE TYPE photo_type AS ENUM ('vista_ampla', 'servicos_itens', 'detalhes');

-- Tabela de surveys (levantamentos)
CREATE TABLE surveys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agency_name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  registration TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de environments (ambientes)
CREATE TABLE environments (
  id BIGSERIAL PRIMARY KEY,
  survey_id BIGINT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Tabela de photos (fotos)
CREATE TABLE photos (
  id BIGSERIAL PRIMARY KEY,
  environment_id BIGINT NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  image_data TEXT, -- Base64 encoded image (opcional)
  image_url TEXT, -- URL da imagem no Supabase Storage
  observation TEXT,
  photo_type photo_type NOT NULL,
  painting_dimensions JSONB, -- Para itens de pintura: {width, height, area}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Políticas RLS (Row Level Security)
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Política para surveys: usuários só podem ver seus próprios surveys
CREATE POLICY "Users can view own surveys" ON surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surveys" ON surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surveys" ON surveys
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para environments: usuários só podem ver environments de seus surveys
CREATE POLICY "Users can view own environments" ON environments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = environments.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own environments" ON environments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = environments.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- Política para photos: usuários só podem ver photos de seus environments
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM environments e
      JOIN surveys s ON s.id = e.survey_id
      WHERE e.id = photos.environment_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM environments e
      JOIN surveys s ON s.id = e.survey_id
      WHERE e.id = photos.environment_id 
      AND s.user_id = auth.uid()
    )
  );

-- Criar bucket para storage de imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('survey-photos', 'survey-photos', true);

-- Política de storage: usuários podem fazer upload de suas próprias fotos
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'survey-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política de storage: usuários podem visualizar suas próprias fotos
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'survey-photos' AND auth.uid()::text = (storage.foldername(name))[1]);