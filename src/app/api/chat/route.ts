import { VirtualFileSystem } from "@/lib/file-system";
import { streamText, appendResponseMessages, convertToCoreMessages } from "ai";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";
import { getLanguageModel } from "@/lib/provider";
import { generationPrompt } from "@/lib/prompts/generation";
import { rateLimit } from "@/lib/rate-limit";
import { chatRequestSchema, LIMITS } from "@/lib/data-schemas";
import { ConfigurationError } from "@/lib/env-schema";

interface ErrorResponseBody {
  error: string;
  code: "INVALID_REQUEST" | "PAYLOAD_TOO_LARGE" | "CONFIGURATION_ERROR";
  details?: Record<string, string[]>;
}

function errorResponse(body: ErrorResponseBody, status: number): Response {
  return Response.json(body, { status });
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > LIMITS.maxRequestBytes) {
    return errorResponse(
      { error: "Request body is too large", code: "PAYLOAD_TOO_LARGE" },
      413
    );
  }

  // Throttle per-client so a stuck or hostile caller can't drain the API budget.
  const limit = rateLimit(`chat:${getClientIp(req)}`);
  if (!limit.ok) {
    return new Response(
      JSON.stringify({
        error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      }
    );
  }

  let json: unknown;
  try {
    const body = await req.text();
    if (new TextEncoder().encode(body).byteLength > LIMITS.maxRequestBytes) {
      return errorResponse(
        { error: "Request body is too large", code: "PAYLOAD_TOO_LARGE" },
        413
      );
    }
    json = JSON.parse(body);
  } catch {
    return errorResponse(
      { error: "Invalid JSON body", code: "INVALID_REQUEST" },
      400
    );
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(
      {
        error: "Invalid request",
        code: "INVALID_REQUEST",
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const { files, projectId } = parsed.data;
  const messages = parsed.data.messages;

  const modelMessages = convertToCoreMessages(messages);
  modelMessages.unshift({
    role: "system",
    content: generationPrompt,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
    },
  });

  // Reconstruct the VirtualFileSystem from serialized data
  const fileSystem = new VirtualFileSystem();
  fileSystem.deserializeFromNodes(files);

  let model;
  try {
    model = getLanguageModel();
  } catch (error: unknown) {
    if (error instanceof ConfigurationError) {
      return errorResponse(
        { error: error.message, code: "CONFIGURATION_ERROR" },
        503
      );
    }
    throw error;
  }
  // Use fewer steps for mock provider to prevent repetition
  const isMockProvider = model.provider === "mock";
  const result = streamText({
    model,
    messages: modelMessages,
    maxTokens: 10_000,
    maxSteps: isMockProvider ? 4 : 40,
    onError: (err: unknown) => {
      console.error(err);
    },
    tools: {
      str_replace_editor: buildStrReplaceTool(fileSystem),
      file_manager: buildFileManagerTool(fileSystem),
    },
    onFinish: async ({ response }) => {
      // Save to project if projectId is provided and user is authenticated
      if (projectId) {
        try {
          // Neon Managed Better Auth is the single session authority.
          const user = await getCurrentAppUser();
          if (!user) {
            console.error("User not authenticated, cannot save project");
            return;
          }

          // Get the messages from the response
          const responseMessages = response.messages || [];
          // Combine original messages with response messages
          const allMessages = appendResponseMessages({
            messages: messages.filter((message) => message.role !== "system"),
            responseMessages,
          });

          await prisma.project.update({
            where: {
              id: projectId,
              userId: user.id,
            },
            data: {
              messages: JSON.stringify(allMessages),
              data: JSON.stringify(fileSystem.serialize()),
            },
          });
        } catch (error) {
          console.error("Failed to save project data:", error);
        }
      }
    },
  });

  return result.toDataStreamResponse();
}

export const maxDuration = 120;
