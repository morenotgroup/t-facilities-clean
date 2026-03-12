import { appendRow, readRange, uploadPhotoToDrive } from "./google";
import { env, SHEETS } from "./config";
import {
  Ambiente,
  CleaningLog,
  CleaningRouteInstance,
  Collaborator,
  PublicFeedback,
  RegisterCheckinInput,
  SessionPayload
} from "./types";
import { buildRoutesForDay, buildTimelineFor } from "./schedule";
import { formatDateTimeBr, formatTime, minutesBetween, normalizeText, slugify, toList, weekdayPt } from "./utils";

const DEFAULT_KIT_BY_CATEGORY: Record<string, string[]> = {
  "Circulação Externa": ["Vassoura de chão", "Pá", "Saco de lixo", "Mop pó", "Pulverizador multiuso"],
  Circulação: ["Vassoura de chão", "Pá", "Mop úmido", "Pano microfibra", "Saco de lixo"],
  Escritório: ["Pano microfibra", "Multiuso neutro", "Mop úmido", "Álcool 70% para pontos críticos", "Saco de lixo"],
  Operacional: ["Pano microfibra", "Mop úmido", "Lustramóvel", "Limpa vidro", "Saco de lixo"],
  Almoço: ["Touca descartável", "Avental", "Luvas de manipulação", "Pano limpo", "Álcool 70% para bancada"]
};

const DEFAULT_EPI_BY_CATEGORY: Record<string, string[]> = {
  "Circulação Externa": ["Luvas de proteção", "Calçado antiderrapante"],
  Circulação: ["Luvas de proteção", "Calçado antiderrapante"],
  Escritório: ["Luvas de proteção", "Calçado antiderrapante"],
  Operacional: ["Luvas de proteção", "Calçado antiderrapante", "Óculos de proteção em uso químico"],
  Almoço: ["Touca", "Avental", "Luvas adequadas à atividade", "Calçado antiderrapante"]
};

function durationByName(name: string) {
  const durations: Record<string, number> = {
    Estacionamento: 25,
    "Hall de Entrada": 15,
    "Corredor Principal": 18,
    "Corredor Sala de Reuniões": 12,
    "Sala de Reunião 1": 40,
    "Sala de Reunião 2": 40,
    Auditório: 24,
    "Sala Diretoria": 15,
    "Sala T.Venues": 15,
    "Sala T.Dreams - Estoque Bebidas": 15,
    "Sala Financeiro - Flávia": 14,
    "Sala Gente e Cultura": 15,
    "Backyard - Manhã": 22,
    "Backyard - Tarde": 24,
    "Banheiro PCD 1": 18,
    "Banheiro PCD 2": 18,
    "Corredor Carga e Descarga": 18,
    "Banheiro Masculino": 32,
    "Banheiro Feminino": 32,
    "Banheiro Masculino e Feminino - Reposição": 10,
    "Sala Financeiro - Paulo": 14,
    "Sala T.Youth": 18,
    PUB: 18,
    "Sala Criação T.Youth": 18,
    "Sala T.Brands 1": 14,
    "Sala T.Brands 2": 14,
    Salada: 25,
    "Montagem do Almoço": 35,
    "Reposição de Comida": 90,
    "Lavagem do Almoço": 40
  };

  return durations[name] || 18;
}

function tipsByCategory(category: string, ambienteNome: string) {
  const shared = [
    "Comece do ponto mais alto para o mais baixo, evitando recontaminar superfícies já tratadas.",
    "Faça remoção de pó e resíduos antes da etapa úmida.",
    "Use pano distinto para mobiliário e outro para piso/área molhada."
  ];

  if (ambienteNome.toLowerCase().includes("banheiro")) {
    return [
      "Verifique sabonete, papel higiênico, papel toalha e odor do ambiente antes de encerrar.",
      "Dê atenção reforçada a maçanetas, torneiras, descarga, cubas e divisórias.",
      "Em respingos ou matéria orgânica, primeiro remova a sujidade e só depois aplique o produto adequado."
    ];
  }

  if (category === "Almoço") {
    return [
      "Separe utensílios de manipulação e panos de apoio para evitar contaminação cruzada.",
      "Bancadas de apoio devem permanecer visualmente limpas durante todo o horário de almoço.",
      "Na desmontagem, priorize pia livre, utensílios secos e reposição organizada para o dia seguinte."
    ];
  }

  if (category === "Circulação Externa") {
    return [
      "Remova folhas e detritos antes de usar pano ou água em pontos localizados.",
      "Observe pontos de acúmulo junto a ralos, cantos e vagas.",
      "Em dias de vento forte, reforce uma varredura de revisão ao final."
    ];
  }

  return shared;
}

function riskByName(name: string) {
  if (name.toLowerCase().includes("banheiro")) return "alto";
  if (name.toLowerCase().includes("almoço") || name.toLowerCase().includes("salada")) return "alto";
  if (name.toLowerCase().includes("estoque")) return "médio";
  if (name.toLowerCase().includes("corredor") || name.toLowerCase().includes("hall")) return "médio";
  return "baixo";
}

