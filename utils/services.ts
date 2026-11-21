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

/** Estados del ciclo de revisión curada de un servicio (restricción CHECK de `validation_status`). */
export type ServiceValidation =
  | "no_enviado"
  | "pendiente"
  | "en_revision"
  | "cambios_solicitados"
  | "propuesta_final"
  | "validado";

/** Fila de la tabla `services` tal como la devuelve Supabase (nombres en inglés, como en la base). */
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

/**
 * Texto y clases de color (Tailwind) con que la interfaz muestra cada estado
 * de validación del servicio. Es un `Record` completo: si se agrega un estado
 * a `ServiceValidation`, TypeScript obliga a agregarlo aquí también.
 */
export const VALIDATION_LABEL: Record<ServiceValidation, { text: string; tone: string }> = {
  no_enviado: { text: "Borrador", tone: "bg-[#f1f2f6] text-[#6a6f80]" },
  pendiente: { text: "En espera de revisión", tone: "bg-[#fff4dd] text-[#a56a00]" },
  en_revision: { text: "Skilly lo está revisando", tone: "bg-[#e9f1ff] text-[#2f62c8]" },
  cambios_solicitados: { text: "Skilly solicita ajustes", tone: "bg-[#ffe9e4] text-[#c0442b]" },
  propuesta_final: { text: "Propuesta final: falta tu aceptación", tone: "bg-[#efe9ff] text-[#6543dc]" },
  validado: { text: "Publicado", tone: "bg-[#e7f8ef] text-[#2d875a]" },
};

/**
 * Da formato de peso chileno (CLP, sin decimales) a un monto.
 *
 * @param value - Monto en pesos. `null` o `undefined` indican que aún no hay valor.
 * @returns El monto formateado (por ejemplo `$150.000`) o `"-"` si no hay valor.
 * @example
 * formatMoney(150000); // "$150.000"
 * formatMoney(null);   // "-"
 */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Extrae un mensaje legible de un error de tipo desconocido.
 *
 * Supabase y `fetch` pueden devolver objetos, textos u otros valores, y en
 * TypeScript estricto el `catch` entrega `unknown`. Esta función evita acceder
 * a `.message` sin comprobar el tipo.
 *
 * @param err - Valor capturado en un `catch` o devuelto como `error` por Supabase.
 * @param fallback - Texto que se usa si el error no trae un mensaje válido.
 * @returns El mensaje del error si es un texto no vacío; si no, `fallback`.
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
