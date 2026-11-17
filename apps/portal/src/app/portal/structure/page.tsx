import { Suspense } from "react";
import { StructureClient } from "./StructureClient";

export const metadata = {
  title: "Group Structure & Legal Registry | Virex Portal",
  description:
    "Corporate legal hierarchy, cap table and ownership topology across Virex Group entities.",
};

export default function StructurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-virex-warmwhite" />}>
      <StructureClient />
    </Suspense>
  );
}
