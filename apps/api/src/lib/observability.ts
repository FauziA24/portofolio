import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

function responseError(error: unknown) {
  if (error instanceof Error) {
    const statusCode = "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
    return { message: error.message, statusCode };
  }
  return { message: "Internal server error", statusCode: 500 };
}

export function installErrorHandling(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn({ err: error, validation: error.flatten() }, "request validation failed");
      return reply.code(400).send({ message: "Invalid request", issues: error.flatten().fieldErrors });
    }
    request.log.error({ err: error }, "request failed");
    const { message, statusCode } = responseError(error);
    return reply.code(statusCode >= 400 ? statusCode : 500).send({ message: statusCode < 500 ? message : "Internal server error" });
  });
}