function parseCollaborators(rows: string[][]): Collaborator[] {
  return rows
    .filter((row) => normalizeText(row[0]))
    .map((row) => {
      const type = normalizeText(row[4]);
      const name = normalizeText(row[1]);
      return {
        id: normalizeText(row[0]),
        displayName: name,
        email: normalizeText(row[2]).toLowerCase(),
        active: normalizeText(row[3]).toUpperCase() === "SIM",
        type,
        role: type.includes("LÍDER") || type.includes("LIDER") ? "leader" : "staff",
        accessToken: normalizeText(row[5])
      };
    });
}

function parseAmbientes(rows: string[][]): Ambiente[] {
  return rows
    .filter((row) => normalizeText(row[0]))
    .map((row) => {
      const categoria = normalizeText(row[15]) || "Operacional";
      const nome = normalizeText(row[1]);
      const slug = normalizeText(row[7]) || slugify(nome);
      return {
        ambienteId: normalizeText(row[0]),
        nomeAmbiente: nome,
        andar: normalizeText(row[2]),
        tipo: normalizeText(row[3]),
        acao: normalizeText(row[4]),
        itens: toList(row[5]).length ? toList(row[5]) : DEFAULT_KIT_BY_CATEGORY[categoria] || DEFAULT_KIT_BY_CATEGORY.Operacional,
        epi: toList(row[6]).length ? toList(row[6]) : DEFAULT_EPI_BY_CATEGORY[categoria] || DEFAULT_EPI_BY_CATEGORY.Operacional,
        slugQr: slug,
        frequencia: normalizeText(row[8]),
        diasAtivos: [
          normalizeText(row[9]) ? "SEG" : "",
          normalizeText(row[10]) ? "TER" : "",
          normalizeText(row[11]) ? "QUA" : "",
          normalizeText(row[12]) ? "QUI" : "",
          normalizeText(row[13]) ? "SEX" : ""
        ].filter(Boolean),
        active: normalizeText(row[14]).toUpperCase() === "SIM",
        categoria,
        responsavel: normalizeText(row[16]),
        tips: tipsByCategory(categoria, nome),
        durationMin: durationByName(nome),
        riskLabel: riskByName(nome)
      };
    });
}

async function getCollaborators() {
  return parseCollaborators(await readRange(SHEETS.collaborators));
}

async function getAmbientes() {
  return parseAmbientes(await readRange(SHEETS.ambientes));
}

async function getLogs(): Promise<CleaningLog[]> {
  const rows = await readRange(SHEETS.registros);
  return rows
    .filter((row) => normalizeText(row[0]))
    .map((row) => ({
      id: normalizeText(row[0]),
      createdAt: normalizeText(row[1]),
      collaboratorName: normalizeText(row[4]),
      collaboratorEmail: normalizeText(row[5]),
      ambienteNome: normalizeText(row[7]),
      ambienteSlug: normalizeText(row[6]),
      status: normalizeText(row[8]),
      startedAt: normalizeText(row[9]),
      finishedAt: normalizeText(row[10]),
      notes: normalizeText(row[12]),
      photoUrl: normalizeText(row[13])
    }));
}

async function getFeedbacks(): Promise<PublicFeedback[]> {
  const rows = await readRange(SHEETS.feedbacks);
  return rows
    .filter((row) => normalizeText(row[0]))
    .map((row) => ({
      id: normalizeText(row[0]),
      createdAt: normalizeText(row[1]),
      ambienteSlug: normalizeText(row[2]),
      ambienteNome: normalizeText(row[3]),
      tipo: normalizeText(row[4]),
      mensagem: normalizeText(row[5]),
      nome: normalizeText(row[6])
    }));
}

export async function findUserByCredentials(email: string, token: string) {
  const collaborators = await getCollaborators();

  return collaborators.find(
    (user) => user.active && user.email === email.toLowerCase() && user.accessToken === token
  );
}

