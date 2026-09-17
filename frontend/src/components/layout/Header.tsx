import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearchSubmit} className="relative max-w-md flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files, folders..."
          aria-label="Search files and folders"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <button
          className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-sm font-semibold text-[var(--color-brand-contrast)]"
          >
            {user ? initials(user.name) || <UserIcon size={16} /> : <UserIcon size={16} />}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 shadow-lg"
            >
              <div className="border-b border-[var(--color-border)] px-3 py-2">
                <p className="truncate text-sm font-medium text-[var(--color-text)]">{user?.name}</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
