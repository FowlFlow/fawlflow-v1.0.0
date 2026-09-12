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

const GROUPS = [
  {
    title: "Inventory",
    links: [
      {
        href: "/feed/materials",
        label: "Materials",
        description: "Stock levels and prices",
        icon: Package,
      },
      {
        href: "/feed/purchases",
        label: "Purchases",
        description: "What you've bought",
        icon: ShoppingCart,
      },
      {
        href: "/feed/prices",
        label: "Prices",
        description: "Update selling prices",
        icon: Tag,
      },
    ],
  },
  {
    title: "Making Feed",
    links: [
      {
        href: "/feed/types",
        label: "Recipes",
        description: "What goes into each feed",
        icon: FlaskConical,
      },
      {
        href: "/feed/production",
        label: "Production",
        description: "Batches you've made",
        icon: Factory,
      },
    ],
  },
  {
    title: "Selling & Using",
    links: [
      {
        href: "/feed/sales",
        label: "Sales",
        description: "Feed and material sold",
        icon: TrendingUp,
      },
      {
        href: "/feed/usage",
        label: "Farm Use",
        description: "Feed used on the farm",
        icon: Tractor,
      },
    ],
  },
  {
    title: "Reports",
    links: [
      {
        href: "/feed/reports",
        label: "Cost & Stock",
        description: "Daily production cost and stock summary",
        icon: BarChart3,
      },
      {
        href: "/feed/reports/profit",
        label: "Profit",
        description: "Profit from material and feed sales",
        icon: PiggyBank,
      },
    ],
  },
];

export default function FeedHubPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Feed</h1>
      {GROUPS.map((group) => (
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
