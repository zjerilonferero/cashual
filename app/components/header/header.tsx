"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { navbarItems } from "../navbar/config";

export default function Header() {
  const pathname = usePathname();

  const currentRoute = useMemo(() => {
    const exactMatch = navbarItems.find((link) => link.href === pathname);
    if (exactMatch) return exactMatch;

    return navbarItems.find(
      (link) => link.href !== "/" && pathname.startsWith(link.href),
    );
  }, [pathname]);

  return (
    <header className="h-20 flex justify-center items-center text-xs text-muted">
      {currentRoute?.name}
    </header>
  );
}
