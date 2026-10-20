/**
 * Integracao do Supabase com o Google Drive, rodando sozinha a cada hora:
 *
 * - `sincronizar`: um Google Doc por sessao, com a transcricao pura (sem
 *   correcao) de cada resposta valida, na ordem da Forma A. Le a Edge Function
 *   `export-transcriptions`. Sessoes novas viram Docs novos; um Doc so e
 *   reescrito quando a sessao muda no banco. Docs que ja estao na pasta e citam
 *   "Sessão <uuid>" sao adotados em vez de duplicados e ficam como estao: nada
 *   que a equipe tenha editado neles e sobrescrito.
 * - `fazerBackup`: copia de seguranca fora do Supabase. Le a Edge Function
 *   `backup-export` e grava as tabelas do app (um JSON por dia em banco/) e
 *   cada audio do bucket (audios/<participante>/<sessao>/), so os que faltam.
 *
 * Instalacao (uma vez), em https://script.google.com com a conta dona das pastas:
 *   1. Novo projeto; cole este arquivo no lugar de Code.gs.
 *   2. Configuracoes do projeto > Propriedades do script:
 *        EXPORT_URL        https://<ref>.supabase.co/functions/v1/export-transcriptions
 *        EXPORT_SECRET     o mesmo valor do secret EXPORT_SECRET das funcoes
 *        FOLDER_ID         id da pasta dos Docs (o trecho da URL depois de /folders/);
 *                          hoje: 180xi4lj-BR6GR1GMzIQCYJU8t4_ZtZ8e, "01 - Transcrições originais"
 *        BACKUP_FOLDER_ID  id da pasta do backup
 *   3. Execute `instalar` e autorize. Ele agenda as duas rotinas e roda a
 *      sincronizacao. O primeiro backup roda na hora seguinte, ou execute
 *      `fazerBackup` na mao.
 */

const SYNC_HANDLER = 'sincronizar';
const BACKUP_HANDLER = 'fazerBackup';
// O Apps Script corta a execucao em 6 minutos: o backup para antes e continua
// na proxima hora, de onde parou.
const EXECUTION_STARTED_AT = Date.now();
const BACKUP_TIME_BUDGET_MS = 4.5 * 60 * 1000;
const BACKUP_BATCH_SIZE = 50;
const BACKUP_MANIFEST = 'manifesto-audios.json';
const SESSION_KEY_PREFIX = 'sessao:';
const TIME_ZONE = 'America/Sao_Paulo';
// Mude quando o layout do Doc mudar: todos os Docs sao reescritos.
const LAYOUT_VERSION = 1;
const SESSION_ID_PATTERN = /Sessão ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;

function instalar() {
  lerConfig_(['EXPORT_URL', 'EXPORT_SECRET', 'FOLDER_ID', 'BACKUP_FOLDER_ID']);
  ScriptApp.getProjectTriggers()
    .filter((trigger) => [SYNC_HANDLER, BACKUP_HANDLER].indexOf(trigger.getHandlerFunction()) >= 0)
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger(SYNC_HANDLER).timeBased().everyHours(1).create();
  ScriptApp.newTrigger(BACKUP_HANDLER).timeBased().everyHours(1).create();
  sincronizar();
}

function sincronizar() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    console.log('Outra sincronizacao em andamento; nada a fazer.');
    return;
  }
  try {
    const config = lerConfig_(['EXPORT_URL', 'EXPORT_SECRET', 'FOLDER_ID']);
    const folder = DriveApp.getFolderById(config.FOLDER_ID);
    const properties = PropertiesService.getScriptProperties();
    const registry = lerRegistro_(properties);
    adotarDocsDaPasta_(folder, registry, properties);

    const payload = buscarTranscricoes_(config);
    const sessionsPerParticipant = {};
    payload.sessions.forEach((session) => {
      const key = session.participant_id || session.session_id;
      sessionsPerParticipant[key] = (sessionsPerParticipant[key] || 0) + 1;
    });

    const counts = { criados: 0, atualizados: 0, adotados: 0, sem_mudanca: 0, aguardando: 0 };
    payload.sessions.forEach((session) => {
      if (!session.ready) {
        counts.aguardando += 1;
        return;
      }
      const repeated = sessionsPerParticipant[session.participant_id || session.session_id] > 1;
      const title = tituloDoDoc_(session, payload.form, repeated);
      const hash = resumo_(session, title);
      const entry = registry[session.session_id];
      const existing = entry && docAtivo_(entry.docId);
      if (existing && entry.hash === '') {
        // Doc que ja estava na pasta: vale como esta. So muda se a sessao mudar.
        registry[session.session_id] = { docId: entry.docId, hash: hash };
        properties.setProperty(SESSION_KEY_PREFIX + session.session_id, JSON.stringify(registry[session.session_id]));
        counts.adotados += 1;
        return;
      }
      if (existing && entry.hash === hash) {
        counts.sem_mudanca += 1;
        return;
      }

      const doc = existing ? DocumentApp.openById(entry.docId) : criarDoc_(folder, title);
      escreverDoc_(doc, session, payload.form, title);
      registry[session.session_id] = { docId: doc.getId(), hash: hash };
      properties.setProperty(SESSION_KEY_PREFIX + session.session_id, JSON.stringify(registry[session.session_id]));
      counts[existing ? 'atualizados' : 'criados'] += 1;
    });
    console.log(JSON.stringify(counts));
  } finally {
    lock.releaseLock();
  }
}

