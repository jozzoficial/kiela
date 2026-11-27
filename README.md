# Kiela AI

Assistente web que esclarece dúvidas da população sobre epidemias.
Front-end em **HTML + CSS + JavaScript puro**: sem framework, sem Tailwind e sem passo de compilação.
Dados no **Supabase**, agente em **FastAPI no Render**, hospedagem na **Vercel**.

## Ver já

Abra o ficheiro **`index.html`** com duplo clique. Não precisa de servidor nem de instalar nada.
Sem configurar nada, o site corre em **modo demonstração** (agente falso, nada gravado).
No chat, escreva `#lento` ou `#erro` numa pergunta para ver os estados de espera longa e de erro.

Precisa de internet para as fontes de letra e para os ícones (Google Fonts).

## Estrutura

```
index.html                    página inicial
pages/                        chat.html, about.html
styles/                       tokens.css (cores, espaços), base.css, layout.css (cabeçalho e rodapé),
                              components.css, home.css, about.css, chat.css
src/
  config/                     env.js (URLs e chave pública), contacts.js (números, perguntas sugeridas)
  models/                     message.js, conversation.js (forma dos dados + validação)
  services/                   falam com o exterior: agentService, conversationService,
                              feedbackService, authService, supabaseClient, fakeAgent
  controllers/                ligam página, serviços e componentes: chat, home, about
  components/                 peças de interface: header, footer, bolhas, cartões
  utils/                      dom.js (criação segura de elementos), http.js, page.js
assets/images/                logótipo e ícones do site
database/                     SQL do Supabase (tabelas e segurança RLS)
docs/agent-contract.md        o que o agente tem de cumprir (para o outro dev)
```

Regras entre camadas: **services** nunca mexem no ecrã; **components** nunca chamam services;
**controllers** é que ligam tudo.

### Como os ficheiros JavaScript se ligam

Para funcionar com duplo clique, o JavaScript **não usa módulos ES** (`import`/`export`), que o navegador
bloqueia em ficheiros abertos directamente. Cada ficheiro regista-se num objecto global `Kiela`
(por exemplo `Kiela.services.agent`) e o HTML carrega-os por ordem com `<script src>`.
**A ordem importa:** se criar um ficheiro novo, acrescente-o no HTML depois dos que ele usa.

## Ligar ao Supabase

1. Crie o projecto. Em **Authentication, Sign In / Providers**, active **Anonymous sign-ins**.
2. No **SQL Editor**, corra `database/001_tables.sql` e depois `database/002_rls_policies.sql`.
3. Em `src/config/env.js`, ponha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` (a chave **publishable**, nunca a secreta `sb_secret_...`).

## Ligar ao agente

Quando o outro dev entregar o link do Render, ponha-o em `AGENT_URL` no mesmo ficheiro.
O contrato (endpoints, formato, erros, segurança) está em `docs/agent-contract.md`: mande-lhe esse ficheiro.
O agente tem de aceitar pedidos vindos do domínio da Vercel (CORS) e, para testes com duplo clique, da origem `null`.

## Publicar na Vercel

Importe o repositório no GitHub. Framework: **Other**. Sem build command, directoria de saída na raiz.
O `vercel.json` traz cabeçalhos de segurança. Se mudar o domínio do agente ou do Supabase, ajuste `connect-src`.

## Antes de publicar (confirmar)

- **Contactos:** o número de emergência (`112`) e a linha de saúde estão em `src/config/contacts.js`.
  Confirme os números. A linha de saúde está vazia de propósito: se a preencher, aparece no cabeçalho.
- **Fontes (OMS, MINSA):** o site anuncia que as respostas se baseiam nelas. O agente tem de as usar mesmo.

## Mudar o aspecto

Cores, espaços e cantos estão em `styles/tokens.css`. O ponto em que a barra do PC passa a hambúrguer
(900 px) está em três sítios: `styles/layout.css`, `styles/tokens.css` e `src/components/header.js`; mude nos três se quiser outro valor.
