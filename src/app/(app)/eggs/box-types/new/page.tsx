import { BackLink } from "@/components/back-link";
import { BoxTypeForm } from "../box-type-form";

export default function NewBoxTypePage() {
  return (
    <div className="space-y-4">
      <BackLink href="/eggs/box-types" label="Box Types" />
      <h1 className="text-xl font-bold">Add Box Type</h1>
      <BoxTypeForm />
    </div>
  );
}
