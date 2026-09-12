import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface HubLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export function HubLinkGrid({ links }: { links: HubLink[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="rounded-full bg-secondary p-2.5">
              <Icon className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{link.label}</p>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
