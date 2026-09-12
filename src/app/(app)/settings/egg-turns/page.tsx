import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { SectionNav } from "@/components/section-nav";
import { cn } from "@/lib/utils";

export default async function EggTurnsPage() {
  const turns = await prisma.eggTurn.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav
        items={[{ href: "/settings/egg-turns", label: "Egg Turns" }]}
        backHref="/settings"
        backLabel="Settings"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Egg Turns</h1>
        <Link
          href="/settings/egg-turns/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Add Turn
        </Link>
      </div>

      {turns.length === 0 ? (
        <p className="text-muted-foreground">No egg turns yet.</p>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{turn.name}</p>
                <p className="text-sm text-muted-foreground">
                  Order: {turn.sortOrder}
                </p>
              </div>
              <Link
                href={`/settings/egg-turns/${turn.id}/edit`}
                aria-label="Edit egg turn"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-lg" }),
                  "text-muted-foreground",
                )}
              >
                <Pencil />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
