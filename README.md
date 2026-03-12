# T.Clean — Plataforma mobile de Facilities do T.Group

Projeto mobile-first em **Next.js + Vercel + Google Sheets + Google Drive** para:
- distribuir a rota diária do time de limpeza;
- registrar execução com status, observações e foto;
- dar visão de liderança ao Bruno;
- publicar o status de cada ambiente via QR Code.

---

## 1) O que o app já entrega

### Operação do time
- login com **e-mail + token** lendo a aba `COLABORADORES_FACILITIES`;
- leitura da aba `AMBIENTES`;
- montagem automática da **rota do dia** para Giulia e Mateus;
- divisão por **manhã, almoço, tarde e apoio flex**;
- abertura da rota com:
  - ação da limpeza;
  - tempo estimado;
  - itens necessários;
  - EPI recomendado;
  - dicas de execução;
- registro de:
  - concluída;
  - concluída com pendência;
  - não realizada;
  - justificativa;
  - foto opcional.

### Liderança
- dashboard do líder com:
  - total de concluídas;
  - total de pendências;
  - feedbacks públicos recebidos;
  - produtividade por colaborador;
  - últimos registros do dia.

### Público interno
- página pública por ambiente:
  - status atual;
  - data e hora da última limpeza;
  - observação mais recente;
  - formulário de sugestão, elogio ou reclamação.

---

## 2) Arquitetura recomendada

### Stack
- **Frontend + backend:** Next.js App Router
- **Hospedagem:** Vercel
- **Base viva de operação:** Google Sheets
- **Evidências com foto:** Google Drive
- **QR codes:** gerados por script em SVG

### Por que essa arquitetura é boa para o seu cenário
Você já trabalha com GitHub, Vercel e Google Workspace. Então a melhor decisão aqui é **não complicar** com uma stack pesada antes da hora. O T.Clean já nasce com:
- custo baixo;
- implantação rápida;
- baixa curva de manutenção;
- operação acessível para RH, Facilities e liderança.

Se no futuro vocês quiserem:
- SLA,
- fila de auditoria,
- painel com BI robusto,
- histórico pesado,
- permissões mais complexas,

aí sim dá para migrar o log operacional para Postgres/Supabase sem destruir o produto.

---

## 3) Estrutura das abas do Google Sheets

### Já existentes
- `COLABORADORES_FACILITIES`
- `AMBIENTES`

### Novas abas que o projeto usa
- `REGISTROS_LIMPEZA`
- `FEEDBACK_AMBIENTES`

Use este comando para criar/preparar automaticamente as abas:

```bash
npm run bootstrap:sheet
```

### Cabeçalho esperado em `REGISTROS_LIMPEZA`
| Coluna | Campo |
|---|---|
| A | ROW_ID |
| B | CREATED_AT |
| C | DATE |
| D | COLAB_ID |
| E | COLAB_NAME |
| F | COLAB_EMAIL |
| G | AMBIENTE_SLUG |
| H | AMBIENTE_NOME |
| I | STATUS |
| J | STARTED_AT |
| K | FINISHED_AT |
| L | DURATION_MIN |
| M | NOTES |
| N | PHOTO_URL |

### Cabeçalho esperado em `FEEDBACK_AMBIENTES`
| Coluna | Campo |
|---|---|
| A | ROW_ID |
| B | CREATED_AT |
| C | AMBIENTE_SLUG |
| D | AMBIENTE_NOME |
| E | TIPO |
| F | MENSAGEM |
| G | NOME |
| H | STATUS |

---

## 4) Geração da lógica operacional

O projeto já traz uma régua pensada para a sua operação atual:

### Giulia
- 09h00–11h30: limpeza matinal
- 11h30–15h30: salada, montagem, reposição e desmontagem do almoço
- 15h30–16h00: pausa alimentar sugerida
- 16h00–18h00: limpeza da tarde

### Mateus
- 09h00–12h40: bloco principal da manhã
- 12h40–13h10: pausa alimentar sugerida
- 13h10–18h00: bloco principal da tarde

### Alternância do estacionamento
A regra do estacionamento foi pensada com alternância semanal:
- semana ímpar: Giulia limpa **segunda e sexta**, Mateus **quarta**;
- semana par: Mateus limpa **segunda e sexta**, Giulia **quarta**.

Se você quiser trocar essa lógica:
- abra `lib/schedule.ts`
- edite a função `isAssignedTo()`.

---

## 5) Como subir as credenciais do Google

