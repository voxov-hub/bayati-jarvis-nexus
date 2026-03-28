import { Outlet } from "react-router-dom";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileNav";

export function Layout() {
  return (
    <div className="flex h-screen-safe w-full overflow-hidden">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