function fazerBackup() {
  // Trava propria: o backup pode levar minutos e nao deve barrar a sincronizacao.
  const lock = LockService.getUserLock();
  if (!lock.tryLock(1000)) {
    console.log('Outro backup em andamento; nada a fazer.');
    return;
  }
  try {
    const config = lerConfig_(['EXPORT_URL', 'EXPORT_SECRET', 'BACKUP_FOLDER_ID']);
    const backupUrl = config.EXPORT_URL.replace(/export-transcriptions\/?$/, 'backup-export');
    const root = DriveApp.getFolderById(config.BACKUP_FOLDER_ID);

    // 1. Tabelas: um arquivo por dia, substituido a cada execucao do dia.
    const dump = chamarBackup_(config, backupUrl + '?part=tables');
    const day = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd');
    salvarJson_(pasta_(root, 'banco'), 'banco-' + day + '.json', dump);

    // 2. Audios: o manifesto lista o que ja foi copiado; arquivos do bucket
    // nunca mudam (o upload nao sobrescreve), entao basta copiar os novos.
    const listing = chamarBackup_(config, backupUrl + '?part=files');
    const manifestFile = arquivoUnico_(root, BACKUP_MANIFEST);
    const copied = manifestFile ? JSON.parse(manifestFile.getBlob().getDataAsString()) : {};
    const missing = listing.files.filter((file) => !copied[file.path]);
    const audios = pasta_(root, 'audios');
    let copiedNow = 0;
    let failed = 0;
    for (let start = 0; start < missing.length; start += BACKUP_BATCH_SIZE) {
      if (Date.now() - EXECUTION_STARTED_AT > BACKUP_TIME_BUDGET_MS) break;
      const batch = missing.slice(start, start + BACKUP_BATCH_SIZE);
      const signed = chamarBackup_(config, backupUrl + '?part=urls', { paths: batch.map((file) => file.path) });
      const ready = signed.urls.filter((item) => item.url);
      const downloads = UrlFetchApp.fetchAll(ready.map((item) => ({ url: item.url, muteHttpExceptions: true })));
      downloads.forEach((response, index) => {
        const path = ready[index].path;
        if (response.getResponseCode() !== 200) {
          failed += 1;
          return;
        }
        const parts = path.split('/');
        const name = parts.pop();
        const folder = parts.reduce((parent, part) => pasta_(parent, part), audios);
        if (!folder.getFilesByName(name).hasNext()) folder.createFile(response.getBlob().setName(name));
        copied[path] = batch.find((file) => file.path === path).size;
        copiedNow += 1;
      });
      failed += batch.length - ready.length;
      salvarJson_(root, BACKUP_MANIFEST, copied);
    }
    console.log(JSON.stringify({
      tabelas: Object.keys(dump.tables).map((name) => name + ':' + dump.tables[name].length).join(' '),
      audios_no_bucket: listing.files.length,
      copiados_agora: copiedNow,
      falhas: failed,
      faltando: missing.length - copiedNow,
    }));
  } finally {
    lock.releaseLock();
  }
}

