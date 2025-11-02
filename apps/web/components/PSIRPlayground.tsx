
"use client";

import { useMemo, useState } from "react";
import { psir } from "@metabuilder/shared";

const SAMPLE = `system Checkout {
  @entity User(id:uuid, role:enum[ADMIN|USER])
  @entity Order(id:uuid, total:float)
  @force  RateLimit(on:User, qps<=10)
  @invariant Order.total >= 0
  @meter parse_ms(sys)->ms
}`;

export default function PSIRPlayground() {
  const [text, setText] = useState(SAMPLE);
  const { ast, error, artefacts } = useMemo(() => {
    try {
      const ast = psir.parsePSIR(text);
      (psir as any).validatePSIR(ast);
      const artefacts = {
        feature: (psir as any).toFeatureSpec(ast),
        modules: (psir as any).toModuleSpec(ast),
        api: (psir as any).toApiSpec(ast),
        ui: (psir as any).toUiFlow(ast)
      };
      return { ast, artefacts, error: "" };
    } catch (e: any) {
      return { ast: null, artefacts: null, error: e.message || String(e) };
    }
  }, [text]);

  return (
    <section className="card">
      <h2 className="text-xl font-medium mb-3">PSIR Playground</h2>
      <textarea
        className="w-full h-40 font-mono text-sm p-3 border rounded mb-3 bg-gray-50 dark:bg-gray-950"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      {error ? (
        <div className="text-red-600">Fel: {error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <pre className="text-xs overflow-auto bg-gray-50 dark:bg-gray-950 p-3 rounded"><code>{JSON.stringify(ast, null, 2)}</code></pre>
          <pre className="text-xs overflow-auto bg-gray-50 dark:bg-gray-950 p-3 rounded"><code>{JSON.stringify(artefacts, null, 2)}</code></pre>
        </div>
      )}
    </section>
  );
}
