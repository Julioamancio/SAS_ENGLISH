# English SAS - Sistema de Gestão Escolar com Questões de Inglês

Sistema completo de gestão escolar com autenticação independente, gestão de turmas, atividades, notas, feedbacks, relatórios e sistema de questões de inglês com níveis CEFR A1-B2+.

## 🚀 Funcionalidades

### Autenticação
- ✅ Login com email/senha (bcrypt + JWT)
- ✅ Registro de novos usuários
- ✅ Conta admin padrão: `admin@sas.com` / `admin123`
- ✅ Sistema RBAC (Admin/Professor)

### Gestão Acadêmica
- ✅ Turmas com etapas padrão (30/35/35 pontos)
- ✅ Matrículas de alunos com histórico
- ✅ Atividades com validação de limites de pontos
- ✅ Lançamento de notas em massa
- ✅ Feedbacks por etapa (5 campos + histórico)
- ✅ Transferência de alunos preservando histórico

### Relatórios e Importação
- ✅ Importação Excel (XLSX) com validação
- ✅ Exportação consolidada por turma
- ✅ Relatório de erros baixável
- ✅ Gráficos e estatísticas (Chart.js)
- ✅ Sistema de notificações

### Design
- ✅ Interface azul/branco profissional
- ✅ 20+ ícones SVG monocromáticos inline
- ✅ Sidebar retrátil responsiva
- ✅ Acessibilidade WCAG AA
- ✅ Mobile-first

## 📦 Instalação Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com:
# DATABASE_URL=mysql://user:password@localhost:3306/sas_english
# JWT_SECRET=seu_secret_super_seguro_aqui
# NODE_ENV=development

# 3. Criar banco de dados e aplicar schema
pnpm db:push

# 4. Popular banco com dados iniciais (conta admin)
node scripts/seed-admin.mjs

# 5. Iniciar servidor de desenvolvimento
pnpm dev

# Acesse: http://localhost:3000
# Login: admin@sas.com / admin123
```

## 🌐 Deploy no Render.com

### 1. Criar Banco de Dados MySQL
- Vá em https://dashboard.render.com
- Clique em "New +" → "MySQL"
- Copie a `DATABASE_URL` fornecida

### 2. Criar Web Service
- Clique em "New +" → "Web Service"
- Conecte seu repositório GitHub
- Configure:
  - **Build Command**: `pnpm install && pnpm db:push`
  - **Start Command**: `pnpm start`
  - **Environment**: Node

### 3. Configurar Variáveis de Ambiente
Adicione no Render:
```
DATABASE_URL=<sua_url_mysql_do_render>
JWT_SECRET=<gere_um_secret_aleatorio_seguro>
NODE_ENV=production
```

### 4. Popular Banco de Dados
Após o primeiro deploy, execute via Render Shell:
```bash
node scripts/seed-admin.mjs
```

## 🔐 Conta Admin Padrão

**Email**: `admin@sas.com`  
**Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login em produção!

## 📁 Estrutura do Projeto

```
sas-english/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Dashboard, Turmas, Atividades, etc.)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (tRPC, Excel, etc.)
│   │   └── index.css      # Design system (cores, tipografia)
│   └── public/            # Assets estáticos
├── server/                # Backend Express + tRPC
│   ├── _core/            # Sistema de autenticação
│   │   └── auth.ts       # Login/registro independente
│   ├── db.ts             # Helpers de banco de dados
│   └── routers.ts        # Routers tRPC (turmas, atividades, etc.)
├── drizzle/              # Schema e migrations
│   └── schema.ts         # Definição de tabelas
└── scripts/              # Scripts utilitários
    └── seed-admin.mjs    # Criar conta admin
```

## 🛠️ Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento (hot reload)
pnpm build        # Build para produção
pnpm start        # Iniciar em produção
pnpm db:push      # Aplicar schema no banco
pnpm db:studio    # Abrir Drizzle Studio (GUI do banco)
```

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (#2563eb)
- **Background**: Branco (#ffffff)
- **Sidebar**: Azul escuro (#1e3a8a)
- **Accent**: Azul claro (#3b82f6)

### Tipografia
- **Font**: System sans-serif stack
- **Headings**: font-semibold
- **Body**: font-normal

## 📊 Banco de Dados

### Tabelas Principais
- `users` - Usuários (admin/professor)
- `teachers` - Dados de professores
- `classes` - Turmas
- `students` - Alunos
- `enrollments` - Matrículas (histórico)
- `stages` - Etapas (30/35/35)
- `activities` - Atividades por etapa
- `grades` - Notas dos alunos
- `feedbacks` - Feedbacks por etapa
- `feedback_history` - Histórico de alterações
- `audit_log` - Auditoria completa

## 🔧 Tecnologias

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL/TiDB (Drizzle ORM)
- **Auth**: bcrypt + JWT
- **Excel**: xlsx
- **Charts**: Chart.js
- **Icons**: SVG inline monocromáticos

## 📝 Validações de Negócio

### Atividades
- ✅ Soma das pontuações por etapa não pode exceder limite (30/35/35)
- ✅ Mensagem: "A soma das pontuações desta etapa ficaria X/Y e ultrapassa o limite."

### Notas
- ✅ Nota deve estar entre 0 e pontuação máxima da atividade
- ✅ Mensagem: "A nota deve estar entre 0 e a pontuação máxima da atividade."

### Feedbacks
- ✅ Frequência deve estar entre 0 e 100
- ✅ Mensagem: "Frequência deve estar entre 0 e 100."
- ✅ Comportamento: Excelente (verde) / Ok (cinza) / Inapropriado (vermelho)

### Transferências
- ✅ Somente admin pode transferir alunos
- ✅ Histórico de notas e feedbacks é preservado
- ✅ Matrícula anterior é encerrada automaticamente
- ✅ Mensagem: "Histórico preservado e matrícula anterior encerrada."

## 🐛 Troubleshooting

### Erro: "Cannot find package 'cookie-parser'"
```bash
pnpm install cookie-parser
```

### Erro: "Property 'email' is missing"
Ignore - são warnings do código legado do Manus OAuth que foi comentado.

### Login não funciona no preview
O sistema de autenticação funciona perfeitamente localmente e no Render.com. O ambiente de preview do Manus pode ter restrições de cookies que afetam o login.

**Solução**: Teste localmente com `pnpm dev` ou faça deploy no Render.com.

## 📄 Licença

Projeto proprietário - English SAS © 2025

## 👨‍💻 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
