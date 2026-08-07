# webinar-mailer

Motor de envio próprio para a régua semanal de emails do webinário megamemory, usando a **API transacional do Brevo**. Serviço standalone, sem servidor obrigatório (roda como cron no GitHub Actions).

O webinário é toda **quarta às 19:00 (Europe/Berlin)**. A régua tem 9 emails, calculados a partir do atributo `DATA_WEBINAR` de cada contato (a quarta dele). O estado de "já enviei" fica gravado em atributos do próprio contato no Brevo, então o serviço é **stateless e idempotente**: pode rodar quantas vezes quiser sem duplicar envio.

## Como funciona (resumo)

- Um worker roda a cada 15 min. Ele lê os contatos da lista **3**, olha `DATA_WEBINAR` e os flags `WSTEP_*`, e decide o que disparar. Contato sem `DATA_WEBINAR` recebe automaticamente a próxima quarta.
- Um step só é enviado se `WSTEP_<STEP>` for **diferente** de `DATA_WEBINAR` (ou vazio). Depois de enviar, grava `WSTEP_<STEP> = DATA_WEBINAR`.
- Quando a `DATA_WEBINAR` do contato muda (vira a semana), os flags deixam de bater e a régua roda de novo sozinha.
- Se um horário-alvo já passou há mais de **6 horas** (worker ficou fora do ar), o step é **marcado como enviado sem disparar**, para não mandar email muito atrasado.

### A régua (relativa a W = a quarta em `DATA_WEBINAR`, horário de Berlim)

| step | quando | template |
|---|---|---|
| CONFIRM | imediato (ao existir o contato) | Webinar 01 Confirmation |
| WA | 3h depois do CONFIRM | Webinar 02 WhatsApp |
| TUE | terça (W-1) 09:00 | Webinar 07 Tuesday |
| WED10 | quarta (W) 10:00 | Webinar 03 Wed10 |
| WED1830 | quarta (W) 18:30 | Webinar 04 Wed1830 |
| WED19 | quarta (W) 19:00 | Webinar 05 Live |
| THU09 | quinta (W+1) 09:00 | Webinar 06 Replay |
| FRI09 | sexta (W+2) 09:00 | Webinar 08 Offer |
| FRI20 | sexta (W+2) 20:00 | Webinar 09 LastCall |

## Estrutura

```
src/config.ts       constantes + lista dos 9 emails
src/time.ts         conversao de hora de parede Berlim -> UTC (DST correto)
src/schedule.ts     definicao da regua e calculo dos horarios-alvo
src/brevo.ts        cliente minimo da API do Brevo
src/worker.ts       loop principal (le contatos, decide, dispara, grava flags)
src/test-send.ts    envia 1 email de cada step para TEST_EMAIL
scripts/setup-brevo.ts   cria atributos + templates (idempotente)
scripts/check-time.ts    valida o calculo de horarios (sem Brevo)
brevo-templates.json     gerado pelo setup: step -> templateId
.github/workflows/worker.yml   cron a cada 15 min
```

## Pré-requisitos (você precisa garantir)

1. **API key nova do Brevo.** A antiga foi exposta; revogue-a. Gere uma nova em *Brevo > SMTP & API > API Keys* e coloque em `BREVO_API_KEY`.
2. **Publicar o app das 9 URLs de HTML** (Lovable). Enquanto elas retornarem 404, o setup para e avisa. Confira abrindo, por exemplo, `https://webinar.megamemory.online/email-exports/webinar-confirmation.html`.
3. **`DATA_WEBINAR` é automática.** O worker preenche sozinho: todo contato da lista 3 que não tiver `DATA_WEBINAR` recebe a **próxima quarta** (se hoje for quarta antes das 19h, conta como hoje; senão, a quarta seguinte). Você não precisa gravar essa data por lead. Se o seu cadastro já gravar `DATA_WEBINAR`, o worker respeita a data existente e não sobrescreve.

## Passo a passo

### 1. Instalar

```bash
cd webinar-mailer
npm install
cp .env.example .env
# edite o .env e preencha BREVO_API_KEY (e TEST_EMAIL)
```

Node 20+ (o worker de produção roda `node dist/src/worker.js`).

### 2. Conferir o cálculo de horários (opcional, não usa Brevo)

```bash
npm run check-time 2026-08-12
```

Mostra, para uma quarta dada, o instante de cada step em Berlim e em UTC. Bom para confirmar que o fuso e o horário de verão estão certos.

### 3. Rodar o setup (cria atributos e templates no Brevo)

Só funciona com as 9 URLs publicadas.

