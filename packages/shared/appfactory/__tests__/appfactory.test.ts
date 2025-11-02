
import { describe, it, expect } from "vitest";
import { parsePSIR } from "../../psir/index.js";
import { generateHelloApp } from "../index.js";

const SAMPLE = `
system Checkout {
  @entity User(id:uuid, role:enum[ADMIN|USER])
  @entity Order(id:uuid, total:float)
  @force  RateLimit(on:User, qps<=10)
  @invariant Order.total >= 0
  @meter parse_ms(sys)->ms
}
`;

describe("App-Factory hello-app generator", () => {
  it("produces API and Web files (happy)", () => {
    const ast = parsePSIR(SAMPLE);
    const files = generateHelloApp(ast);
    const paths = files.map(f => f.path);
    expect(paths).toContain("apps/api/app/routers/generated/checkout.py");
    expect(paths).toContain("apps/web/app/checkout/user/page.tsx");
    expect(paths).toContain("apps/web/app/checkout/order/[id]/page.tsx");
  });

  it("router contains Pydantic models and Literal enums (edge)", () => {
    const ast = parsePSIR(SAMPLE);
    const files = generateHelloApp(ast);
    const router = files.find(f => f.path.endsWith("generated/checkout.py"))!.content;
    expect(router).toMatch(/from pydantic import BaseModel/);
    expect(router).toMatch(/Literal\[/);
    expect(router).toMatch(/class OrderCreate\(BaseModel\)/);
    expect(router).toMatch(/@model_validator\(mode="after"\)/);
  });

  it("negative: empty system still generates index page only", () => {
    const ast = { name: "Z", entities: [], forces: [], fields: [], invariants: [], meters: [] };
    const files = generateHelloApp(ast as any);
    const idx = files.find(f => f.path.endsWith("apps/web/app/z/page.tsx"));
    expect(idx).toBeTruthy();
  });
});
