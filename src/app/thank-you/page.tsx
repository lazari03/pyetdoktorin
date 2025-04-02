"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ThankYouPage() {
  const router = useRouter();

  useEffect(() => {
    console.log("Thank You page loaded. Redirecting in 1 second...");
    const timer = setTimeout(() => {
      console.log("Redirecting to /dashboard/appointments...");
      router.push("/dashboard/appointments"); // Redirect to appointment history
    }, 1000); // 1 second delay

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold">Thank you for your payment!</h1>
      <p className="mt-2">Redirecting you to your appointment history...</p>
    </div>
  );
}