function chamarBackup_(config, url, body) {
  const options = { headers: { 'x-export-secret': config.EXPORT_SECRET }, muteHttpExceptions: true };
  if (body) {
    options.method = 'post';
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  const response = UrlFetchApp.fetch(url, options);
  const status = response.getResponseCode();
  if (status !== 200) {
    throw new Error('backup-export respondeu HTTP ' + status + ': ' + response.getContentText().slice(0, 200));
  }
  return JSON.parse(response.getContentText());
}

const folderCache_ = {};

function pasta_(parent, name) {
  const key = parent.getId() + '/' + name;
  if (!folderCache_[key]) {
    const found = parent.getFoldersByName(name);
    folderCache_[key] = found.hasNext() ? found.next() : parent.createFolder(name);
  }
  return folderCache_[key];
}

function arquivoUnico_(folder, name) {
  const found = folder.getFilesByName(name);
  return found.hasNext() ? found.next() : null;
}

// Grava a versao nova antes de descartar a antiga: uma falha no meio nunca
// deixa a pasta sem o arquivo.
function salvarJson_(folder, name, value) {
  const previous = [];
  const found = folder.getFilesByName(name);
  while (found.hasNext()) previous.push(found.next());
  folder.createFile(Utilities.newBlob(JSON.stringify(value), 'application/json', name));
  previous.forEach((file) => file.setTrashed(true));
}

function lerConfig_(names) {
  const properties = PropertiesService.getScriptProperties();
  const config = {};
  names.forEach((name) => {
    const value = (properties.getProperty(name) || '').trim();
    if (!value) throw new Error('Defina a propriedade do script ' + name + ' (Configuracoes do projeto).');
    config[name] = value;
  });
  return config;
}

function lerRegistro_(properties) {
  const registry = {};
  const all = properties.getProperties();
  Object.keys(all).forEach((key) => {
    if (key.indexOf(SESSION_KEY_PREFIX) !== 0) return;
    try {
      registry[key.slice(SESSION_KEY_PREFIX.length)] = JSON.parse(all[key]);
    } catch (error) {
      properties.deleteProperty(key);
    }
  });
  return registry;
}

// Registra Docs da pasta que ainda nao estao no registro (por exemplo, os
// exportados a mao antes da integracao). Hash vazio: na primeira sincronizacao
// o hash da sessao e gravado sem reescrever o Doc.
function adotarDocsDaPasta_(folder, registry, properties) {
  const knownDocs = {};
  Object.keys(registry).forEach((sessionId) => {
    knownDocs[registry[sessionId].docId] = true;
  });
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  while (files.hasNext()) {
    const file = files.next();
    if (knownDocs[file.getId()]) continue;
    const match = SESSION_ID_PATTERN.exec(DocumentApp.openById(file.getId()).getBody().getText());
    if (!match) continue;
    const sessionId = match[1];
    if (registry[sessionId] && docAtivo_(registry[sessionId].docId)) continue;
    registry[sessionId] = { docId: file.getId(), hash: '' };
    properties.setProperty(SESSION_KEY_PREFIX + sessionId, JSON.stringify(registry[sessionId]));
  }
}

function buscarTranscricoes_(config) {
  const response = UrlFetchApp.fetch(config.EXPORT_URL, {
    method: 'get',
    headers: { 'x-export-secret': config.EXPORT_SECRET },
    muteHttpExceptions: true,
  });
  const status = response.getResponseCode();
  if (status !== 200) {
    throw new Error('export-transcriptions respondeu HTTP ' + status + ': ' + response.getContentText().slice(0, 200));
  }
  return JSON.parse(response.getContentText());
}

function docAtivo_(docId) {
  try {
    return !DriveApp.getFileById(docId).isTrashed();
  } catch (error) {
    return false;
  }
}

function criarDoc_(folder, title) {
  const doc = DocumentApp.create(title);
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  return doc;
}

function nomeDoParticipante_(session) {
  return session.participant_name || 'Participante sem cadastro ' + String(session.participant_id || session.session_id).slice(0, 8);
}

function dataDaSessao_(session) {
  return Utilities.formatDate(new Date(session.started_at), TIME_ZONE, 'dd/MM/yyyy');
}

function tituloDoDoc_(session, form, repeated) {
  const title = 'P01 — Forma ' + form + ' — Transcrição — ' + nomeDoParticipante_(session);
  return repeated ? title + ' (' + dataDaSessao_(session) + ')' : title;
}

function resumo_(session, title) {
  const content = JSON.stringify([LAYOUT_VERSION, title, session.started_at, session.items]);
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, content, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(digest);
}

function textoDaResposta_(item) {
  if (item.status === 'failed') return '[transcrição falhou]';
  const text = (item.text || '').trim();
  return text || '[áudio sem fala reconhecida]';
}

function escreverDoc_(doc, session, form, title) {
  doc.setName(title);
  const body = doc.getBody();
  body.clear();
  const heading = DocumentApp.ParagraphHeading;

  paragrafo_(body.getParagraphs()[0], nomeDoParticipante_(session), heading.HEADING1, false);
  paragrafo_(
    body.appendParagraph(''),
    'Sessão ' + session.session_id + ', iniciada em ' + dataDaSessao_(session) + '. ' +
      session.answers + ' respostas da Forma ' + form + ', na ordem da avaliação.',
    heading.NORMAL,
    false,
  );
  paragrafo_(
    body.appendParagraph(''),
    'Transcrição pura: saída do reconhecimento de fala (Groq, whisper-large-v3-turbo), sem correção. ' +
      'Pode conter erros de reconhecimento.',
    heading.NORMAL,
    true,
  );

  let currentBlock = null;
  session.items.forEach((item) => {
    if (item.block !== currentBlock) {
      currentBlock = item.block;
      paragrafo_(body.appendParagraph(''), item.block.replace(' — ', ': '), heading.HEADING2, false);
    }
    paragrafo_(body.appendParagraph(''), item.question_id, heading.HEADING3, false);
    paragrafo_(body.appendParagraph(''), textoDaResposta_(item), heading.NORMAL, false);
  });
  doc.saveAndClose();
}

// Define texto, estilo e italico de forma explicita: paragrafos novos herdam a
// formatacao do anterior.
function paragrafo_(paragraph, text, style, italic) {
  paragraph.setText(text);
  paragraph.setHeading(style);
  paragraph.editAsText().setItalic(italic);
  return paragraph;
}
