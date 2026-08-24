import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const publicMutation = t.procedure;

/**
 * Middleware that verifies the user is authenticated via JWT.
 * Rejects with UNAUTHORIZED if no valid token is present.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * Middleware that verifies the user has admin or superadmin role.
 */
const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }
  if (ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authedQuery = t.procedure.use(enforceAuth);
export const authedMutation = t.procedure.use(enforceAuth);
export const adminQuery = t.procedure.use(enforceAdmin);
export const adminMutation = t.procedure.use(enforceAdmin);