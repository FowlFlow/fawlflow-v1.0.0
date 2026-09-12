import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { SectionNav } from "@/components/section-nav";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export default async function EggTurnsPage() {
  const { t } = await getT();
  const turns = await prisma.eggTurn.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav
        items={[{ href: "/settings/egg-turns", label: t("settings.eggTurns.title") }]}
        backHref="/settings"
        backLabel={t("common.settings")}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("settings.eggTurns.title")}</h1>
        <Link
          href="/settings/egg-turns/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("settings.eggTurns.addNew")}
        </Link>
      </div>

      {turns.length === 0 ? (
        <p className="text-muted-foreground">{t("settings.eggTurns.empty")}</p>
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
                  {t("settings.eggTurns.orderDisplay", { order: turn.sortOrder })}
                </p>
              </div>
              <Link
                href={`/settings/egg-turns/${turn.id}/edit`}
                aria-label={t("settings.eggTurns.editTitle")}
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
