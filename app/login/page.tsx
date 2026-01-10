import { Input } from "@/app/components/ui";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface User {
  email: string;
  password: string;
}

export default async function LoginPage() {
  const loginUser = async (formData: FormData) => {
    "use server";
    const user: User = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    await auth.api.signInEmail({ body: user, asResponse: true });
    redirect("/");
  };

  // await auth.api.signUpEmail({
  //   body: {
  //     name: "zjerilon",
  //     email: "zjerilonferero@gmail.com",
  //     password: "qazwsx123",
  //   },
  // });
  //
  return (
    <main className="flex min-h-screen items-center justify-center bg-background w-full">
      <div className="container px-8">
        <form action={loginUser} className="space-y-5">
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            minLength={8}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
