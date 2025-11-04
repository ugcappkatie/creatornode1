"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  LayersIcon,
  ImageIcon,
  CalendarIcon,
  ScissorsIcon,
  RocketIcon,
  ChatBubbleIcon,
  GearIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

const nav = [
  { label: "Dashboard", href: "/", Icon: HomeIcon },
  { label: "Projects & Deals", href: "/projects", Icon: LayersIcon },
  { label: "Content Ideas", href: "/ideas", Icon: ImageIcon },
  { label: "Planning", href: "#", Icon: CalendarIcon },
  { label: "Editing", href: "/editing", Icon: ScissorsIcon },
  { label: "Get Work", href: "#", Icon: RocketIcon },
  { label: "Community", href: "/connect", Icon: ChatBubbleIcon },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "w-[220px] shrink-0 rounded-[16px] bg-white border border-[#efefef] shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="text-[20px] font-semibold mb-6">Creator Node</div>
        <div className="text-xs text-neutral-500 uppercase mb-3">Menu</div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.Icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px]",
                  isActive
                    ? "bg-black text-white"
                    : "hover:bg-neutral-100 text-neutral-700"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] hover:bg-neutral-100 text-neutral-700 mb-2"
          )}
        >
          <GearIcon className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <Link href="/account" className="flex items-center gap-3 rounded-[12px] bg-neutral-50 p-2 hover:bg-neutral-100">
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
            <PersonIcon className="h-4 w-4 text-neutral-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Megan Smith</span>
            <span className="text-xs text-amber-600">Pro User</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}


