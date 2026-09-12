import { LayoutGrid, ClipboardList, Package, TrendingUp, BarChart3 } from "lucide-react";
import { HubLinkGrid } from "@/components/hub-links";

const GROUPS = [
  {
    title: "Daily Operations",
    links: [
      {
        href: "/eggs/cages",
        label: "Cages",
        description: "Manage cages and chicken counts",
        icon: LayoutGrid,
      },
      {
        href: "/eggs/log",
        label: "Log Eggs",
        description: "Enter today's egg collection",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Selling",
    links: [
      {
        href: "/eggs/box-types",
        label: "Box Types",
        description: "Manage egg box sizes",
        icon: Package,
      },
      {
        href: "/eggs/sales",
        label: "Sales",
        description: "Eggs sold, by box or loose",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Reports",
    links: [
      {
        href: "/eggs/reports",
        label: "Reports",
        description: "Daily and range egg totals",
        icon: BarChart3,
      },
    ],
  },
];

export default function EggsHubPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Eggs</h1>
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
