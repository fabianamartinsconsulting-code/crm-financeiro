# CRM Financeiro Familiar — MVP

App instalável (PWA) de gestão financeira para dois adultos. React + Tailwind + Supabase.

## 1. Rodar localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

## 2. Criar o backend no Supabase

1. Crie um projeto em supabase.com
2. Vá em **SQL Editor** e rode `supabase/schema.sql` (cria as tabelas e políticas de acesso, incluindo o Orçamento Base Zero)
3. Vá em **Authentication → Users** e crie os 2 usuários (e-mail + senha)
4. Copie o UUID de cada usuário criado e preencha `supabase/seed_usuarios.sql`, depois rode esse script no SQL Editor
5. Rode `supabase/seed_orcamento.sql` para criar as categorias de gasto do orçamento e o orçamento do mês atual. As categorias do tipo "alocação" (Reserva de emergência, Investimentos, Objetivos financeiros) exigem que você crie as metas correspondentes primeiro — o próprio script explica o passo a passo
6. Em **Project Settings → API**, copie a `Project URL` e a `anon public key` para o seu `.env`

## 3. Publicar no GitHub Pages (mesmo fluxo do MS One CRM)

```bash
npm run build
git init
git add .
git commit -m "MVP CRM Financeiro Familiar"
git branch -M main
git remote add origin https://github.com/martinsbi82-ux/crm-financeiro.git
git push -u origin main
```

Depois configure o GitHub Pages para publicar a partir da pasta `dist/` (ou use uma Action de deploy).
**Importante:** use sempre `git push`, nunca upload por ZIP — é a causa recorrente de CSS/assets desatualizados nos seus outros projetos.

Se o nome do repositório for diferente de `crm-financeiro`, ajuste o campo `base` em `vite.config.js` e o `basename` em `src/App.jsx` para bater com o novo caminho.

## 4. Instalar como app no celular

Depois de publicado, abra o link no Chrome do Android → menu → "Adicionar à tela inicial". O ícone, splash screen e modo tela cheia já estão configurados.

## O que já está pronto

**MVP**
- Login (Supabase Auth)
- Dashboard: saldo, receitas/despesas do mês, participação financeira (barra dividida), gastos por categoria
- Cadastro de Receitas
- Cadastro de Despesas (com categoria, responsável, forma de pagamento, recorrência)
- Instalável como PWA

**Orçamento Base Zero — Fase A (núcleo)**
- Definição da receita planejada do mês
- Categorias de orçamento (gasto ou alocação para meta), cada uma com valor planejado
- Execução em tempo real: o gasto de cada categoria é lido direto de `despesas`/`metas_contribuicoes` — nunca duplicado
- Indicador verde/amarelo/vermelho por categoria
- Ficha da categoria com histórico de lançamentos do mês
- Resumo do mês: não alocado, saldo do orçamento, economizado, gasto acima do planejado

## Próximos passos

- **Orçamento Base Zero — Fase B:** calendário financeiro (meses futuros) e simulações
- **Patrimônio Vinculado a Objetivos:** extensão de `patrimonio`, tabela `passivos`, dashboard patrimonial (livre/reservado/total/líquido)
- **Fase D:** Assistente Financeiro (insights)

Conforme o documento de arquitetura `arquitetura-orcamento-patrimonio-vinculado.md`.
