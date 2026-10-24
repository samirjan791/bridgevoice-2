import { z } from "zod";
import { language, entrySchema } from "../schema";
export const taskSchema = z.enum([
  "auto",
  "chat",
  "translate",
  "explain",
  "simplify",
  "compare",
  "terms",
  "document",
  "bridge",
]);
export type Task = z.infer<typeof taskSchema>;
export const documentSchema = z
  .object({
    name: z.string().max(200),
    pages: z
      .array(
        z.object({
          number: z.number().int().min(1),
          text: z.string().max(24000),
        }),
      )
      .max(30),
    truncated: z.boolean(),
  })
  .refine(
    (d) => d.pages.reduce((n, p) => n + p.text.length, 0) <= 24000,
    "Document text is too long",
  );
export type DocumentText = z.infer<typeof documentSchema>;
export const contextMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(12000),
});
export const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(12000),
    messages: z.array(contextMessage).max(12).default([]),
    language: language,
    sourceLanguage: language.default("en"),
    task: taskSchema.default("auto"),
    level: z.enum(["simple", "standard", "detailed"]).default("standard"),
    original: z.string().max(12000).default(""),
    proposed: z.string().max(12000).default(""),
    document: documentSchema.optional(),
  })
  .refine(
    (r) => r.messages.reduce((n, m) => n + m.content.length, 0) <= 24000,
    "Context too long",
  );
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export const chatModelSchema = z.object({
  answer: z.string().min(1).max(18000),
  sourcePassage: z.string().max(12000),
  translation: z.string().max(18000),
  terms: z
    .array(
      z.object({
        en: z.string().min(1).max(160),
        ps: z.string().max(300),
        "fa-AF": z.string().max(300),
        explanation: z.string().max(1200),
        domain: z.string().max(80),
        example: z.string().max(1200),
      }),
    )
    .max(12),
  warnings: z
    .array(
      z.object({
        message: z.string().max(1200),
        priority: z.enum(["informational", "review", "critical"]),
      }),
    )
    .max(12),
  sources: z
    .array(
      z.object({ page: z.number().int().min(1), quote: z.string().max(2000) }),
    )
    .max(6),
  followUps: z.array(z.string().max(250)).max(3),
});
export type ChatModel = z.infer<typeof chatModelSchema>;
export const chatResultSchema = chatModelSchema.extend({
  warnings: z.array(chatModelSchema.shape.warnings.element).max(14),
  provider: z.string(),
  latencyMs: z.number(),
  task: taskSchema,
  termsSaved: z.array(entrySchema).max(12),
  checks: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      source: z.string(),
      priority: z.enum(["critical", "important"]),
      state: z
        .enum(["flagged", "reviewed", "resolved", "dismissed"])
        .optional(),
    }),
  ),
  usage: z
    .object({ input_tokens: z.number(), output_tokens: z.number() })
    .optional(),
  estimatedCostUsd: z.number().optional(),
  sourceLanguage: language,
  targetLanguage: language,
});
export type ChatResult = z.infer<typeof chatResultSchema>;
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: ChatResult;
  feedback?: "helpful" | "needs-review";
  created: number;
};
export const storedChatSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(100),
  updated: z.number(),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string().max(18000),
        created: z.number(),
        result: chatResultSchema.optional(),
        feedback: z.enum(["helpful", "needs-review"]).optional(),
      }),
    )
    .max(100),
});
export type StoredChat = z.infer<typeof storedChatSchema>;
