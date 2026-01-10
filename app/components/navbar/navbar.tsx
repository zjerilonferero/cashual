"use client";

import classNames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import React, { ViewTransition } from "react";
import { navbarItems } from "./config";
export default function Navbar() {
  return (
    <nav className="sticky bottom-0">
      <ul className="flex flex-row justify-center">
        {navbarItems.map((navItem, index) => (
          <NavItem {...navItem} key={index} />
        ))}
      </ul>
    </nav>
  );
}

type NavItemProps = {
  icon: React.JSX.ElementType;
  name: string;
  href: string;
  subRoutes?: { name: string; href: string }[];
};

function NavItem(props: NavItemProps) {
  const { icon: Icon, href, subRoutes } = props;
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    subRoutes?.find((subRoute) => pathname.includes(subRoute.href));
  const router = useRouter();

  return (
    <li
      onClick={() => router.push(href)}
      className={classNames(
        "size-20 flex justify-center items-center text-gray-400 opacity-40 flex-col space-y-2",
        { "opacity-100": isActive },
      )}
    >
      <Icon />
      {isActive && (
        <ViewTransition name="nav-indicator">
          <div className="size-2 bg-primary rounded" />
        </ViewTransition>
      )}
    </li>
  );
}
