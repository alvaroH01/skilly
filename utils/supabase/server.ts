import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = "https://hmhvvhwjxtqnggkojayn.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_VM5IJS284f9_z04F4L0FTQ_NUuAjIAm";

/**
 * Crea el cliente de Supabase para código que corre en el servidor
 * (Server Components, rutas `app/api/**`). Lee y escribe la sesión en las
 * cookies de la petición, por lo que cada consulta se ejecuta con el usuario
 * autenticado y queda sujeta a las políticas RLS.
 *
 * Usa solo la clave publicable; la clave `service_role` no se usa en la aplicación.
 *
 * @returns Cliente de Supabase asociado a la sesión de la petición actual.
 */
export async function createClient() {
  const cookieStore = await cookies();

  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  let key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY).trim();

  // Si la variable viene malformada, con corchetes o formato markdown ](https://...
  if (!url.startsWith("https://") || url.includes("]") || url.includes("[") || url.includes("(") || url.includes(")")) {
    url = DEFAULT_SUPABASE_URL;
  }

  if (key.includes("]") || key.includes("[") || key.includes("(") || key.includes(")") || key.length < 20) {
    key = DEFAULT_SUPABASE_KEY;
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Puede ejecutarse desde un Server Component
          }
        },
      },
    }
  );
}
