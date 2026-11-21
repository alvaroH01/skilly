import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/payments/link
 *
 * El contratador dueño de una orden de pago obtiene su propio enlace de pago.
 * Se genera un token aleatorio de 32 bytes, se guarda solo su hash SHA-256
 * (vigencia 24 horas) mediante la función issue_payment_link y se entrega la
 * URL /pago/<token> únicamente a quien tiene la sesión de esa cuenta.
 * Cada llamada invalida el enlace anterior.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const orderId: unknown = body?.orderId;

    if (typeof orderId !== "string" || orderId.length < 10) {
      return NextResponse.json(
        { error: "Falta el identificador de la orden." },
        { status: 400 }
      );
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.rpc("issue_payment_link", {
      p_order_id: orderId,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const origin = new URL(request.url).origin;

    return NextResponse.json({
      success: true,
      paymentUrl: `${origin}/pago/${rawToken}`,
      expiresAt,
    });
  } catch (error: unknown) {
    console.error("Error generando el enlace de pago:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al generar el enlace de pago." },
      { status: 500 }
    );
  }
}
