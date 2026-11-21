/**
 * Pruebas unitarias de utils/services.ts (formato de dinero, mensajes de error
 * y tablas de estados del catálogo de servicios).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  SERVICE_CATEGORIES,
  VALIDATION_LABEL,
  formatMoney,
  errorMessage,
  type ServiceValidation,
} from "../../utils/services.ts";

test("formatMoney formatea pesos chilenos sin decimales", () => {
  assert.match(formatMoney(150000), /150\.000/);
  assert.match(formatMoney(0), /0/);
});

test("formatMoney devuelve guion si no hay valor", () => {
  assert.equal(formatMoney(null), "-");
  assert.equal(formatMoney(undefined), "-");
});

test("errorMessage usa el mensaje del error cuando existe", () => {
  assert.equal(errorMessage(new Error("falló"), "x"), "falló");
  assert.equal(errorMessage({ message: "de supabase" }, "x"), "de supabase");
});

test("errorMessage usa el texto alternativo si no hay mensaje válido", () => {
  assert.equal(errorMessage(null, "alterno"), "alterno");
  assert.equal(errorMessage("texto", "alterno"), "alterno");
  assert.equal(errorMessage({ message: "" }, "alterno"), "alterno");
  assert.equal(errorMessage({ message: 42 }, "alterno"), "alterno");
});

test("cada estado de validación tiene texto y clases de color", () => {
  const estados: ServiceValidation[] = [
    "no_enviado", "pendiente", "en_revision", "cambios_solicitados", "propuesta_final", "validado",
  ];
  for (const e of estados) {
    assert.ok(VALIDATION_LABEL[e].text.length > 0, e);
    assert.ok(VALIDATION_LABEL[e].tone.length > 0, e);
  }
  assert.equal(Object.keys(VALIDATION_LABEL).length, estados.length);
});

test("las categorías del catálogo no tienen duplicados y terminan en Otro", () => {
  assert.equal(new Set(SERVICE_CATEGORIES).size, SERVICE_CATEGORIES.length);
  assert.equal(SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1], "Otro");
});
