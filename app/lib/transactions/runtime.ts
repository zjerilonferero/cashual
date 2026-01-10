import { Effect, Layer, ManagedRuntime } from "effect";
import { TransactionGroupLive } from "./repository";
import { UserService, UnauthorizedError } from "@/app/lib/user";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

const UserLive = Layer.succeed(UserService, {
  currentUser: Effect.tryPromise({
    try: async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user) {
        throw new Error("Not authenticated");
      }
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
    },
    catch: () => new UnauthorizedError({ message: "Not authenticated" }),
  }),
});

const MainLayer = Layer.mergeAll(TransactionGroupLive, UserLive);

export const runtime = ManagedRuntime.make(MainLayer);
