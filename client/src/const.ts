export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/logo.svg";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Stage defaults
export const STAGE_DEFAULTS = {
  1: { nome: "1ª Etapa", pontos: 30 },
  2: { nome: "2ª Etapa", pontos: 35 },
  3: { nome: "3ª Etapa", pontos: 35 },
} as const;

// Behavior options
export const BEHAVIOR_OPTIONS = [
  { value: "Excelente", label: "Excelente", color: "behavior-excellent" },
  { value: "Ok", label: "Ok", color: "behavior-ok" },
  { value: "Inapropriado", label: "Inapropriado", color: "behavior-inappropriate" },
] as const;

// Validation messages (exact as specified)
export const MESSAGES = {
  STAGE_LIMIT_EXCEEDED: (current: number, max: number) =>
    `A soma das pontuações desta etapa ficaria ${current}/${max} e ultrapassa o limite.`,
  GRADE_INVALID: "A nota deve estar entre 0 e a pontuação máxima da atividade.",
  FREQUENCY_INVALID: "Frequência deve estar entre 0 e 100.",
  TRANSFER_SUCCESS: "Histórico preservado e matrícula anterior encerrada.",
} as const;

// Excel import column mapping
export const EXCEL_COLUMNS = {
  NOME: "A",
  NIVEL: "B",
  TURMA: "C",
  PROFESSOR: "D",
} as const;
