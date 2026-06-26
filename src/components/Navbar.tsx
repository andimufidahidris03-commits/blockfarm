import { Link, useRouterState } from "@tanstack/react-router";

const links = [
  { to: "/", label: "🌾 Petani" },
  { to: "/distributor", label: "🚛 Distributor" },
  { to: "/pedagang", label: "🏪 Pedagang" },
  { to: "/konsumen", label: "📱 Konsumen" },
  { to: "/explorer", label: "⛓️ Explorer" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-100 via-sky-400 to-sky-700 shadow-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="text-2xl">⛓️</span>
          <span className="text-xl font-bold tracking-tight">BlockFarm</span>
          <span className="hidden text-xs opacity-80 sm:inline">Traceability Pertanian</span>
        </Link>
        <nav className="flex flex-wrap gap-1.5">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-white text-sky-700 shadow"
                    : "bg-white/20 text-white hover:bg-white/30")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
