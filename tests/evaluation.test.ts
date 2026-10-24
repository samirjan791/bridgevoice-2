import { it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { checkGuard } from "@/lib/guard";
import { matchGlossary } from "@/lib/glossary";
import { demos } from "@/data/demos";
it("records a bounded fictional deterministic evaluation", () => {
  const cases = [
    {
      source: "Do not take 2 tablets.",
      target: "Take 2 tablets.",
      flag: "negation-mismatch",
    },
    { source: "Take 5 mg.", target: "Take 50 mg.", flag: "number-mismatch" },
    { source: "Take 5 mg.", target: "Take 5 ml.", flag: "unit-check" },
    {
      source: "Return within 14 days.",
      target: "Return within 40 days.",
      flag: "number-mismatch",
    },
  ];
  const start = performance.now();
  const results = cases.map((c) => ({
    ...c,
    detected: checkGuard(c.source, c.target).some((w) => w.id === c.flag),
  }));
  const segments = demos.flatMap((d) => d.segments);
  const report = {
    scope:
      "Small fictional deterministic checks only; not translation accuracy or model evaluation.",
    cases: results,
    detected: results.filter((r) => r.detected).length,
    total: results.length,
    demoSegmentsWithGlossaryMatches: segments.filter(
      (s) => matchGlossary(s, "en").length > 0,
    ).length,
    demoSegments: segments.length,
    measuredRuleBatchMs: performance.now() - start,
    liveModelEvaluated: false,
  };
  writeFileSync("evidence/evaluation.json", JSON.stringify(report, null, 2));
  expect(results.every((r) => r.detected)).toBe(true);
});
