"use client";

import React from "react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100">
      {children}
    </div>
  );
}
