"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard with history tab active
    router.push("/dashboard");
  }, [router]);

  return null;
}
