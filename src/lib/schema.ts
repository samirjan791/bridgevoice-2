import { z } from "zod";
export const language = z.enum(["en", "ps", "fa-AF"]);
export const entrySchema = z.object({
  id: z.string().min(1).max(100),
  en: z.string().min(1).max(160),
  ps: z.string().max(300),
  "fa-AF": z.string().max(300),
  explanation: z.string().max(1200),
  domain: z.string().max(80),
  example: z.string().max(1200),
  source: z.string().max(500),
  reviewStatus: z.enum(["unreviewed", "user_corrected"]),
  notes: z.string().max(2000).optional(),
  favorite: z.boolean().optional(),
});
export type Entry = z.infer<typeof entrySchema>;
export const importSchema = z.array(entrySchema).max(2000);
export const requestSchema = z
  .object({
    segmentId: z.string().min(1).max(100),
    text: z.string().trim().min(1).max(4000),
    sourceLanguage: language,
    targetLanguage: language,
    context: z.string().max(200).default("general"),
  })
  .refine(
    (v) => v.sourceLanguage !== v.targetLanguage,
    "Choose different languages",
  );
export type AnalysisRequest = z.infer<typeof requestSchema>;
export const modelSchema = z.object({
  terms: z
    .array(
      z.object({
        source: z.string().max(160),
        translation: z.string().max(600),
        explanation: z.string().max(1000),
        category: z.string().max(80),
        priority: z.enum(["critical", "important", "informational"]),
      }),
    )
    .max(20),
  suggestedTranslation: z.string().max(8000),
  alternatives: z.array(z.string().max(2000)).max(5),
  ambiguities: z.array(z.string().max(1000)).max(15),
  warnings: z.array(z.string().max(1000)).max(15),
});
export type ModelResult = z.infer<typeof modelSchema>;
export type Warning = {
  id: string;
  message: string;
  source: string;
  priority: "critical" | "important";
  state?: "flagged" | "reviewed" | "resolved" | "dismissed";
};
export type Result = ModelResult & {
  segmentId: string;
  originalTranscript: string;
  sourceLanguage: string;
  targetLanguage: string;
  matches: Entry[];
  criticalValues: {
    sourceText: string;
    value: string;
    unit: string;
    requiresVerification: true;
  }[];
  guard: Warning[];
  provider: string;
  latencyMs: number;
  requiresHumanReview: true;
  usage?: { input_tokens: number; output_tokens: number };
  estimatedCostUsd?: number;
};
