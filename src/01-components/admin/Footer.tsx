"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, DollarSign, CreditCard } from "lucide-react";

export const Footer = () => {
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClass =
      "flex flex-col items-center p-2 rounded-md transition-colors hover:bg-gray-100";
    const activeClass = isActive
      ? "text-purple-900 font-bold"
      : "text-gray-700";
    const iconBaseClass = "h-5 w-5 mb-1";
    const iconActiveClass = isActive ? "text-purple-900" : "text-gray-600";

    return {
      link: `${baseClass} ${activeClass}`,
      icon: `${iconBaseClass} ${iconActiveClass}`,
      text: `${activeClass} text-xs font-medium`,
    };
  };

  return (
    <div className="flex justify-around">
      <Link href="/admin/users" className={getLinkClasses("/admin/users").link}>
        <Users className={getLinkClasses("/admin/users").icon} />
        <span className={getLinkClasses("/admin/users").text}>Usuarios</span>
      </Link>
      <Link
        href="/admin/tarifas"
        className={getLinkClasses("/admin/tarifas").link}
      >
        <DollarSign className={getLinkClasses("/admin/tarifas").icon} />
        <span className={getLinkClasses("/admin/tarifas").text}>Tarifas</span>
      </Link>
      <Link href="/admin/pagos" className={getLinkClasses("/admin/pagos").link}>
        <CreditCard className={getLinkClasses("/admin/pagos").icon} />
        <span className={getLinkClasses("/admin/pagos").text}>Pagos</span>
      </Link>
    </div>
  );
};
