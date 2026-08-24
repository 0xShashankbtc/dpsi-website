import { createRouter, authedQuery, authedMutation } from "./middleware";

export const authRouter = createRouter({
  me: authedQuery.query(() => ({ id: 1, name: "Admin", role: "admin" as const })),
  logout: authedMutation.mutation(async () => {
    return { success: true };
  }),
});