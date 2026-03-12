import { Ambiente, CleaningRouteInstance, Collaborator } from "./types";
import { addMinutesToTime, getWeekParity, weekdayPt } from "./utils";

type Window = "MANHA" | "ALMOCO" | "TARDE" | "FLEX";

type TimelineItem = {
  label: string;
  time: string;
  description: string;
};

function normalizeKey(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function personAliases(name: string) {
  const key = normalizeKey(name);

  if (key.includes("giulia")) {
    return ["giulia", "giulia costa", "giulia - mateus"];
  }

  if (key.includes("mateus")) {
    return ["mateus", "giulia - mateus"];
  }

  if (key.includes("bruno")) {
    return ["bruno", "bruno farias", "lider facilities", "lider"];
  }

  return [key];
}

const morningOrderMateus = [
  "Hall de Entrada",
  "Corredor Principal",
  "Corredor Sala de Reuniões",
  "Backyard - Manhã",
  "Banheiro PCD 1",
  "Banheiro PCD 2",
  "Sala de Reunião 1",
  "Sala de Reunião 2",
  "Auditório",
  "Sala Diretoria",
  "Sala T.Venues",
  "Sala T.Dreams - Estoque Bebidas",
  "Sala Financeiro - Flávia",
  "Sala Gente e Cultura"
];

const afternoonOrderMateus = [
  "Banheiro Masculino e Feminino - Reposição",
  "Sala de Reunião 1",
  "Sala de Reunião 2",
  "Banheiro PCD 1",
  "Banheiro PCD 2",
  "Estacionamento"
];

const morningOrderGiulia = [
  "Banheiro Masculino",
  "Banheiro Feminino",
  "Sala Financeiro - Paulo",
  "Sala T.Youth",
  "PUB",
  "Sala Criação T.Youth",
  "Sala T.Brands 1",
  "Sala T.Brands 2",
  "Corredor Carga e Descarga",
  "Estacionamento"
];

const lunchOrderGiulia = [
  "Salada",
  "Montagem do Almoço",
  "Reposição de Comida",
  "Lavagem do Almoço"
];

const afternoonOrderGiulia = [
  "Backyard - Tarde",
  "Banheiro Masculino",
  "Banheiro Feminino",
  "PUB",
  "Sala T.Youth",
  "Sala Criação T.Youth",
  "Sala T.Brands 1",
  "Sala T.Brands 2",
  "Estacionamento"
];

function isParkingTodayFor(collaboratorName: string, date: Date) {
  const parity = getWeekParity(date);
  const day = weekdayPt(date);

  const oddDistribution = {
    SEG: "giulia",
    QUA: "mateus",
    SEX: "giulia"
  } as const;

  const evenDistribution = {
    SEG: "mateus",
    QUA: "giulia",
    SEX: "mateus"
  } as const;

  const owner = parity === "odd" ? oddDistribution[day as keyof typeof oddDistribution] : evenDistribution[day as keyof typeof evenDistribution];

  if (!owner) return false;

  return personAliases(collaboratorName).includes(owner);
}

function isAssignedTo(ambiente: Ambiente, collaboratorName: string, date: Date) {
  const ambienteOwner = normalizeKey(ambiente.responsavel);
  const aliases = personAliases(collaboratorName);

  if (
    ambiente.nomeAmbiente === "Estacionamento" &&
    ambienteOwner.includes("giulia") &&
    ambienteOwner.includes("mateus")
  ) {
    return isParkingTodayFor(collaboratorName, date);
  }

  return aliases.some((alias) => ambienteOwner.includes(alias));
}

function splitPasses(ambiente: Ambiente): { duration: number; turno: Window }[] {
  if (["Salada", "Montagem do Almoço", "Reposição de Comida", "Lavagem do Almoço"].includes(ambiente.nomeAmbiente)) {
    return [{ duration: ambiente.durationMin, turno: "ALMOCO" }];
  }

  if (ambiente.nomeAmbiente === "Backyard - Manhã") {
    return [{ duration: ambiente.durationMin, turno: "MANHA" }];
  }

  if (ambiente.nomeAmbiente === "Backyard - Tarde") {
    return [{ duration: ambiente.durationMin, turno: "TARDE" }];
  }

  if (ambiente.frequencia === "2x_dia") {
    const firstPass = Math.max(10, Math.round(ambiente.durationMin / 2));
    const secondPass = Math.max(8, ambiente.durationMin - firstPass);

    return [
      { duration: firstPass, turno: "MANHA" },
      { duration: secondPass, turno: "TARDE" }
    ];
  }

  if (ambiente.nomeAmbiente.includes("Reposição")) {
    return [{ duration: ambiente.durationMin, turno: "FLEX" }];
  }

  return [{ duration: ambiente.durationMin, turno: "MANHA" }];
}

function buildSlotsFor(collaboratorName: string) {
  if (normalizeKey(collaboratorName).includes("giulia")) {
    return {
      MANHA: { start: "09:00", cursor: "09:00" },
      ALMOCO: { start: "11:30", cursor: "11:30" },
      TARDE: { start: "16:00", cursor: "16:00" },
      FLEX: { start: "17:10", cursor: "17:10" }
    };
  }

  return {
    MANHA: { start: "09:00", cursor: "09:00" },
    ALMOCO: { start: "12:00", cursor: "12:00" },
    TARDE: { start: "13:00", cursor: "13:00" },
    FLEX: { start: "16:00", cursor: "16:00" }
  };
}

function getRank(collaboratorName: string, ambienteNome: string, turno: Window) {
  const isGiulia = normalizeKey(collaboratorName).includes("giulia");

  let list = isGiulia ? morningOrderGiulia : morningOrderMateus;

  if (isGiulia && turno === "ALMOCO") list = lunchOrderGiulia;
  if (isGiulia && (turno === "TARDE" || turno === "FLEX")) list = afternoonOrderGiulia;
  if (!isGiulia && (turno === "TARDE" || turno === "FLEX")) list = afternoonOrderMateus;

  const index = list.indexOf(ambienteNome);
  return index === -1 ? 999 : index;
}

export function buildRoutesForDay({
  ambientes,
  collaborator,
  date
}: {
  ambientes: Ambiente[];
  collaborator: Collaborator;
  date: Date;
}) {
  const day = weekdayPt(date);
  const slots = buildSlotsFor(collaborator.displayName);
  const routeInstances: CleaningRouteInstance[] = [];

  const activeAmbientes = ambientes
    .filter((ambiente) => ambiente.active)
    .filter((ambiente) => ambiente.diasAtivos.includes(day))
    .filter((ambiente) => isAssignedTo(ambiente, collaborator.displayName, date));

  const staged = activeAmbientes.flatMap((ambiente) =>
    splitPasses(ambiente).map((pass, index) => ({
      ambiente,
      durationMin: pass.duration,
      turno: pass.turno,
      instanceKey: `${ambiente.ambienteId}-${pass.turno}-${index}`
    }))
  );

  staged.sort((a, b) => {
    const turnWeight = { MANHA: 1, ALMOCO: 2, TARDE: 3, FLEX: 4 };
    const first = turnWeight[a.turno];
    const second = turnWeight[b.turno];

    if (first !== second) return first - second;

    return (
      getRank(collaborator.displayName, a.ambiente.nomeAmbiente, a.turno) -
      getRank(collaborator.displayName, b.ambiente.nomeAmbiente, b.turno)
    );
  });

  for (const item of staged) {
    const slot = slots[item.turno];
    const start = slot.cursor;
    const end = addMinutesToTime(start, item.durationMin);
    slot.cursor = end;

    routeInstances.push({
      instanceId: `${collaborator.id}-${item.instanceKey}-${day}`,
      ambienteId: item.ambiente.ambienteId,
      ambienteNome: item.ambiente.nomeAmbiente,
      slugQr: item.ambiente.slugQr,
      andar: item.ambiente.andar,
      categoria: item.ambiente.categoria,
      frequencia: item.ambiente.frequencia,
      acao: item.ambiente.acao,
      itens: item.ambiente.itens,
      epi: item.ambiente.epi,
      tips: item.ambiente.tips,
      turno: item.turno,
      durationMin: item.durationMin,
      suggestedStart: start,
      suggestedEnd: end,
      riskLabel: item.ambiente.riskLabel,
      ownerName: collaborator.displayName
    });
  }

  return routeInstances;
}

export function buildTimelineFor(collaborator: Collaborator): TimelineItem[] {
  if (normalizeKey(collaborator.displayName).includes("giulia")) {
    return [
      {
        label: "Janela 1",
        time: "09:00 • 11:30",
        description: "Banheiros, salas designadas, circulação e preparação inicial das áreas sob responsabilidade da Giulia."
      },
      {
        label: "Janela 2",
        time: "11:30 • 15:30",
        description: "Salada, montagem, reposição e desmontagem/lavagem do almoço."
      },
      {
        label: "Pausa alimentar",
        time: "15:30 • 16:00",
        description: "Parada sugerida para preservar a janela principal do almoço."
      },
      {
        label: "Janela 3",
        time: "16:00 • 18:00",
        description: "Backyard da tarde, segundo giro de banheiros e refinamento final das áreas."
      }
    ];
  }

  return [
    {
      label: "Janela 1",
      time: "09:00 • 12:00",
      description: "Circulação, salas de reunião, auditório, Backyard da manhã e primeiro giro dos sanitários PCD."
    },
    {
      label: "Pausa alimentar",
      time: "12:00 • 12:30",
      description: "Intervalo alimentar sugerido."
    },
    {
      label: "Janela 2",
      time: "13:00 • 18:00",
      description: "Reposição, segundo giro dos pontos críticos e apoio nas rotinas alternadas, incluindo estacionamento em dias definidos."
    }
  ];
}
