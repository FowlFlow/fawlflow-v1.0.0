import Image from "next/image";
import { LoginForm } from "./login-form";
import { getT } from "@/lib/i18n/server";

export default async function LoginPage() {
  const { t } = await getT();

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden items-center justify-center bg-white p-12 md:flex md:w-1/2 lg:w-3/5">
        <Image
          src="/login.png"
          alt=""
          width={2463}
          height={1384}
          className="h-auto w-full max-w-xl"
          priority
        />
      </div>
      <div className="flex w-full items-center justify-center p-6 sm:p-10 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2">
            <Image src="/logo-icon.svg" alt="" width={40} height={38} />
            <span className="text-2xl font-bold">FawlFlow</span>
          </div>
          <h1 className="mb-6 text-2xl font-bold text-primary">
            {t("auth.getStarted")}
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
