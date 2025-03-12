"use client";

import Header from "../../_sections/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col px-6 py-4 w-full h-full">
      <Header />
      {children}
    </div>
  );
}
