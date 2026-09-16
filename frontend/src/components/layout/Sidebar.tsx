import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { primaryNavItems, secondaryNavItems, type NavItem } from "./navItems";

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
        }`
      }
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      <div className="px-2">
        <Logo size={30} withWordmark />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {primaryNavItems.map((item) => (
          <NavRow key={item.path} item={item} onNavigate={onNavigate} />
        ))}
        <div className="my-2 border-t border-[var(--color-border)]" />
        {secondaryNavItems.map((item) => (
          <NavRow key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}
