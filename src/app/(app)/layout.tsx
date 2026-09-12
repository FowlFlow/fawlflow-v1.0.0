import { Suspense } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { FlashToast } from "@/components/flash-toast";
import { LanguageToggle } from "@/components/language-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const { t } = await getT();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="" width={28} height={26} />
          <span className="text-lg font-bold">FowlFlow</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LanguageToggle />
          <span className="hidden sm:inline">{session?.user?.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              aria-label={t("common.signOut")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "text-muted-foreground",
              )}
            >
              <LogOut />
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <AppNav />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
