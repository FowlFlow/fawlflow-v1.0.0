import { BackLink } from "@/components/back-link";
import { MaterialForm } from "../material-form";

export default function NewMaterialPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/feed/materials" label="Materials" />
      <h1 className="text-xl font-bold">Add Material</h1>
      <MaterialForm />
    </div>
  );
}
