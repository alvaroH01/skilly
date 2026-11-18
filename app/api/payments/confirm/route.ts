import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { createClient } from "@/utils/supabase/server";

/**
 * Confirma el pago de una orden.
 *
 * Seguridad:
 *  - Exige sesión: solo el cliente de la orden (o un admin) puede pagarla.
 *  - El monto y los cambios de estado los decide la base de datos
 *    (función mark_payment_paid), nunca el navegador.
 *  - La función actualiza orden, propuesta, proyecto y notificaciones en una
 *    sola transacción, valida vigencia (24 h) y evita pagos repetidos.
 *
 * Nota: el cobro es una simulación (sandbox). En producción, esta ruta debe
 * llamar a Transbank y solo invocar mark_payment_paid si el proveedor confirma.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string" || token.length < 20) {
      return NextResponse.json(
        { error: "Token de pago no válido." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Inicia sesión con la cuenta del cliente para completar el pago.",
        },
        { status: 401 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const authorizationCode = `SBX-${randomInt(100000, 1000000)}`;

    const { data, error } = await supabase.rpc("mark_payment_paid", {
      p_token_hash: tokenHash,
      p_provider: "webpay_sandbox",
      p_provider_payment_id: authorizationCode,
    });

    if (error) {
      const message = error.message || "No se pudo confirmar el pago.";

      if (message.includes("Solo el cliente")) {
        return NextResponse.json({ error: message }, { status: 403 });
      }

      if (message.includes("no es válido")) {
        return NextResponse.json({ error: message }, { status: 410 });
      }

      console.error("Error mark_payment_paid:", error);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      orderId: result?.order_id,
      amount: result?.amount,
      authorizationCode,
      paidAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Error inesperado confirmando pago:", err);
    return NextResponse.json(
      { error: "Error inesperado al procesar el pago." },
      { status: 500 }
    );
  }
}
