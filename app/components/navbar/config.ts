import { BarChart, Home, Settings, User } from "feather-icons-react";

export const navbarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/",
  },
  {
    icon: BarChart,
    name: "Statistics",
    href: "/statistics",
    subRoutes: [
      {
        name: "Upload csv",
        href: "/upload-csv",
      },
    ],
  },
  {
    icon: Settings,
    name: "Settings",
    href: "/settings",
  },
  {
    icon: User,
    name: "Profile",
    href: "/profile",
  },
  {
    icon: User,
    name: "Profile",
    href: "/profile",
  },
];
