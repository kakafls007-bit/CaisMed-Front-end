# CaisMed - Front-end

Abra `index.html` no navegador (ou use a extensão Live Server). Os dados ficam no `localStorage`, só para demonstração.

## Pontos para o time de back-end

Hoje os dados vêm do `localStorage`. Os trechos marcados com `TODO` no `app.js` indicam onde trocar por chamadas à API. Rotas sugeridas:

| Ação | Rota |
|---|---|
| Login do cliente (CPF + senha) | `POST /auth/login` |
| Login do profissional (matrícula + senha) | `POST /auth/profissional/login` |
| Cadastrar cliente (só o profissional) | `POST /clientes` |
| Primeiro acesso (cliente cria a senha pelo CPF) | `POST /auth/primeiro-acesso` |
| Listar / buscar cliente | `GET /clientes`, `GET /clientes/:id` |
| Alterar cliente (inclui plano) | `PUT /clientes/:id` |
| Listar planos | `GET /planos` |
| Fatura atual e histórico | `GET /clientes/:id/faturas` |
| Pagar fatura (Pix, cartão, boleto) | `POST /faturas/:id/pagamento` |
| Pré-triagem (texto e áudio) | `POST /pre-triagem` (multipart: `audio`) |
| Consultas | `GET/POST /consultas`, `PATCH /consultas/:id` |

Planos atuais (ficam em `PLANOS`, no topo do `app.js`): Essencial R$ 89,90, Conforto R$ 149,90, Premium R$ 249,90 e Família R$ 399,90.

## Acessos de demonstração

- Profissional: matrícula `1001`, senha `caismed123`.
- Cliente: o profissional cadastra o cliente (aba Clientes); depois o cliente toca em "Primeiro Acesso", informa o CPF e cria a senha. Não existe cadastro feito pelo próprio cliente.
