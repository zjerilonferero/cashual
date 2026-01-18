import { Effect, Layer, ManagedRuntime } from "effect";
import { UserService, UnauthorizedError } from "@/app/lib/user";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { SystemCategoryLive, CategoryLive } from "./repository";
import { CategorizationLive } from "./categorization";
import {
  SystemCategoryRuleLive,
  CategoryRuleLive,
} from "@/app/lib/category-rule";

const UserLive = Layer.succeed(UserService, {
  currentUser: Effect.tryPromise({
    try: async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) throw new Error("Not authenticated");
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
    },
    catch: () => new UnauthorizedError({ message: "Not authenticated" }),
  }),
});

const RepositoryLayers = Layer.mergeAll(
  SystemCategoryLive,
  CategoryLive,
  SystemCategoryRuleLive,
  CategoryRuleLive,
);

const MainLayer = CategorizationLive.pipe(
  Layer.provideMerge(RepositoryLayers),
  Layer.provideMerge(UserLive),
);

export const runtime = ManagedRuntime.make(MainLayer);
