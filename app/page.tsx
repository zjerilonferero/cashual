import { auth } from "./lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="h-2000 w-full">
      <h1>Welcome back {session.user.name},</h1>
    </div>
  );
}
