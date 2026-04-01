import { useLocation, Link } from "react-router-dom";
import {
  MessageSquare,
  Briefcase,
  ImageIcon,
  LayoutDashboard,
  MoreHorizontal,
  TrendingUp,
  Heart,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const mainTabs = [
  { label: "Jarvis", path: "/", icon: MessageSquare, wip: false },
  { label: "Studio", path: "/content-studio", icon: ImageIcon, wip: true },
  { label: "Voxov", path: "/voxov", icon: Briefcase, wip: true },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, wip: false },
];

const moreTabs = [
  { label: "Career", path: "/career", icon: TrendingUp, wip: true },
  { label: "Home", path: "/home", icon: Heart, wip: true },
  { label: "Settings", path: "/settings", icon: Settings, wip: false },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = moreTabs.some((t) => pathname === t.path);

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-16 z-50 px-4 pb-2 md:hidden"
          >
            <div className="bg-sidebar-bg rounded-xl border border-sidebar-border p-3 grid grid-cols-3 gap-2">
              {moreTabs.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className="relative flex flex-col items-center gap-1 py-2 rounded-lg text-sidebar-fg hover:text-sidebar-fg-active"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                  {item.wip && (
                    <span className="absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-sidebar-fg opacity-30" />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-sidebar-bg border-t border-sidebar-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowMore(false)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 ${
                  active ? "text-sidebar-accent" : "text-sidebar-fg"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.wip && (
                  <span className="absolute top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-sidebar-fg opacity-30" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isMoreActive || showMore ? "text-sidebar-accent" : "text-sidebar-fg"
            }`}
          >
            {showMore ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
