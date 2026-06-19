# Autenticação — Authorization Code + PKCE

A partir desta versão, o **support web** (e, em seguida, o **app Flutter**) deixam de usar
Password Grant (ROPC, deprecado) e passam a usar **Authorization Code + PKCE**.

## Configuração obrigatória no Keycloak

No realm `funciona-agro`, no client de cada app:

### Client do support web — `funciona-agro-support`

- **Client type:** `OpenID Connect`
- **Client authentication:** `Off` (client público)
- **Standard flow:** `Enabled` ✅ (é o Authorization Code)
- **Direct access grants:** pode desabilitar (não é mais usado)
- **Valid redirect URIs:** as origens do app, ex.:
  - `http://192.168.1.11:5173/*`
  - `http://localhost:5173/*`
  - (produção) `https://suporte.suodominio.com/*`
- **Valid post logout redirect URIs:** as mesmas origens (`http://192.168.1.11:5173/*`, etc.)
- **Web origins:** as mesmas origens, ou `+` para herdar dos redirect URIs (CORS)
- **PKCE:** em *Advanced* → *Proof Key for Code Exchange Code Challenge Method* = `S256`

> O `keycloak-js` faz o PKCE automaticamente. O `silent-check-sso.html` (em `public/`)
> permite restaurar a sessão (SSO) sem digitar login de novo.

### Client do app Flutter — `funciona-agro-api` (já existe)

O app Flutter usa o client **`funciona-agro-api`** (mesmo já configurado como
`KEYCLOAK_CLIENT_ID` na API). Confira nele:

- **Client authentication:** `Off` (público) ✅
- **Standard flow:** `Enabled` ✅ (necessário para o Authorization Code)
- **Valid redirect URIs:** adicione o esquema nativo do app:
  - `br.com.funcionaagro.gestaocampos://login-callback`
- **PKCE (S256):** habilitado

> A API aceita tokens dos dois clients via
> `KEYCLOAK_ALLOWED_CLIENT_IDS=funciona-agro-api,funciona-agro-support` (já configurado).

## Variáveis de ambiente

### Support web (`.env`)

```
VITE_API_URL=http://192.168.1.11:3099
VITE_KEYCLOAK_URL=http://192.168.1.11:8181
VITE_KEYCLOAK_REALM=funciona-agro
VITE_KEYCLOAK_CLIENT_ID=funciona-agro-support
```

> Antes era `VITE_KEYCLOAK_TOKEN_URL` (a URL do token). Agora é a **base** do Keycloak
> (`VITE_KEYCLOAK_URL`) + o **realm** separado.

### App Flutter (`--dart-define`)

```
API_BASE_URL=http://192.168.1.11:3099
KEYCLOAK_ISSUER=http://192.168.1.11:8181/realms/funciona-agro
KEYCLOAK_CLIENT_ID=funciona-agro-api
KEYCLOAK_REDIRECT_URL=br.com.funcionaagro.gestaocampos://login-callback
```

## Tema de login customizado

A tela de login é renderizada pelo Keycloak; para deixá-la com a identidade do app há um
tema próprio em `funciona-agro-api/docker/keycloak/themes/funciona-agro/login/`:

- `theme.properties` — estende `keycloak.v2` e adiciona o CSS da marca.
- `resources/css/funciona-agro.css` — fundo verde gradiente, botão verde, links e o logo.
- `resources/img/logo.png` — logo do app.

Montagem (já configurada no `docker-compose.yml`):

```yaml
volumes:
  - ./docker/keycloak/themes:/opt/keycloak/themes:ro
```

Ativação:

1. Reinicie o Keycloak para montar o volume: `npm run infra:down && npm run infra:up`.
2. Aponte o realm para o tema:
   - Realm novo (import): já vai com `"loginTheme": "funciona-agro"`.
   - Realm existente: Admin Console → Realm settings → Themes → **Login theme** = `funciona-agro`.

> Como o Keycloak roda em `start-dev`, o cache de temas fica desligado: editar o CSS e dar
> refresh na tela de login já reflete a mudança (ótimo para ajuste fino).

Para um match pixel-perfect com o design system do React, a alternativa é o **Keycloakify**
(escreve o tema em React) — mais setup, melhor fidelidade.

## Observações

- Em `http` (sem TLS) o iOS bloqueia por ATS — para dev, já há exceção de ATS por usar
  a API em `http`; em produção use `https` no Keycloak.
- Senha temporária / "trocar no 1º login" do Keycloak agora **funciona** nativamente,
  porque o login acontece na tela do próprio Keycloak (não mais via password grant).
