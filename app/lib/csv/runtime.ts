import { Effect, Layer, ManagedRuntime } from "effect";
import { CsvParserLive } from "./parser";
import { UserService, UnauthorizedError } from "@/app/lib/user";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

/**
 * UserService implementation that gets current user from session
 */
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

/**
 * Combine all layers for the CSV domain
 */
const MainLayer = Layer.mergeAll(CsvParserLive, UserLive);

/**
 * Managed runtime for CSV domain
 * Handles resource lifecycle and dependency injection
 */
export const runtime = ManagedRuntime.make(MainLayer);
