export type Role = "leader" | "staff";

export type SessionPayload = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
};

export type Collaborator = {
  id: string;
  displayName: string;
  email: string;
  active: boolean;
  type: string;
  role: Role;
  accessToken: string;
};

export type Ambiente = {
  ambienteId: string;
  nomeAmbiente: string;
  andar: string;
  tipo: string;
  acao: string;
  itens: string[];
  epi: string[];
  slugQr: string;
  frequencia: string;
  active: boolean;
  categoria: string;
  responsavel: string;
  diasAtivos: string[];
  tips: string[];
  durationMin: number;
  riskLabel: string;
};

export type CleaningRouteInstance = {
  instanceId: string;
  ambienteId: string;
  ambienteNome: string;
  slugQr: string;
  andar: string;
  categoria: string;
  frequencia: string;
  acao: string;
  itens: string[];
  epi: string[];
  tips: string[];
  turno: "MANHA" | "ALMOCO" | "TARDE" | "FLEX";
  durationMin: number;
  suggestedStart: string;
  suggestedEnd: string;
  riskLabel: string;
  ownerName: string;
};

export type RegisterCheckinInput = {
  session: SessionPayload;
  route: CleaningRouteInstance;
  status: string;
  notes: string;
  startedAt: string;
  finishedAt: string;
  justification: string;
  file: File | null;
};

export type CleaningLog = {
  id: string;
  createdAt: string;
  collaboratorName: string;
  collaboratorEmail: string;
  ambienteNome: string;
  ambienteSlug: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  notes: string;
  photoUrl: string;
};

export type PublicFeedback = {
  id: string;
  createdAt: string;
  ambienteSlug: string;
  ambienteNome: string;
  tipo: string;
  mensagem: string;
  nome: string;
};
