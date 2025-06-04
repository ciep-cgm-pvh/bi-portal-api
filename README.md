# BI Portal – API

Este repositório contém a API que alimenta os painéis do **BI Portal** com dados extraídos, tratados e armazenados no banco relacional do projeto.

## 📌 Stack Principal (sugerida)

- Node.js + Express ou Fastify
- PostgreSQL
- Prisma ORM ou Knex.js
- GraphQL (opcional)
- JWT/Auth (se necessário)

## 🔧 Funcionalidades Planejadas

- Rotas públicas para cada painel (ex: `/diarias`, `/emendas`)
- Filtros e agregações por parâmetros
- Rate limiting e caching
- Versionamento de API (ex: `/v1/diarias`)

## 📁 Estrutura Sugerida

- `src/routes`: Endpoints
- `src/controllers`: Lógica das rotas
- `src/services`: Acesso ao banco
- `src/utils`: Helpers, middlewares, auth
- `src/schemas`: (Se usar validação tipo Zod ou Joi)

## 📦 Instalação

```bash
npm install
npm run dev
