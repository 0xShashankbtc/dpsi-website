import { describe, it, expect } from "vitest";
import { resolveDbName } from "../lib/mongodb";

describe("Multi-Tenant Architecture & Database Isolation Tests", () => {
  it("correctly resolves physical database names for default tenant (dpsi)", () => {
    expect(resolveDbName("dpsi", "main")).toBe("dpsi_main");
    expect(resolveDbName("dpsi", "gallery")).toBe("dpsi_gallery");
    expect(resolveDbName("dpsi", "tc")).toBe("dpsi_tc");
    expect(resolveDbName("dpsi", "admin")).toBe("dpsi_admin");

    expect(resolveDbName("default", "main")).toBe("dpsi_main");
    expect(resolveDbName("dps_indirapuram", "main")).toBe("dpsi_main");
  });

  it("correctly resolves isolated physical database names for client tenants", () => {
    expect(resolveDbName("gd_goenka", "main")).toBe("tenant_gd_goenka_main");
    expect(resolveDbName("gd_goenka", "gallery")).toBe("tenant_gd_goenka_gallery");
    expect(resolveDbName("gd_goenka", "tc")).toBe("tenant_gd_goenka_tc");
    expect(resolveDbName("gd_goenka", "admin")).toBe("dpsi_admin"); // Shared identity ledger

    expect(resolveDbName("st_xaviers", "main")).toBe("tenant_st_xaviers_main");
    expect(resolveDbName("ryan_international", "tc")).toBe("tenant_ryan_international_tc");
  });

  it("sanitizes tenant identifiers safely against special characters", () => {
    expect(resolveDbName("DPS-Indirapuram!", "main")).toBe("tenant_dps_indirapuram__main");
    expect(resolveDbName("Client 123", "gallery")).toBe("tenant_client_123_gallery");
  });

  it("maintains strict tenant isolation semantics across client scopes", () => {
    const tenantA = resolveDbName("client_a", "main");
    const tenantB = resolveDbName("client_b", "main");
    expect(tenantA).not.toBe(tenantB);
    expect(tenantA).toBe("tenant_client_a_main");
    expect(tenantB).toBe("tenant_client_b_main");
  });
});
