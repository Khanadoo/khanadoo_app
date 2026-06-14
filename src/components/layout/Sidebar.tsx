"use client";

import Link from "next/link";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "Add Property",
    href: "/properties/new",
  },
  {
    label: "Profile",
    href: "/profile",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-4">
        <h2 className="font-bold text-lg">
          Menu
        </h2>
      </div>

      <nav className="flex flex-col">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-3 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}