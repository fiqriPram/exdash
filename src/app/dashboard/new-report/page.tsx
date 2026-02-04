"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewReportPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard with report tab active
    router.push("/dashboard");
  }, [router]);

  return null;
}
