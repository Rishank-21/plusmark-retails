import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = adminConfigured();

  return (
    <div className="mx-auto mt-10 max-w-sm bg-white p-8 ring-1 ring-line md:mt-20">
      <h1 className="font-display text-2xl font-semibold">Admin login</h1>
      <p className="mt-2 text-sm text-steel">View and manage enquiries submitted on the website.</p>
      {configured ? (
        <LoginForm />
      ) : (
        <p role="alert" className="mt-6 bg-[#fdf0f0] p-4 text-sm leading-relaxed text-[#a3222a]">
          The admin panel is not configured. Set <code className="font-mono">ADMIN_PASSWORD</code> and{" "}
          <code className="font-mono">ADMIN_SESSION_SECRET</code> (at least 32 characters) in the server environment, then
          restart.
        </p>
      )}
    </div>
  );
}