```bash
npm run setup
```

O que ele faz (idempotente, pode repetir):
- Cria os atributos `DATA_WEBINAR` (date), `CONFIRM_SENT_AT` (text) e `WSTEP_CONFIRM ... WSTEP_FRI20` (date).
- Para cada email: busca o HTML da URL e cria (ou atualiza, se já existir pelo nome) o template transacional.
- Grava `brevo-templates.json`. **Faça commit desse arquivo** (o worker no CI precisa dele).

### 4. Dry-run (NÃO dispara nada)

```bash
npm run dry-run
```

Lê os contatos e loga exatamente o que seria enviado, sem disparar e sem gravar flags. **Rode isto antes de ligar o cron** e confira o log. Em contatos antigos, espere ver CONFIRM planejado e steps passados marcados como "PULAR(atrasado)".

### 5. Teste de entrega (envia de verdade, só para você)

```bash
# TEST_EMAIL precisa estar no .env
npm run test-send
```

Manda 1 email de cada step para `TEST_EMAIL`. Valide o visual e o cabeçalho (SPF/DKIM/DMARC = pass). Observação: o token `{{ contact.FIRSTNAME }}` só é preenchido se o endereço for um contato no Brevo; num email de teste avulso ele pode sair em branco. Isso é esperado.

### 6. Ligar o cron (GitHub Actions, recomendado)

Escolhi **GitHub Actions** por ser grátis e sem servidor. O arquivo `.github/workflows/worker.yml` já roda a cada 15 min.

1. Suba o repositório no GitHub (com o `brevo-templates.json` commitado).
2. Em *Settings > Secrets and variables > Actions*, crie o secret **`BREVO_API_KEY`**.
3. Pronto. A aba **Actions** mostra as execuções. Dá para rodar manualmente em *Run workflow* (workflow_dispatch).

Observações:
- O agendador do GitHub Actions **pode atrasar** alguns minutos sob carga. A régua tolera isso (janela + skip de atrasados).
- A `AUTO_ROLLOVER` está fixada em `'0'` no workflow. Para ligar, mude para `'1'` lá.

#### Alternativa: VPS com node-cron + PM2

Se preferir um servidor que você já tem, em vez do GitHub Actions:

```bash
npm run build
# rode `node dist/src/worker.js` a cada 15 min via crontab do sistema:
#   */15 * * * * cd /caminho/webinar-mailer && BREVO_API_KEY=xxx node dist/src/worker.js >> worker.log 2>&1
# ou use PM2 com um wrapper que use node-cron. O worker em si ja e "one-shot" (roda e sai),
# entao o crontab do sistema costuma ser o mais simples.
```

Para trocar de uma opção para a outra: as duas chamam o mesmo `node dist/src/worker.js`; muda só quem agenda.

## Renovação semanal automática (`AUTO_ROLLOVER`)

Por padrão está **desligada** (`AUTO_ROLLOVER=0`), por segurança.

- **Desligada:** a régua roda uma vez por `DATA_WEBINAR`. Para a próxima semana, algo externo (o cadastro do lead, ou um processo seu) precisa atualizar `DATA_WEBINAR` para a próxima quarta.
- **Ligada (`1`):** depois que o `FRI20` de uma semana já passou, o worker avança sozinho a `DATA_WEBINAR` do contato para a quarta seguinte. Aí os flags deixam de bater e a régua recomeça (inclui reenviar o CONFIRM). Ligue só quando tiver certeza de que quer que **todo lead receba a régua toda semana, indefinidamente**.

## Segurança / limites

- A API key é lida de `process.env.BREVO_API_KEY`, nunca hardcoded e nunca logada.
- O serviço só altera os atributos `WSTEP_*`, `DATA_WEBINAR` e `CONFIRM_SENT_AT`. Não deleta contatos.
- Contatos com `emailBlacklisted` (unsub/blocklist) são pulados. A API transacional do Brevo também respeita a blocklist.
- Envio com atraso entre chamadas (`SEND_DELAY_MS`, padrão 150ms) para respeitar o rate limit.

## Nota de projeto: por que `CONFIRM_SENT_AT` é `text`

O WA precisa sair 3h depois do CONFIRM, então é preciso guardar o **horário** do envio do CONFIRM. Atributo de contato no Brevo não tem tipo "datetime" (só `date`, sem hora), então guardamos o timestamp ISO num atributo `text`. O `WSTEP_CONFIRM` (date) continua servindo à idempotência/renovação; o `CONFIRM_SENT_AT` serve só para o cálculo do WA.
