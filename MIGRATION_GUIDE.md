
# Guia de Migração para Expo/React Native

## Componentes Principais Identificados

### 1. Autenticação
- **Arquivo**: `client/src/hooks/use-auth.tsx`
- **Funcionalidade**: Sistema de login/logout
- **Status**: ✅ Pode ser reutilizado com adaptações

### 2. Páginas Principais
- **Home Page**: `client/src/pages/home-page.tsx`
  - Lista de levantamentos
  - Botão novo levantamento
  - Header com logout
  
- **Account Page**: `client/src/pages/account-page.tsx`
  - Perfil do usuário
  - Configurações (modo escuro)
  - Avatar

- **Survey Pages**: `client/src/pages/survey/`
  - Captura de fotos
  - Seleção de ambientes
  - Formulários de dimensões

### 3. Componentes Reutilizáveis
- **Logo**: `client/src/components/ui/logo.tsx`
- **Forms**: Vários formulários de survey
- **Camera**: Funcionalidade de câmera

### 4. Funcionalidades do Backend (manter)
- **API Routes**: `server/routes.ts`
- **Database**: Schema em `shared/schema.ts`
- **Storage**: `server/storage.ts`

## Plano de Migração

### Fase 1: Setup Expo
1. Criar novo Repl com template Expo
2. Configurar navegação (React Navigation)
3. Configurar estado global (Context/Zustand)

### Fase 2: Componentes Base
1. Migrar sistema de autenticação
2. Criar componentes UI básicos
3. Configurar tema (light/dark)

### Fase 3: Funcionalidades Principais
1. Telas de survey
2. Captura de câmera (expo-camera)
3. Upload de imagens

### Fase 4: Integração
1. Conectar com backend existente
2. Testes em dispositivo
3. Configurar build

## Tecnologias para o Novo Projeto
- **React Native + Expo**
- **React Navigation** (navegação)
- **Expo Camera** (câmera)
- **AsyncStorage** (armazenamento local)
- **React Query** (já usado, manter)
- **NativeWind** ou **Tamagui** (styling)
