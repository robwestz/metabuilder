
import { describe, it, expect } from "vitest";
import { parsePSIR, validatePSIR, toFeatureSpec } from "../index.js";

const SAMPLE = `
system Checkout {
  @entity User(id:uuid, role:enum[ADMIN|USER])
  @entity Order(id:uuid, total:float)
  @force  RateLimit(on:User, qps<=10)
  @invariant Order.total >= 0
  @meter parse_ms(sys)->ms
}
`;

describe("PSIR parser", () => {
  it("parses and validates (happy)", () => {
    const ast = parsePSIR(SAMPLE);
    expect(ast.entities.length).toBe(2);
    expect(ast.forces[0].on).toBe("User");
    const v = validatePSIR(ast);
    expect(v.ok).toBe(true);
  });

  it("edge: empty props allowed", () => {
    const ast = parsePSIR(`
      system S { 
        @entity X()
        @force F(on:X)
        @invariant X.id > 0
      }
    `);
    expect(ast.entities[0].props.length).toBe(0);
  });

  it("negative: unknown entity in force", () => {
    const bad = `
      system S { 
        @entity X()
        @force F(on:Y)
        @invariant X.v > 0
      }
    `;
    const ast = parsePSIR(bad);
    expect(() => validatePSIR(ast)).toThrow(/unknown entity/i);
  });
});
