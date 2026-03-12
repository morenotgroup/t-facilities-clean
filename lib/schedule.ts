import { Ambiente, CleaningRouteInstance, Collaborator } from "./types";
import { addMinutesToTime, getWeekParity, weekdayPt } from "./utils";

type Window = "MANHA" | "ALMOCO" | "TARDE" | "FLEX";

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

function isAssignedTo(ambiente: Ambiente, collaboratorName: string, date: Date) {
  if (ambiente.responsavel === collaboratorName) return true;

  if (ambiente.nomeAmbiente === "Estacionamento" && ambiente.responsavel.includes("Giulia") && ambiente.responsavel.includes("Mateus")) {
    const parity = getWeekParity(date);
    const day = weekdayPt(date);

    const distribution =
      parity === "odd"
        ? { SEG: "Giulia", QUA: "Mateus", SEX: "Giulia" }
        : { SEG: "Mateus", QUA: "Giulia", SEX: "Mateus" };

    return distribution[day as keyof typeof distribution] === collaboratorName;
  }

  return false;
}

function splitPasses(ambiente: Ambiente): { duration: number; turno: Window }[] {
  if (ambiente.nomeAmbiente === "Salada") return [{ duration: ambiente.durationMin, turno: "ALMOCO" }];
  if (ambiente.nomeAmbiente === "Montagem do Almoço") return [{ duration: ambiente.durationMin, turno: "ALMOCO" }];
  if (ambiente.nomeAmbiente === "Reposição de Comida") return [{ duration: ambiente.durationMin, turno: "ALMOCO" }];
  if (ambiente.nomeAmbiente === "Lavagem do Almoço") return [{ duration: ambiente.durationMin, turno: "ALMOCO" }];

  if (ambiente.nomeAmbiente === "Backyard - Manhã") return [{ duration: ambiente.durationMin, turno: "MANHA" }];
  if (ambiente.nomeAmbiente === "Backyard - Tarde") return [{ duration: ambiente.durationMin, turno: "TARDE" }];

  if (ambiente.frequencia === "2x_dia") {
    const half = Math.round(ambiente.durationMin / 2);
    return [
      { duration: half, turno: "MANHA" },
      { duration: ambiente.durationMin - half, turno: "TARDE" }
    ];
  }

  if (ambiente.nomeAmbiente.includes("Reposição")) return [{ duration: ambiente.durationMin, turno: "FLEX" }];

  return [{ duration: ambiente.durationMin, turno: "MANHA" }];
}

function buildSlotsFor(collaboratorName: string) {
  if (collaboratorName === "Giulia Costa") {
    return {
      MANHA: { start: "09:00", cursor: "09:00" },
      ALMOCO: { start: "11:30", cursor: "11:30" },
      TARDE: { start: "15:30", cursor: "15:30" },
      FLEX: { start: "16:40", cursor: "16:40" }
    };
  }

  return {
    MANHA: { start: "09:00", cursor: "09:00" },
    ALMOCO: { start: "12:40", cursor: "12:40" },
    TARDE: { start: "13:30", cursor: "13:30" },
    FLEX: { start: "15:30", cursor: "15:30" }
  };
}

function getRank(collaboratorName: string, ambienteNome: string, turno: Window) {
  const list =
    collaboratorName === "Giulia Costa"
      ? turno === "TARDE"
        ? afternoonOrderGiulia
        : morningOrderGiulia
      : turno === "TARDE" || turno === "FLEX"
        ? afternoonOrderMateus
        : morningOrderMateus;

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
    return getRank(collaborator.displayName, a.ambiente.nomeAmbiente, a.turno) - getRank(collaborator.displayName, b.ambiente.nomeAmbiente, b.turno);
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

export function buildTimelineFor(collaborator: Collaborator) {
  if (collaborator.displayName === "Giulia Costa") {
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
        description: "Ajuste sugerido para preservar a janela principal do almoço."
      },
      {
        label: "Janela 3",
        time: "16:00 • 18:00",
        description: "Backyard da tarde, segundo giro de banheiros e refinamento das salas."
      }
    ];
  }

  return [
    {
      label: "Janela 1",
      time: "09:00 • 12:40",
      description: "Ambientes de circulação, salas de reunião, pátio/Backyard da manhã e primeiro giro dos sanitários PCD."
    },
    {
      label: "Pausa alimentar",
      time: "12:40 • 13:10",
      description: "Parada sugerida sem comprometer a reposição de áreas críticas."
    },
    {
      label: "Janela 2",
      time: "13:10 • 18:00",
      description: "Reposição de insumos, segundo giro dos ambientes críticos e apoio nas rotinas alternadas."
    }
  ];
}
