import { adminProcedure, createTRPCRouter, protectedProcedure, guestReadableAdminProcedure } from "@/trpc/init";
import {
  mergeSpeechConfig,
  normalizeSpeechUrl,
  parseSpeechSampleBody,
  type SpeechCapability,
} from "@/lib/aiSpeech";
import {
  getN8nWebhookEnvConfig,
  isN8nWebhookProvider,
  normalizeN8nWebhookProvider,
  toPublicN8nWebhookConfig,
} from "@/lib/helper/aiWebhook";
import {
  AI_N8N_WEBHOOK_PROVIDER,
  AI_WEBHOOK_PROVIDER,
  DEFAULT_N8N_WEBHOOK_TEMPLATE,
} from "@/lib/ts-types/ai";
import {
  createPromptVersionInputSchema,
  promptKeySchema,
  updatePromptVersionInputSchema,
} from "@/lib/zod/ai";
import { getAIConfigStatus } from "@workspace/ai";
import db from "@workspace/database/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const speechCapabilitySchema = z.enum(["tts", "stt"]);
const speechProviderSchema = z.enum(["custom", "openai"]);
const speechCapabilities: SpeechCapability[] = ["tts", "stt"];

const assistantPrompts = [
  {
    key: "chat.assistant",
    name: "Chat Assistant",
    description: "General-purpose assistant used by the authenticated AI chat.",
  },
] as const;

const assistantPromptKeys = assistantPrompts.map((prompt) => prompt.key);

function getAssistantPromptDefault(promptKey: string) {
  return assistantPrompts.find((prompt) => prompt.key === promptKey);
}

