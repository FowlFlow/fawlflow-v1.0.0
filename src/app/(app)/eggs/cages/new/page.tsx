import { BackLink } from "@/components/back-link";
import { CageForm } from "../cage-form";

export default function NewCagePage() {
  return (
    <div className="space-y-4">
      <BackLink href="/eggs/cages" label="Cages" />
      <h1 className="text-xl font-bold">Add Cage</h1>
      <CageForm />
    </div>
  );
}
