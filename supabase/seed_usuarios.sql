-- Depois de criar os 2 usuários em Authentication > Users no painel do Supabase,
-- rode este INSERT trocando os UUIDs pelos "User UID" de cada um (visível na lista de usuários)
-- e os e-mails correspondentes.

insert into usuarios (id, nome, email, cor_identificacao) values
  ('COLE-O-UUID-DO-USUARIO-1', 'Nome 1', 'email1@exemplo.com', '#1B4332'),
  ('COLE-O-UUID-DO-USUARIO-2', 'Nome 2', 'email2@exemplo.com', '#145263');
