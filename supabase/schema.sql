-- CRM Financeiro Familiar — Schema MVP (Fase 1)
-- Execute no SQL Editor do Supabase

create table usuarios (
  id uuid primary key default auth.uid(),
  nome text not null,
  email text unique not null,
  cor_identificacao text default '#1B4332',
  criado_em timestamptz default now()
);

create table categorias_despesa (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text check (tipo in ('fixa','variavel')) default 'variavel',
  icone text,
  ordem int default 0
);

insert into categorias_despesa (nome, tipo, ordem) values
  ('Alimentação','variavel',1), ('Mercado','variavel',2), ('Padaria','variavel',3),
  ('Casa','fixa',4), ('Água','fixa',5), ('Energia','fixa',6), ('Internet','fixa',7),
  ('Combustível','variavel',8), ('Transporte','variavel',9), ('Saúde','variavel',10),
  ('Farmácia','variavel',11), ('Assinaturas','fixa',12), ('Animais','variavel',13),
  ('Veículos','variavel',14), ('Financiamentos','fixa',15), ('Lazer','variavel',16),
  ('Vestuário','variavel',17), ('Beleza','variavel',18), ('Investimentos','variavel',19),
  ('Outros','variavel',20);

create table receitas (
  id uuid primary key default gen_random_uuid(),
  valor numeric(12,2) not null,
  data date not null,
  responsavel_id uuid references usuarios(id) not null,
  categoria text check (categoria in ('salario','autonomo','comissao','rendimento','extra')) not null,
  observacoes text,
  criado_em timestamptz default now()
);

create table despesas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria_id uuid references categorias_despesa(id) not null,
  valor numeric(12,2) not null,
  data date not null,
  pago_por_id uuid references usuarios(id) not null,
  forma_pagamento text,
  recorrente boolean default false,
  observacoes text,
  criado_em timestamptz default now()
);

-- Row Level Security: apenas os usuários autenticados da família têm acesso
alter table usuarios enable row level security;
alter table receitas enable row level security;
alter table despesas enable row level security;
alter table categorias_despesa enable row level security;

create policy "familia_le_usuarios" on usuarios for select using (auth.uid() is not null);
create policy "familia_le_categorias" on categorias_despesa for select using (auth.uid() is not null);

create policy "familia_crud_receitas" on receitas for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "familia_crud_despesas" on despesas for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============================================================
-- Orçamento Base Zero (Fase A)
-- ============================================================

create table orcamentos_mensais (
  id uuid primary key default gen_random_uuid(),
  mes_referencia date not null unique, -- sempre dia 1 do mês
  receita_planejada_total numeric(12,2) not null default 0,
  criado_em timestamptz default now()
);

create table categorias_orcamento (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text check (tipo in ('gasto','alocacao')) not null,
  categoria_despesa_id uuid references categorias_despesa(id),
  meta_id uuid references metas(id),
  ordem int default 0,
  constraint vinculo_unico check (
    (tipo = 'gasto' and categoria_despesa_id is not null and meta_id is null) or
    (tipo = 'alocacao' and meta_id is not null and categoria_despesa_id is null)
  )
);

create table orcamento_categoria_valores (
  id uuid primary key default gen_random_uuid(),
  orcamento_mensal_id uuid references orcamentos_mensais(id) not null,
  categoria_orcamento_id uuid references categorias_orcamento(id) not null,
  valor_planejado numeric(12,2) not null default 0,
  unique (orcamento_mensal_id, categoria_orcamento_id)
);

alter table orcamentos_mensais enable row level security;
alter table categorias_orcamento enable row level security;
alter table orcamento_categoria_valores enable row level security;

create policy "familia_crud_orcamentos_mensais" on orcamentos_mensais for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "familia_crud_categorias_orcamento" on categorias_orcamento for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "familia_crud_orcamento_valores" on orcamento_categoria_valores for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
