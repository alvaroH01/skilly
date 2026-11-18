import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /* =====================================================
       1. VALIDAR USUARIO
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "No autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       2. VALIDAR ADMIN
    ===================================================== */

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Solo un administrador de Skilly puede generar órdenes de pago.",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       3. LEER PROPUESTA
    ===================================================== */

    const body = await request.json();

    const proposalId = body?.proposalId;

    if (!proposalId) {
      return NextResponse.json(
        {
          error: "Falta el identificador de la propuesta.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       4. CREAR ORDEN MEDIANTE RPC
    ===================================================== */

    const {
      data: paymentOrderId,
      error: paymentOrderError,
    } = await supabase.rpc(
      "create_payment_order",
      {
        p_proposal_id: proposalId,
      }
    );

    if (paymentOrderError) {
      console.error(
        "Error create_payment_order:",
        paymentOrderError
      );

      return NextResponse.json(
        {
          error: paymentOrderError.message,
        },
        {
          status: 400,
        }
      );
    }

    if (!paymentOrderId) {
      return NextResponse.json(
        {
          error:
            "No fue posible obtener la orden de pago.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       5. GENERAR TOKEN ALEATORIO
    ===================================================== */

    const rawToken = randomBytes(32).toString("hex");

    /* =====================================================
       6. GENERAR HASH SHA-256
    ===================================================== */

    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    /* =====================================================
       7. EXPIRACIÓN: 24 HORAS
    ===================================================== */

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    /* =====================================================
       8. GUARDAR SOLO EL HASH
    ===================================================== */

    // El UPDATE directo sobre payment_orders no está permitido por RLS (no existe
    // política UPDATE). El token se registra con una función SECURITY DEFINER que
    // verifica que quien llama sea admin y deja la orden en estado "enviado".
    const { error: updateError } = await supabase.rpc(
      "set_payment_order_token",
      {
        p_order_id: paymentOrderId,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      }
    );

    if (updateError) {
      console.error(
        "Error guardando token:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "La orden fue creada, pero no fue posible generar el enlace de pago.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       9. GENERAR URL
    ===================================================== */

    const origin = new URL(request.url).origin;

    const paymentUrl =
      `${origin}/pago/${rawToken}`;

    /* =====================================================
       10. RESPUESTA
    ===================================================== */

    return NextResponse.json({
      success: true,
      paymentOrderId,
      paymentUrl,
      expiresAt,
    });
  } catch (error) {
    console.error(
      "Error inesperado creando pago:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ocurrió un error inesperado al generar la orden.",
      },
      {
        status: 500,
      }
    );
  }
}