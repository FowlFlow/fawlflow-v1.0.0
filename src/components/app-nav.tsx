"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wheat, Egg, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/client";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: Home, match: "/" },
  { href: "/feed", labelKey: "nav.feed", icon: Wheat, match: "/feed" },
  { href: "/eggs", labelKey: "nav.eggs", icon: Egg, match: "/eggs" },
  { href: "/contacts", labelKey: "nav.contacts", icon: Users, match: "/contacts" },
  { href: "/settings", labelKey: "nav.settings", icon: Settings, match: "/settings" },
];

function isActive(pathname: string, match: string) {
  if (match === "/") return pathname === "/";
  return pathname.startsWith(match);
}

export function AppNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <>
      <nav className="hidden shrink-0 flex-col gap-1 border-r p-4 md:flex md:w-56">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t bg-background md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
