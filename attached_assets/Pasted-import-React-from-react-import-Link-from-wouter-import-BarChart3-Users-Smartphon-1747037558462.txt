import React from "react";
import { Link } from "wouter";
import {
  BarChart3,
  Users,
  Smartphone,
  TagIcon,
  BoxIcon,
  ListChecks,
  Settings,
  ShoppingBag,
  MonitorSmartphone,
  Layers,
  CheckCircle,
  Briefcase,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  active
}) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary",
          active ? "bg-gray-100 text-primary font-medium" : ""
        )}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </a>
    </Link>
  );
};

interface AdminSidebarProps {
  activePath: string;
}

export function AdminSidebar({ activePath }: AdminSidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-white h-full overflow-y-auto">
      <div className="p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dashboard
        </h3>
        <nav className="mt-5 space-y-1">
          <SidebarItem
            icon={<BarChart3 className="h-5 w-5" />}
            label="Overview"
            href="/admin"
            active={activePath === "/admin"}
          />
          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            label="Users"
            href="/admin/users"
            active={activePath === "/admin/users"}
          />
        </nav>
        
        <h3 className="mt-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Device Management
        </h3>
        <nav className="mt-5 space-y-1">
          <SidebarItem
            icon={<Smartphone className="h-5 w-5" />}
            label="Device Types"
            href="/admin/device-types"
            active={activePath === "/admin/device-types"}
          />
          <SidebarItem
            icon={<TagIcon className="h-5 w-5" />}
            label="Brands"
            href="/admin/AdminBrands"
            active={activePath === "/admin/AdminBrands"}
          />
          <SidebarItem
            icon={<MonitorSmartphone className="h-5 w-5" />}
            label="Device Models"
            href="/admin/AdminModels"
            active={activePath === "/admin/AdminModels"}
          />
          <SidebarItem
            icon={<Layers className="h-5 w-5" />}
            label="Device Inventory"
            href="/devices"
            active={activePath === "/devices"}
          />
        </nav>
        
        <h3 className="mt-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Buyback Program
        </h3>
        <nav className="mt-5 space-y-1">
          <SidebarItem
            icon={<BoxIcon className="h-5 w-5" />}
            label="Buyback Requests"
            href="/buyback"
            active={activePath === "/buyback"}
          />
          <SidebarItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Condition Questions"
            href="/admin/AdminCQS"
            active={activePath === "/admin/AdminCQS"}
          />
          <SidebarItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Valuations"
            href="/admin/valuations"
            active={activePath === "/admin/valuations"}
          />
        </nav>
        
        <h3 className="mt-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Marketplace
        </h3>
        <nav className="mt-5 space-y-1">
          <SidebarItem
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Listings"
            href="/marketplace"
            active={activePath === "/marketplace"}
          />
          <SidebarItem
            icon={<ListChecks className="h-5 w-5" />}
            label="Orders"
            href="/orders"
            active={activePath === "/orders"}
          />
        </nav>
        
        <h3 className="mt-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </h3>
        <nav className="mt-5 space-y-1">
          <SidebarItem
            icon={<HelpCircle className="h-5 w-5" />}
            label="FAQs"
            href="/admin/faqs"
            active={activePath === "/admin/faqs"}
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="System Settings"
            href="/admin/settings"
            active={activePath === "/admin/settings"}
          />
        </nav>
      </div>
    </div>
  );
}