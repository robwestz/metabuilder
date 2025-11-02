
import { describe, it, expect } from "vitest";
import { crossover, distill, transmute } from "../index.js";
import { parsePSIR } from "../../psir/index.js";

const A = `
system A {
  @entity U(id:uuid)
  @force RL(on:U)
  @invariant U.id != null
}
`;
const B = `
system B {
  @entity V(id:uuid)
  @invariant V.id != null
}
`;

describe("Genesis operators", () => {
  it("crossover merges (happy)", () => {
    const a = parsePSIR(A); const b = parsePSIR(B);
    const x = crossover(a, b);
    expect(x.entities.length).toBe(2);
  });
  it("distill commons (edge)", () => {
    const a = parsePSIR(A); const b = parsePSIR(B);
    const d = distill([a, b]);
    expect(Array.isArray(d.invariants)).toBe(true);
  });
  it("negative: transmute handles empty invariants", () => {
    const a = parsePSIR(`system Z { @entity U() }`);
    const t = transmute(a);
    expect(t.uiHints?.length ?? 0).toBe(0);
  });
});
