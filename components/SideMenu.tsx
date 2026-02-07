import { SideMenuNavListItem } from "./SideMenuNavListItem";

export function SideMenu() {
  return (
    <nav
      className="h-full w-80 bg-neutral-900 p-4"
      aria-label="Main Navigation"
    >
      <ul className="flex flex-col gap-2">
        <SideMenuNavListItem name={"Home"} link={"/"} />
        <SideMenuNavListItem name={"Profile"} link={"/profile"} />
        <SideMenuNavListItem name={"Settings"} link={"/settings"} />
      </ul>
    </nav>
  );
}
