import { BackLink } from "@/components/back-link";
import { TurnForm } from "../turn-form";

export default function NewTurnPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/settings/egg-turns" label="Egg Turns" />
      <h1 className="text-xl font-bold">Add Egg Turn</h1>
      <TurnForm />
    </div>
  );
}
