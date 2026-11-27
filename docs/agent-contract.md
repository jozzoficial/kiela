# Contrato entre o site e o agente (FastAPI no Render)

Este documento é para quem constrói o agente. O site já está pronto para este contrato.
Se algo mudar, avisem-se mutuamente e actualizem este ficheiro.

## Endpoints

### `GET /saude`
Sem autenticação. Serve para o site "acordar" o Render quando a página abre e mostrar "Kiela AI Activo".

```json
{ "estado": "ok" }
```

### `POST /chat`
Cabeçalhos:

```
Content-Type: application/json
Authorization: Bearer <token de sessão do Supabase>
```

Corpo:

```json
{ "mensagem": "O meu irmão tem febre alta e calafrios.", "conversa_id": "uuid" }
```

Resposta 200:

```json
{
  "resposta": "Texto simples, em português claro.",
  "fontes": [
    { "titulo": "OMS: Directrizes de Malária", "url": "https://www.who.int/..." },
    { "titulo": "Protocolo Nacional de Saúde Pública" }
  ],
  "procurar_assistencia": true
}
```

| Campo | Regras |
|---|---|
| `resposta` | Obrigatório. Texto simples (o site mostra-o como texto, **não** interpreta HTML nem Markdown). |
| `fontes` | Opcional. Até 6. `url` é opcional e só são aceites `http` e `https`. |
| `procurar_assistencia` | Opcional (por omissão `false`). Com `true`, o site mostra o cartão laranja a mandar a pessoa a uma unidade de saúde. Deve ser `true` sempre que os sintomas descritos indiquem gravidade. |

A mensagem tem no máximo 500 caracteres (o site já limita).

## Erros

O site reage ao código HTTP, por isso usem estes:

| Código | Quando | O que a pessoa vê |
|---|---|---|
| 401 / 403 | Token em falta ou inválido | "Sessão inválida" |
| 429 | Demasiados pedidos | "Muitas perguntas seguidas" |
| 5xx | Falha interna | "O assistente não conseguiu responder" + botão "Tentar de novo" |

## O que o agente tem de fazer (segurança)

1. **CORS** só para o domínio da Vercel. Nunca `*` em produção.
   - Atenção: quando o site é aberto com duplo clique (`file://`), o navegador envia `Origin: null`.
     Para testar assim, acrescente `"null"` à lista de origens (ou use `*`), **só em desenvolvimento**.
2. **Validar o token** do Supabase em cada `POST /chat` (assinatura, expiração, `aud` e `iss`). O site usa sessões anónimas, por isso o token identifica o dispositivo, não uma pessoa. A verificação faz-se com a **chave pública** do projecto (JWKS), sem nenhum segredo: ver `validar_token` abaixo.
3. **Limitar pedidos** por utilizador (`sub` do token) e por IP, por exemplo com `slowapi`.
4. **Segredos só no Render** (chave do modelo de IA, etc.), em variáveis de ambiente. Nada disto vai para o site.
5. Não confiar em `conversa_id` para autorização: é só um identificador.
6. Não devolver erros internos (stack traces) nas respostas.

## Esqueleto mínimo (FastAPI)

```python
import os
import jwt
from jwt import PyJWKClient
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ["ORIGENS_PERMITIDAS"].split(","),  # ex.: https://kiela-ai.vercel.app  (em testes: ...,null)
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

class Pergunta(BaseModel):
    mensagem: str = Field(min_length=1, max_length=500)
    conversa_id: str

class Fonte(BaseModel):
    titulo: str
    url: str | None = None

class Resposta(BaseModel):
    resposta: str
    fontes: list[Fonte] = []
    procurar_assistencia: bool = False

SUPABASE_URL = os.environ["SUPABASE_URL"]  # https://hovrblvtznttfldxdwrs.supabase.co
JWKS = PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")  # pip install "pyjwt[crypto]"

def validar_token(authorization: str | None) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401)
    token = authorization.split(" ", 1)[1]
    try:
        chave = JWKS.get_signing_key_from_jwt(token).key
        return jwt.decode(
            token, chave, algorithms=["ES256", "RS256"],
            audience="authenticated", issuer=f"{SUPABASE_URL}/auth/v1",
        )  # devolve os dados do token (sub = id do utilizador anónimo)
    except Exception:
        raise HTTPException(status_code=401)

@app.get("/saude")
def saude():
    return {"estado": "ok"}

@app.post("/chat", response_model=Resposta)
def chat(p: Pergunta, authorization: str | None = Header(default=None)):
    utilizador = validar_token(authorization)
    # TODO: chamar o agente aqui
    return Resposta(resposta="...", procurar_assistencia=False)
```