function resolveCollaborator(session: SessionPayload, collaborators: Collaborator[]) {
  return collaborators.find((item) => item.email === session.email);
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function buildDashboardForSession(session: SessionPayload) {
  const [collaborators, ambientes, logs] = await Promise.all([getCollaborators(), getAmbientes(), getLogs()]);
  const collaborator = resolveCollaborator(session, collaborators);

  if (!collaborator) {
    throw new Error("Colaborador não encontrado.");
  }

  const routes = buildRoutesForDay({
    ambientes,
    collaborator,
    date: new Date()
  });

  const todayLogs = logs.filter(
    (log) => log.collaboratorEmail === session.email && log.startedAt.startsWith(todayIsoDate())
  );

  const completedIds = new Set(todayLogs.map((log) => `${log.ambienteSlug}-${log.status}`));
  const completedCount = todayLogs.length;
  const totalEstimatedMinutes = routes.reduce((acc, item) => acc + item.durationMin, 0);
  const progressPercent = routes.length ? Math.round((completedCount / routes.length) * 100) : 0;

  return {
    user: collaborator,
    routes,
    timeline: buildTimelineFor(collaborator),
    totalEstimatedMinutes,
    completedCount,
    progressPercent,
    completedIds
  };
}

export async function getRouteByInstanceForUser(session: SessionPayload, instanceId: string) {
  const [collaborators, ambientes] = await Promise.all([getCollaborators(), getAmbientes()]);
  const collaborator = resolveCollaborator(session, collaborators);

  if (!collaborator) return null;

  return buildRoutesForDay({
    ambientes,
    collaborator,
    date: new Date()
  }).find((route) => route.instanceId === instanceId);
}

export async function getRouteDetailForSession(session: SessionPayload, instanceId: string) {
  const route = await getRouteByInstanceForUser(session, instanceId);
  if (!route) return null;
  return { route };
}

export async function registerCheckin(input: RegisterCheckinInput) {
  const createdAt = new Date().toISOString();
  let photoUrl = "";

  if (input.file && input.file.size > 0 && env.driveFolderId) {
    const arrayBuffer = await input.file.arrayBuffer();
    const uploaded = await uploadPhotoToDrive({
      fileName: `${input.route.slugQr}-${Date.now()}.jpg`,
      mimeType: input.file.type || "image/jpeg",
      buffer: Buffer.from(arrayBuffer)
    });

    photoUrl = uploaded.webViewLink || uploaded.webContentLink || "";
  }

  const rowId = `REG-${Date.now()}`;
  const finalNotes = input.justification
    ? `${input.notes ? `${input.notes} | ` : ""}Justificativa: ${input.justification}`
    : input.notes;

  await appendRow("REGISTROS_LIMPEZA", [
    rowId,
    createdAt,
    todayIsoDate(),
    input.session.id,
    input.session.displayName,
    input.session.email,
    input.route.slugQr,
    input.route.ambienteNome,
    input.status,
    input.startedAt,
    input.finishedAt,
    String(minutesBetween(input.startedAt, input.finishedAt)),
    finalNotes,
    photoUrl
  ]);

  return { rowId, photoUrl };
}

export async function registerPublicFeedback({
  slug,
  tipo,
  mensagem,
  nome
}: {
  slug: string;
  tipo: string;
  mensagem: string;
  nome: string;
}) {
  const ambientes = await getAmbientes();
  const ambiente = ambientes.find((item) => item.slugQr === slug);

  await appendRow("FEEDBACK_AMBIENTES", [
    `FDB-${Date.now()}`,
    new Date().toISOString(),
    slug,
    ambiente?.nomeAmbiente || slug,
    tipo,
    mensagem,
    nome,
    "ABERTO"
  ]);
}

export async function getPublicEnvironmentStatus(slug: string) {
  const [ambientes, logs] = await Promise.all([getAmbientes(), getLogs()]);
  const ambiente = ambientes.find((item) => item.slugQr === slug);

  if (!ambiente) return null;

  const filtered = logs
    .filter((log) => log.ambienteSlug === slug)
    .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));

  const latest = filtered[0];
  const statusLabel =
    !latest
      ? "Aguardando primeira execução"
      : latest.status === "CONCLUIDA"
        ? "Limpeza registrada"
        : latest.status === "PENDENCIA"
          ? "Limpeza com pendência"
          : "Não realizada";

  return {
    ambiente: {
      nome: ambiente.nomeAmbiente,
      andar: ambiente.andar
    },
    latest: latest
      ? {
          ...latest,
          finishedAt: formatDateTimeBr(latest.finishedAt)
        }
      : null,
    statusLabel
  };
}

export async function buildLeaderDashboard() {
  const [collaborators, logs, feedbacks] = await Promise.all([getCollaborators(), getLogs(), getFeedbacks()]);
  const today = todayIsoDate();
  const todayLogs = logs.filter((log) => log.startedAt.startsWith(today));
  const activePeople = collaborators.filter((item) => item.active && item.role === "staff");

  const byPerson = activePeople.map((person) => {
    const personLogs = todayLogs.filter((log) => log.collaboratorEmail === person.email);
    const completed = personLogs.filter((log) => log.status === "CONCLUIDA").length;
    const issues = personLogs.filter((log) => log.status !== "CONCLUIDA").length;
    const total = personLogs.length || 1;
    return {
      name: person.displayName,
      completed,
      issues,
      rate: Math.round((completed / total) * 100)
    };
  });

  return {
    totals: {
      completed: todayLogs.filter((log) => log.status === "CONCLUIDA").length,
      issues: todayLogs.filter((log) => log.status !== "CONCLUIDA").length,
      feedbacks: feedbacks.filter((item) => item.createdAt.startsWith(today)).length,
      people: activePeople.length
    },
    byPerson,
    latestLogs: todayLogs
      .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1))
      .slice(0, 12)
      .map((log) => ({
        ...log,
        finishedAt: formatTime(log.finishedAt)
      })),
    feedbacks: feedbacks
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 8)
      .map((item) => ({
        ...item,
        createdAt: formatDateTimeBr(item.createdAt)
      }))
  };
}

export async function getRouteBySlug(slug: string) {
  const ambientes = await getAmbientes();
  return ambientes.find((item) => item.slugQr === slug) || null;
}
