-- Rode depois do schema.sql. Ajusta categorias_despesa que faltavam
-- para cobrir a lista do Orçamento Base Zero, e monta as categorias_orcamento.

-- 1) Categorias de despesa que a lista do orçamento pede e ainda não existiam
insert into categorias_despesa (nome, tipo, ordem) values
  ('Aluguel','fixa',21),
  ('Compras do dia a dia','variavel',22)
on conflict do nothing;

-- 2) Categorias de orçamento do tipo "gasto" (apontam para categorias_despesa existentes)
insert into categorias_orcamento (nome, tipo, categoria_despesa_id, ordem)
select nome, 'gasto', id, ordem
from categorias_despesa
where nome in ('Aluguel','Mercado','Transporte','Financiamentos','Assinaturas',
               'Compras do dia a dia','Lazer','Saúde','Outros');

-- 3) Categorias de orçamento do tipo "alocacao" — exigem que as metas já existam.
-- Primeiro crie as metas correspondentes na tela de Planejamento (ou via insert em `metas`),
-- copie os UUIDs, e então rode:

-- insert into categorias_orcamento (nome, tipo, meta_id, ordem) values
--   ('Reserva de emergência', 'alocacao', 'UUID-DA-META-RESERVA', 23),
--   ('Investimentos', 'alocacao', 'UUID-DA-META-INVESTIMENTOS', 24),
--   ('Objetivos financeiros', 'alocacao', 'UUID-DA-META-OBJETIVOS', 25);

-- 4) Orçamento do mês atual (crie um por mês; a receita_planejada_total pode ser
-- ajustada depois pela tela)
insert into orcamentos_mensais (mes_referencia, receita_planejada_total)
values (date_trunc('month', current_date), 0)
on conflict (mes_referencia) do nothing;
