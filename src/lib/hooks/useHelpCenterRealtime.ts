import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const FALLBACK_POLL_MS = 15_000;

function subscribe(
  channelName: string,
  tables: Array<{ table: string; filter?: string }>,
  onChange: () => void
): () => void {
  const supabase = createBrowserSupabase();
  if (!supabase) {
    const timer = window.setInterval(onChange, FALLBACK_POLL_MS);
    return () => window.clearInterval(timer);
  }

  let channel = supabase.channel(channelName);
  for (const { table, filter } of tables) {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      onChange
    );
  }

  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** Refresca el directorio público cuando cambian centros o inventario. */
export function useHelpCenterCatalogRealtime(onChange: () => void) {
  useEffect(() => {
    return subscribe(
      "help-centers-catalog",
      [
        { table: "help_centers" },
        { table: "inventory_items" },
        { table: "inventory_movements" },
      ],
      onChange
    );
  }, [onChange]);
}

/** Refresca inventario de un centro (panel coordinador o diálogo público). */
export function useHelpCenterInventoryRealtime(
  helpCenterId: string | null | undefined,
  onChange: () => void
) {
  useEffect(() => {
    if (!helpCenterId) return;
    return subscribe(
      `inventory-${helpCenterId}`,
      [
        { table: "inventory_items", filter: `help_center_id=eq.${helpCenterId}` },
        { table: "inventory_movements" },
      ],
      onChange
    );
  }, [helpCenterId, onChange]);
}

/** Refresca listado admin de centros. */
export function useAdminHelpCentersRealtime(onChange: () => void) {
  useEffect(() => {
    return subscribe("admin-help-centers", [{ table: "help_centers" }], onChange);
  }, [onChange]);
}
