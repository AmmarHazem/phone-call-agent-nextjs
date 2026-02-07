"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideMenuNavListItemProps {
  name: string;
  link: string;
}

export function SideMenuNavListItem({ link, name }: SideMenuNavListItemProps) {
  const pathname = usePathname();

  return (
    <li>
      <Link
        className={clsx(
          "cursor-pointer w-full flex py-1 rounded-md hover:bg-neutral-800 px-2",
          { "bg-neutral-800": pathname === link },
        )}
        href={link}
      >
        {name}
      </Link>
    </li>
  );
}
