"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard with settings tab active
    router.push("/dashboard");
  }, [router]);

  return null;
}