### Passo 1 — criar projeto no Google Cloud
1. Abra o Google Cloud.
2. Crie um projeto novo.
3. Ative:
   - Google Sheets API
   - Google Drive API

### Passo 2 — criar a service account
1. Vá em **IAM & Admin > Service Accounts**
2. Crie uma conta de serviço.
3. Gere a chave JSON.
4. Guarde:
   - `client_email`
   - `private_key`
   - `project_id`

### Passo 3 — compartilhar os recursos com a service account
Compartilhe com o e-mail da conta de serviço:
- a planilha do T.Clean;
- a pasta do Google Drive onde ficarão as fotos.

Dê acesso de **Editor**.

---

## 6) Variáveis de ambiente

Crie um arquivo `.env.local` com base em `.env.example`.

Exemplo:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=T.Clean
SESSION_SECRET=uma-chave-muito-forte

GOOGLE_SHEET_ID=1bQMaJIDwZV2kevQVR4GxPiR1cOnlWMhOmP1tUSqtwzw
GOOGLE_PROJECT_ID=seu-projeto
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@seu-projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_EVIDENCES_FOLDER_ID=id-da-pasta
GOOGLE_DRIVE_MAKE_PUBLIC=false
```

---

## 7) Como rodar localmente no VS Code

```bash
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000/login
```

---

## 8) Como fazer o deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Em **Project Settings > Environment Variables**, copie todas as variáveis do `.env.local`.
4. Faça o primeiro deploy.
5. Rode localmente uma vez:

```bash
npm run bootstrap:sheet
```

ou adapte esse script para rodar no ambiente que preferir.

---

## 9) Branding e imagens

O projeto já vem com:
- `public/branding/tclean-icon.svg`
- `public/branding/tclean-wordmark.svg`

### Se quiser deixar a experiência ainda mais premium
Suba em `public/branding/`:
- `tgroup-logo-white.png`
- `login-bg-1.jpg`
- `login-bg-2.jpg`

Esses assets podem ser usados depois para expandir a tela de login com lifestyle do T.Group, fotos reais da sede ou imagens institucionais mais fortes.

---

## 10) Como gerar os QR Codes das salas

Depois de configurar o `.env.local` e dar acesso à planilha:

```bash
npm run generate:qrs
```

Saída:
```txt
exports/qrs/
```

Cada SVG vai apontar para:
```txt
https://seu-dominio.com.br/ambientes/{slug}
```

### Sugestão de uso físico
Você pode imprimir uma placa por ambiente com:
- logo T.Clean;
- nome da sala;
- QR code;
- texto:
  **“Quer conferir como está a limpeza desta sala? Aponte a câmera para o QR Code abaixo.”**

---

## 11) Onde mexer nas principais regras

### Lógica de agenda e distribuição
Arquivo:
```txt
lib/schedule.ts
```

### Regras de tempo, EPI, kit e dicas de limpeza
Arquivo:
```txt
lib/facilities.ts
```

### Tela de login
Arquivo:
```txt
app/login/page.tsx
```

### Dashboard do colaborador
Arquivo:
```txt
app/staff/page.tsx
```

### Dashboard do líder
Arquivo:
```txt
app/leader/page.tsx
```

### Página pública do QR
Arquivo:
```txt
app/ambientes/[slug]/page.tsx
```

---

## 12) Como eu evoluiria este produto na versão 2.0

### Prioridade 1
- filtro por turno;
- histórico por ambiente;
- exportação CSV de pendências;
- marcação de “insumo em falta”.

### Prioridade 2
- auditoria com foto “antes/depois”;
- push notification com rota do dia;
- heatmap de áreas mais críticas;
- confirmação geográfica por QR local da sala.

### Prioridade 3
- sincronização com Looker Studio;
- score de percepção de limpeza por setor;
- painel para Gente & Cultura e sócios.

---

## 13) Minha recomendação de implantação

Para lançar rápido e bonito:
1. subir o app exatamente como está;
2. ativar login e registros;
3. validar Giulia + Mateus por 1 semana;
4. imprimir QRs de 5 áreas-piloto;
5. ajustar tempos;
6. depois expandir para toda a sede.

Esse caminho evita projeto “bonito demais no papel e pesado demais na prática”.

---

## 14) Observação importante sobre o status público

A página pública mostra o **último registro** do ambiente. Então a equipe precisa realmente usar o app todos os dias para o QR virar uma ferramenta viva. Esse detalhe é o que transforma o T.Clean em cultura operacional — e não só em sistema.