export const aiRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async () => {
    const status = getAIConfigStatus();
    const webhookConfig = getN8nWebhookEnvConfig();
    const webhookConfigured = status.enabled && webhookConfig.configured;
    const providers = webhookConfigured
      ? Array.from(new Set([...status.providers, AI_WEBHOOK_PROVIDER]))
      : status.providers;

    return {
      enabled: status.enabled,
      configured: status.configured || webhookConfigured,
      reason: status.configured || webhookConfigured ? null : status.reason,
      provider: status.provider ?? (webhookConfigured ? AI_N8N_WEBHOOK_PROVIDER : null),
      providers,
      model: status.model,
    };
  }),

  getPrompts: adminProcedure.query(async () => {
    const prompts = await (db as any).aiPrompt.findMany({
      where: { key: { in: assistantPromptKeys } },
      include: { activeVersion: true },
      orderBy: { key: "asc" },
    });

    return assistantPrompts.map((defaultPrompt) => {
      const saved = prompts.find((prompt: any) => prompt.key === defaultPrompt.key);

      return saved
        ? {
            ...saved,
            name: saved.name || defaultPrompt.name,
            description: saved.description || defaultPrompt.description,
          }
        : {
            id: defaultPrompt.key,
            key: defaultPrompt.key,
            name: defaultPrompt.name,
            description: defaultPrompt.description,
            activeVersionId: null,
            activeVersion: null,
          };
    });
  }),

  getPromptVersions: adminProcedure
    .input(z.object({ promptKey: promptKeySchema }))
    .query(async ({ input }) => {
      const prompt = await (db as any).aiPrompt.findUnique({
        where: { key: input.promptKey },
        include: {
          activeVersion: true,
          versions: { orderBy: { version: "desc" } },
        },
      });

      if (prompt) {
        return prompt;
      }

      const defaultPrompt = getAssistantPromptDefault(input.promptKey);
      if (!defaultPrompt) {
        return null;
      }

      return {
        id: defaultPrompt.key,
        key: defaultPrompt.key,
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        activeVersionId: null,
        activeVersion: null,
        versions: [],
      };
    }),

  createPromptVersion: adminProcedure
    .input(createPromptVersionInputSchema)
    .mutation(async ({ ctx, input }) => {
      return db.$transaction(async (tx) => {
        const prompt = await (tx as any).aiPrompt.upsert({
          where: { key: input.promptKey },
          update: {
            name: input.name,
            description: input.description,
          },
          create: {
            key: input.promptKey,
            name: input.name,
            description: input.description,
          },
        });

        const latest = await (tx as any).aiPromptVersion.findFirst({
          where: { promptId: prompt.id },
          orderBy: { version: "desc" },
          select: { version: true },
        });

        const version = await (tx as any).aiPromptVersion.create({
          data: {
            promptId: prompt.id,
            version: (latest?.version ?? 0) + 1,
            content: input.content?.trim() || null,
            provider: normalizeN8nWebhookProvider(input.provider),
            model: input.model?.trim(),
            createdByUserId: ctx.session.user.id,
          },
        });

        if (input.activate) {
          await (tx as any).aiPrompt.update({
            where: { id: prompt.id },
            data: { activeVersionId: version.id },
          });
        }

        return version;
      });
    }),

  updatePromptVersion: adminProcedure
    .input(updatePromptVersionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const prompt = await (db as any).aiPrompt.findUnique({
        where: { key: input.promptKey },
      });

      if (!prompt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prompt not found" });
      }

      const version = await (db as any).aiPromptVersion.findFirst({
        where: { id: input.versionId, promptId: prompt.id },
      });

      if (!version) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prompt version not found" });
      }

      const updated = await (db as any).aiPromptVersion.update({
        where: { id: version.id },
        data: {
          content: input.content?.trim() || null,
          provider: normalizeN8nWebhookProvider(input.provider),
          model: input.model?.trim(),
        },
      });
      return updated;
    }),

  deletePromptVersion: adminProcedure
    .input(
      z.object({
        promptKey: promptKeySchema,
        versionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await (db as any).aiPrompt.findUnique({
        where: { key: input.promptKey },
      });

      if (!prompt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prompt not found" });
      }

      if (prompt.activeVersionId === input.versionId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Activate another version before deleting this one.",
        });
      }

      const version = await (db as any).aiPromptVersion.findFirst({
        where: { id: input.versionId, promptId: prompt.id },
      });

      if (!version) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Prompt version not found" });
      }

      const deleted = await (db as any).aiPromptVersion.delete({
        where: { id: version.id },
      });
      return deleted;
    }),

  getAvailableModels: guestReadableAdminProcedure
    .input(z.object({ provider: z.string() }))
    .query(async ({ input }) => {
      const { listModels } = await import("@workspace/ai");
      return listModels(input.provider as any);
    }),

  getWebhookConfig: guestReadableAdminProcedure.query(async () => {
    return toPublicN8nWebhookConfig(getN8nWebhookEnvConfig());
  }),

  getSpeechConfigs: guestReadableAdminProcedure.query(async () => {
    const records = await (db as any).aiSpeechConfig.findMany({
      where: { capability: { in: speechCapabilities } },
    });

    return speechCapabilities.map((capability) =>
      mergeSpeechConfig(
        records.find((record: any) => record.capability === capability),
        capability,
      ),
    );
  }),

  saveSpeechConfig: adminProcedure
    .input(
      z.object({
        capability: speechCapabilitySchema,
        provider: speechProviderSchema,
        enabled: z.boolean(),
        url: z.string().min(1, "URL is required"),
        sampleBody: z.string().min(1, "Sample body JSON is required"),
      }),
    )
    .mutation(async ({ input }) => {
      let url: string;
      let sampleBody: Record<string, unknown>;

      try {
        url = normalizeSpeechUrl(input.url);
        sampleBody = parseSpeechSampleBody(input.sampleBody);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Invalid speech configuration.",
        });
      }

      const record = await (db as any).aiSpeechConfig.upsert({
        where: { capability: input.capability },
        update: {
          provider: input.provider,
          enabled: input.enabled,
          url,
          sampleBody,
        },
        create: {
          capability: input.capability,
          provider: input.provider,
          enabled: input.enabled,
          url,
          sampleBody,
        },
      });

      return mergeSpeechConfig(record, input.capability);
    }),

  activatePromptVersion: adminProcedure
    .input(
      z.object({
        promptKey: promptKeySchema,
        versionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await (db as any).aiPrompt.findUnique({
        where: { key: input.promptKey },
      });

      if (!prompt) {
        throw new Error("Prompt not found");
      }

      const version = await (db as any).aiPromptVersion.findFirst({
        where: { id: input.versionId, promptId: prompt.id },
      });

      if (!version) {
        throw new Error("Prompt version not found");
      }

      const activated = await (db as any).aiPrompt.update({
        where: { id: prompt.id },
        data: { activeVersionId: version.id },
        include: { activeVersion: true },
      });
      return activated;
    }),

  getUsageEvents: adminProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(25),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return (db as any).aiUsageEvent.findMany({
        take: input?.limit ?? 25,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });
    }),
});
