"use client";
import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user] = useAuthState(auth);
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <a href="/login" className="text-primary underline">
        Go to Login
      </a>
    </div>
  );
}
