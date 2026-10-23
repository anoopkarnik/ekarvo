import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchDocumentation } from "@/lib/functions/fetchDocumentation";
import { documentationData } from "@workspace/database/constants";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const documentationRouter = createTRPCRouter({
  getDocumentationInfo: baseProcedure.query(() => fetchDocumentation()),
  queryDocumentationBySlug: baseProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const doc = documentationData.find((item) => item.slug === input.slug);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Documentation not found" });
      return readFile(path.join(process.cwd(), "../../packages/database/src/docs", doc.filePath), "utf8");
    }),
});
