import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { EventEmitter } from "events";
import express from "express";
import { z } from "zod";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    if (req.headers.authorization !== "secret") {
      return null;
    }
    return {
      name: "user",
    };
  };

  return {
    req,
    res,
    session: {
      user: getUser(),
    },
  };
};
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

const postRouter = router({
  test: publicProcedure.query(() => "hello"),
});

const messageRouter = router({});

// root router to call
export const appRouter = router({
  // merge predefined routers
  post: postRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
