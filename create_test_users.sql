-- Criação de usuários de teste para o TMS-MAFFENG
-- Execute estes comandos no SQL Editor do Supabase

-- Inserir usuários na tabela auth.users (método alternativo via function)
-- Como não podemos inserir diretamente na auth.users, vamos criar uma função

-- Função para criar usuários de teste
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS void AS $$
BEGIN
  -- Esta função deve ser executada como administrador
  -- Os usuários serão criados via interface do Supabase Auth
  RAISE NOTICE 'Para criar os usuários de teste, vá para:';
  RAISE NOTICE '1. Painel do Supabase > Authentication > Users';
  RAISE NOTICE '2. Clique em "Add user" e crie os seguintes usuários:';
  RAISE NOTICE '   - Email: ygor@maffeng.com, Password: maffeng123';
  RAISE NOTICE '   - Email: thiago@maffeng.com, Password: maffeng123';  
  RAISE NOTICE '   - Email: mikaelly@maffeng.com, Password: maffeng123';
END;
$$ LANGUAGE plpgsql;

-- Executar a função para ver as instruções
SELECT create_test_users();