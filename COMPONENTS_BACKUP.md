
# Backup da Estrutura de Componentes

## Componentes UI Importantes

### Logo Component
```typescript
// Localizado em: client/src/components/ui/logo.tsx
// Função: Exibir logo da aplicação
// Migração: Adaptar para React Native Image
```

### Authentication Hook
```typescript
// Localizado em: client/src/hooks/use-auth.tsx
// Função: Gerenciar estado de autenticação
// Migração: Manter lógica, adaptar storage
```

### Theme Provider
```typescript
// Localizado em: client/src/components/theme-provider.tsx
// Função: Gerenciar tema claro/escuro
// Migração: Usar Appearance API do React Native
```

## Páginas Principais

### Home Page Structure
- Header com logout e account
- Welcome message
- Duas opções: "Meus Levantamentos" e "Novo Levantamento"
- Grid layout responsivo

### Survey Flow
1. Initialize Survey → Capture → Environments → Photo Review
2. Formulários com validação
3. Upload de imagens
4. Integração com backend

## APIs Importantes
- POST /api/surveys (criar survey)
- GET /api/surveys (listar surveys)
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/user

## Dados Importantes
```typescript
// Ambientes padrão (environments.tsx)
const DEFAULT_ENVIRONMENTS = [
  "Sala de Autoatendimento",
  "Área de Espera (Caixas)",
  // ... outros ambientes
];

// Itens de serviço (service-item-search.tsx)
const DEFAULT_SERVICE_ITEMS = [
  "17.11 - PINTURA ACRILICA (COLORIDA)",
  "17.8 - PINTURA DE PISO",
  // ... outros itens
];
```
