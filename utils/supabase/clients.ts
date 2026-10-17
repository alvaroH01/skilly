import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://hmhvvhwjxtqnggkojayn.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_VM5IJS284f9_z04F4L0FTQ_NUuAjIAm";

export function createClient() {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  let key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY).trim();

  // Si la variable viene malformada, con corchetes o formato markdown ](https://...
  if (!url.startsWith("https://") || url.includes("]") || url.includes("[") || url.includes("(") || url.includes(")")) {
    url = DEFAULT_SUPABASE_URL;
  }

  if (key.includes("]") || key.includes("[") || key.includes("(") || key.includes(")") || key.length < 20) {
    key = DEFAULT_SUPABASE_KEY;
  }

  return createBrowserClient(url, key);
}
