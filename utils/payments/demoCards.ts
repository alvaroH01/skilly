/**
 * Tarjetas de demostración del checkout de Skilly.
 *
 * El checkout es un ENTORNO DE DEMOSTRACIÓN: solo acepta las tarjetas de prueba
 * publicadas por Transbank para su ambiente de integración. Cualquier otro
 * número se rechaza, de modo que una tarjeta real nunca se procesa ni se guarda.
 */

export type CardKind = "credito" | "debito";

export type DemoCard = {
  /** Número de tarjeta sin espacios. */
  number: string;
  brand: "Visa" | "Mastercard" | "American Express" | "Redcompra";
  kind: CardKind;
  outcome: "aprobada" | "rechazada";
  /** CVV exigido (solo crédito). */
  cvv?: string;
  /** Texto corto para los botones de la interfaz. */
  label: string;
};

export const DEMO_CARDS: readonly DemoCard[] = [
  { number: "4051885600446623", brand: "Visa", kind: "credito", outcome: "aprobada", cvv: "123", label: "Visa crédito · aprobada" },
  { number: "370000000002032", brand: "American Express", kind: "credito", outcome: "aprobada", cvv: "1234", label: "Amex crédito · aprobada" },
  { number: "5186059559590568", brand: "Mastercard", kind: "credito", outcome: "rechazada", cvv: "123", label: "Mastercard crédito · rechazada" },
  { number: "4051884239937763", brand: "Redcompra", kind: "debito", outcome: "aprobada", label: "Redcompra débito · aprobada" },
  { number: "5186008541233829", brand: "Redcompra", kind: "debito", outcome: "rechazada", label: "Redcompra débito · rechazada" },
];

/** Deja solo los dígitos de un texto. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Algoritmo de Luhn: valida el dígito verificador de un número de tarjeta. */
export function luhnValid(number: string): boolean {
  if (!/^\d{13,19}$/.test(number)) return false;
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Da formato visual al número: grupos de 4 (American Express: 4-6-5). */
export function formatCardNumber(value: string): string {
  const d = digitsOnly(value).slice(0, 19);
  if (/^3[47]/.test(d)) {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return d.replace(/(.{4})/g, "$1 ").trim();
}

/** Da formato MM/AA a la fecha de vencimiento mientras se escribe. */
export function formatExpiry(value: string): string {
  const d = digitsOnly(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Comprueba que la fecha MM/AA sea válida y del mes actual o posterior. */
export function isFutureExpiry(value: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export type CardInput = {
  number: string;
  expiry: string;
  cvv: string;
  kind: CardKind;
};

export type CardEvaluation =
  | { ok: true; card: DemoCard; last4: string }
  | { ok: false; status: number; error: string };

/**
 * Evalúa una tarjeta ingresada contra la lista de tarjetas de demostración.
 *
 * Orden de las reglas: formato (Luhn), tarjeta de demostración, tipo
 * (crédito/débito), vencimiento y CVV (solo crédito) y, al final, el resultado
 * que simula el emisor (aprobada o rechazada).
 */
export function evaluateDemoCard(input: CardInput): CardEvaluation {
  const number = digitsOnly(input.number);

  if (!luhnValid(number)) {
    return { ok: false, status: 422, error: "El número de tarjeta no es válido." };
  }

  const card = DEMO_CARDS.find((c) => c.number === number);
  if (!card) {
    return {
      ok: false,
      status: 422,
      error:
        "Esta plataforma está en modo demostración: solo acepta las tarjetas de prueba indicadas. No ingreses tarjetas reales.",
    };
  }

  if (card.kind !== input.kind) {
    return {
      ok: false,
      status: 422,
      error: `La tarjeta ingresada es de ${card.kind === "credito" ? "crédito" : "débito"}. Selecciona el tipo de tarjeta correcto.`,
    };
  }

  if (card.kind === "credito") {
    if (!isFutureExpiry(input.expiry)) {
      return { ok: false, status: 422, error: "La fecha de vencimiento no es válida o la tarjeta ya venció." };
    }
    if (digitsOnly(input.cvv) !== card.cvv) {
      return { ok: false, status: 422, error: "El código de seguridad (CVV) no es correcto." };
    }
  }

  if (card.outcome === "rechazada") {
    return {
      ok: false,
      status: 402,
      error: "Pago rechazado por el emisor de la tarjeta (tarjeta de prueba de rechazo). Intenta con otra tarjeta.",
    };
  }

  return { ok: true, card, last4: number.slice(-4) };
}
