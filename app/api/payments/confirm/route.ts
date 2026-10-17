import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/utils/supabase/server";

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

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const supabase = await createClient();

    // 1. Buscamos la orden de pago por su token hash
    const { data: order, error: orderError } = await supabase
      .from("payment_orders")
      .select("id, proposal_id, amount, status, token_expires_at")
      .eq("payment_token_hash", tokenHash)
      .single();

    if (orderError || !order) {
      console.error("Orden no encontrada:", orderError);
      return NextResponse.json(
        { error: "No se encontró una orden de pago asociada a este enlace." },
        { status: 404 }
      );
    }

    if (order.status === "pagada") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        amount: order.amount,
        message: "Esta orden ya fue pagada anteriormente.",
      });
    }

    // 2. Comprobar vigencia
    if (order.token_expires_at && new Date(order.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: "El enlace de pago ha expirado (vigencia de 24 horas superada)." },
        { status: 410 }
      );
    }

    // 3. Actualizar la orden a 'pagada'
    const { error: updateOrderError } = await supabase
      .from("payment_orders")
      .update({
        status: "pagada",
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("Error actualizando orden a pagada:", updateOrderError);
      return NextResponse.json(
        { error: "No se pudo actualizar el estado de la orden." },
        { status: 500 }
      );
    }

    // 4. Actualizar la propuesta a 'confirmada' y el proyecto a 'en_ejecucion'
    if (order.proposal_id) {
      const { data: proposal } = await supabase
        .from("proposals")
        .select("id, project_id")
        .eq("id", order.proposal_id)
        .single();

      if (proposal) {
        await supabase
          .from("proposals")
          .update({ status: "confirmada" })
          .eq("id", proposal.id);

        if (proposal.project_id) {
          await supabase
            .from("projects")
            .update({ status: "en_ejecucion" })
            .eq("id", proposal.project_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      authorizationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      paidAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error inesperado confirmando pago:", err);
    return NextResponse.json(
      { error: "Error inesperado al procesar el pago." },
      { status: 500 }
    );
  }
}
