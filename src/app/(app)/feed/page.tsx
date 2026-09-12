import {
  Package,
  ShoppingCart,
  FlaskConical,
  Factory,
  TrendingUp,
  Tractor,
  BarChart3,
  Tag,
  PiggyBank,
} from "lucide-react";
import { HubLinkGrid } from "@/components/hub-links";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildGroups(t: Translate) {
  return [
    {
      title: t("feed.hub.groupInventory"),
      links: [
        {
          href: "/feed/materials",
          label: t("feed.materials.navLabel"),
          description: t("feed.hub.materialsDesc"),
          icon: Package,
        },
        {
          href: "/feed/purchases",
          label: t("feed.purchases.navLabel"),
          description: t("feed.hub.purchasesDesc"),
          icon: ShoppingCart,
        },
        {
          href: "/feed/prices",
          label: t("feed.prices.navLabel"),
          description: t("feed.hub.pricesDesc"),
          icon: Tag,
        },
      ],
    },
    {
      title: t("feed.hub.groupMakingFeed"),
      links: [
        {
          href: "/feed/types",
          label: t("feed.types.navLabel"),
          description: t("feed.hub.recipesDesc"),
          icon: FlaskConical,
        },
        {
          href: "/feed/production",
          label: t("feed.production.navLabel"),
          description: t("feed.hub.productionDesc"),
          icon: Factory,
        },
      ],
    },
    {
      title: t("feed.hub.groupSellingUsing"),
      links: [
        {
          href: "/feed/sales",
          label: t("feed.sales.navLabel"),
          description: t("feed.hub.salesDesc"),
          icon: TrendingUp,
        },
        {
          href: "/feed/usage",
          label: t("feed.usage.navLabel"),
          description: t("feed.hub.usageDesc"),
          icon: Tractor,
        },
      ],
    },
    {
      title: t("feed.reports.title"),
      links: [
        {
          href: "/feed/reports",
          label: t("feed.hub.reportsCostLabel"),
          description: t("feed.hub.reportsCostDesc"),
          icon: BarChart3,
        },
        {
          href: "/feed/reports/profit",
          label: t("feed.reports.profitNavLabel"),
          description: t("feed.hub.profitDesc"),
          icon: PiggyBank,
        },
      ],
    },
  ];
}

export default async function FeedHubPage() {
  const { t } = await getT();
  const groups = buildGroups(t);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t("feed.hub.title")}</h1>
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
