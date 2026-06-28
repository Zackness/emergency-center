import { describe, expect, it } from "vitest";
import { extractAvisosFromHtml } from "@/lib/vzlayuda/fetch";

describe("extractAvisosFromHtml", () => {
  it("applies default tipo when missing from embedded JSON", () => {
    const html = `prefix {"id":"6e71b4bb-c516-4877-8d88-72886b534cd0","titulo":"Apoyo Alimentario","descripcion":"detalle","estado":"Miranda","ciudad":"Caracas"} suffix`;
    const rows = extractAvisosFromHtml(html, "solicitud");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.tipo).toBe("solicitud");
    expect(rows[0]?.titulo).toBe("Apoyo Alimentario");
  });

  it("keeps explicit tipo over default", () => {
    const html = `{"id":"8ccb7d41-2b5c-4405-abde-c3d1fd1e940f","tipo":"oferta","titulo":"Transporte","descripcion":null}`;
    const rows = extractAvisosFromHtml(html, "solicitud");
    expect(rows[0]?.tipo).toBe("oferta");
  });
});
