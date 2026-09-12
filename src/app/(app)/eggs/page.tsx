import { LayoutGrid, ClipboardList, Package, TrendingUp, BarChart3 } from "lucide-react";
import { HubLinkGrid } from "@/components/hub-links";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildGroups(t: Translate) {
  return [
    {
      title: t("eggs.hub.dailyOperations"),
      links: [
        {
          href: "/eggs/cages",
          label: t("eggs.cages.title"),
          description: t("eggs.hub.cagesDesc"),
          icon: LayoutGrid,
        },
        {
          href: "/eggs/log",
          label: t("eggs.log.title"),
          description: t("eggs.hub.logDesc"),
          icon: ClipboardList,
        },
      ],
    },
    {
      title: t("eggs.hub.selling"),
      links: [
        {
          href: "/eggs/box-types",
          label: t("eggs.boxTypes.title"),
          description: t("eggs.hub.boxTypesDesc"),
          icon: Package,
        },
        {
          href: "/eggs/sales",
          label: t("eggs.sales.navLabel"),
          description: t("eggs.hub.salesDesc"),
          icon: TrendingUp,
        },
      ],
    },
    {
      title: t("eggs.hub.reportsGroup"),
      links: [
        {
          href: "/eggs/reports",
          label: t("eggs.reports.navLabel"),
          description: t("eggs.hub.reportsDesc"),
          icon: BarChart3,
        },
      ],
    },
  ];
}

export default async function EggsHubPage() {
  const { t } = await getT();
  const groups = buildGroups(t);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t("eggs.hub.title")}</h1>
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            {group.title}
          </h2>
          <HubLinkGrid links={group.links} />
        </div>
      ))}
    </div>
  );
}
