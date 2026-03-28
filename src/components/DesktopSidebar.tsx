import { useLocation, Link } from "react-router-dom";
import {
  MessageSquare,
  Briefcase,
  ImageIcon,
  FileText,
  TrendingUp,
  Heart,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Jarvis", path: "/", icon: MessageSquare },
  { label: "Business", path: "/business", icon: Briefcase },
  { label: "Image Studio", path: "/image-studio", icon: ImageIcon },
  { label: "Content", path: "/content", icon: FileText },
  { label: "Career", path: "/career", icon: TrendingUp },
  { label: "Life", path: "/life", icon: Heart },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
];

const bottomItems = [
  { label: "Settings", path: "/settings", icon: Settings },
];

export function DesktopSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-sidebar-bg border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <h1 className="font-heading text-sidebar-fg-active text-lg font-semibold tracking-tight">
          Bayati<span className="text-sidebar-accent">OS</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3">
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-hover text-sidebar-fg-active"
                  : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? "text-sidebar-accent" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-hover text-sidebar-fg-active"
                  : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? "text-sidebar-accent" : ""}`} />
              {item.label}
            </Link>
          );
        })}
        {/* User */}
        <div className="mt-3 px-3 py-2 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-primary-foreground">
            FB
          </div>
          <span className="text-xs text-sidebar-fg truncate">Fredrik Bayati</span>
        </div>
      </div>
    </aside>
  );
}
