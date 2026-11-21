/**
 * Utilidades compartidas del catálogo de servicios de Skilly.
 * Los nombres de estado coinciden con las restricciones CHECK de la tabla `services`.
 */

export const SERVICE_CATEGORIES = [
  "Diseño",
  "Tecnología",
  "Marketing",
  "Finanzas",
  "Personas / RRHH",
  "Legal",
  "Administración",
  "Ventas",
  "Operaciones",
  "Otro",
] as const;

export type ServiceValidation =
  | "no_enviado"
  | "pendiente"
  | "en_revision"
  | "cambios_solicitados"
  | "propuesta_final"
  | "validado";

export type ServiceRow = {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  category: string;
  modality: "remoto" | "presencial" | "hibrido";
  price: number;
  duration_days: number;
  skills: string[];
  status: "borrador" | "activo" | "pausado";
  validation_status: ServiceValidation;
  suggested_price: number | null;
  validation_notes: string | null;
  created_at: string;
};

export const VALIDATION_LABEL: Record<ServiceValidation, { text: string; tone: string }> = {
  no_enviado: { text: "Borrador", tone: "bg-[#f1f2f6] text-[#6a6f80]" },
  pendiente: { text: "En espera de revisión", tone: "bg-[#fff4dd] text-[#a56a00]" },
  en_revision: { text: "Skilly lo está revisando", tone: "bg-[#e9f1ff] text-[#2f62c8]" },
  cambios_solicitados: { text: "Skilly solicita ajustes", tone: "bg-[#ffe9e4] text-[#c0442b]" },
  propuesta_final: { text: "Propuesta final: falta tu aceptación", tone: "bg-[#efe9ff] text-[#6543dc]" },
  validado: { text: "Publicado", tone: "bg-[#e7f8ef] text-[#2d875a]" },
};

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
