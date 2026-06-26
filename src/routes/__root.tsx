import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BlockchainProvider } from "../lib/blockchain-context";
import { Navbar } from "../components/Navbar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-sky-700">404</h1>
        <p className="mt-2 text-sm text-slate-600">Halaman tidak ditemukan.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BlockFarm — Traceability Pertanian Blockchain" },
      { name: "description", content: "Sistem keterlacakan produk pertanian berbasis blockchain." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </main>
          <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-500">
            BlockFarm · Simulasi Blockchain Ethereum · Berjalan sepenuhnya di browser
          </footer>
        </div>
      </BlockchainProvider>
    </QueryClientProvider>
  );
}
