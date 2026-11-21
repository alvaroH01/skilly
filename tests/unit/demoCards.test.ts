/**
 * Pruebas unitarias de utils/payments/demoCards.ts.
 *
 * Se ejecutan con el ejecutor de pruebas incluido en Node (`npm test`), sin
 * dependencias adicionales. Cubren la validación de tarjetas del checkout
 * simulado: algoritmo de Luhn, formato, vencimiento y reglas de evaluación.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_CARDS,
  digitsOnly,
  luhnValid,
  formatCardNumber,
  formatExpiry,
  isFutureExpiry,
  evaluateDemoCard,
} from "../../utils/payments/demoCards.ts";

const VISA_OK = DEMO_CARDS[0]; // Visa crédito aprobada
const MC_RECHAZO = DEMO_CARDS[2]; // Mastercard crédito rechazada
const REDCOMPRA_OK = DEMO_CARDS[3]; // Redcompra débito aprobada
const FECHA_REF = new Date(2026, 10, 21); // 21 de noviembre de 2026

test("digitsOnly deja solo dígitos", () => {
  assert.equal(digitsOnly("4051 8856-0044 6623"), "4051885600446623");
  assert.equal(digitsOnly("abc"), "");
});

test("luhnValid acepta las tarjetas de demostración", () => {
  for (const card of DEMO_CARDS) assert.equal(luhnValid(card.number), true, card.label);
});

test("luhnValid rechaza un dígito verificador incorrecto", () => {
  assert.equal(luhnValid("4051885600446624"), false);
});

test("luhnValid rechaza largos y caracteres inválidos", () => {
  assert.equal(luhnValid("123"), false);
  assert.equal(luhnValid("4051 8856 0044 6623"), false);
  assert.equal(luhnValid(""), false);
});

test("formatCardNumber agrupa de a 4 y American Express en 4-6-5", () => {
  assert.equal(formatCardNumber("4051885600446623"), "4051 8856 0044 6623");
  assert.equal(formatCardNumber("370000000002032"), "3700 000000 02032");
});

test("formatExpiry agrega la barra después del mes", () => {
  assert.equal(formatExpiry("1230"), "12/30");
  assert.equal(formatExpiry("12"), "12");
  assert.equal(formatExpiry("12/3"), "12/3");
});

test("isFutureExpiry: mes actual es válido y el anterior no (valor límite)", () => {
  assert.equal(isFutureExpiry("11/26", FECHA_REF), true);
  assert.equal(isFutureExpiry("10/26", FECHA_REF), false);
  assert.equal(isFutureExpiry("01/27", FECHA_REF), true);
});

test("isFutureExpiry rechaza meses y formatos inválidos", () => {
  assert.equal(isFutureExpiry("13/30", FECHA_REF), false);
  assert.equal(isFutureExpiry("00/30", FECHA_REF), false);
  assert.equal(isFutureExpiry("1230", FECHA_REF), false);
  assert.equal(isFutureExpiry("", FECHA_REF), false);
});

test("evaluateDemoCard aprueba una tarjeta de crédito de prueba", () => {
  const r = evaluateDemoCard({ number: VISA_OK.number, expiry: "12/30", cvv: "123", kind: "credito" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.last4, "6623");
});

test("evaluateDemoCard aprueba una tarjeta de débito sin CVV ni vencimiento", () => {
  const r = evaluateDemoCard({ number: REDCOMPRA_OK.number, expiry: "", cvv: "", kind: "debito" });
  assert.equal(r.ok, true);
});

test("evaluateDemoCard rechaza un número que no pasa Luhn con 422", () => {
  const r = evaluateDemoCard({ number: "4051885600446624", expiry: "12/30", cvv: "123", kind: "credito" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 422);
});

test("evaluateDemoCard rechaza una tarjeta real o desconocida con 422", () => {
  // Número válido por Luhn que no está en la lista de tarjetas de prueba.
  const r = evaluateDemoCard({ number: "4111111111111111", expiry: "12/30", cvv: "123", kind: "credito" });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.status, 422);
    assert.match(r.error, /demostraci/);
  }
});

test("evaluateDemoCard rechaza si el tipo (crédito/débito) no coincide", () => {
  const r = evaluateDemoCard({ number: VISA_OK.number, expiry: "12/30", cvv: "123", kind: "debito" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 422);
});

test("evaluateDemoCard rechaza un CVV incorrecto y un vencimiento pasado", () => {
  const cvv = evaluateDemoCard({ number: VISA_OK.number, expiry: "12/30", cvv: "999", kind: "credito" });
  assert.equal(cvv.ok, false);
  const venc = evaluateDemoCard({ number: VISA_OK.number, expiry: "01/20", cvv: "123", kind: "credito" });
  assert.equal(venc.ok, false);
});

test("evaluateDemoCard devuelve 402 con la tarjeta de rechazo del emisor", () => {
  const r = evaluateDemoCard({ number: MC_RECHAZO.number, expiry: "12/30", cvv: "123", kind: "credito" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 402);
});

test("evaluateDemoCard no lanza con entradas vacías", () => {
  assert.doesNotThrow(() => evaluateDemoCard({ number: "", expiry: "", cvv: "", kind: "credito" }));
});
