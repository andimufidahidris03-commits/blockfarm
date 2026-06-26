import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useBlockchain } from "@/lib/blockchain-context";
import { formatWIB } from "@/lib/blockchain";

export const Route = createFileRoute("/explorer")({
  head: () => ({ meta: [{ title: "Blockchain Explorer — BlockFarm" }] }),
  component: ExplorerPage,
});

function ExplorerPage() {
  const { blocks, chain, tamperDemo, resetDemo } = useBlockchain();

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    errorAt?: number;
  } | null>(null);

  async function verify() {
    setVerifying(true);
    setResult(null);

    const r = await chain.verifikasiRantai();

    setResult(r);
    setVerifying(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              ⛓️ Blockchain Explorer
            </h1>

            <p className="text-sm text-slate-600">
              {blocks.length} blok · Contract{" "}
              <code className="font-mono text-xs">
                {chain.contractAddress}
              </code>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={verify}
              disabled={verifying}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg disabled:opacity-60"
            >
              {verifying
                ? "Memverifikasi..."
                : "🔍 Verifikasi Integritas Rantai"}
            </button>

            <button
              onClick={tamperDemo}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
            >
              🚨 Simulasi Manipulasi Data
            </button>

            <button
              onClick={resetDemo}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              🔄 Reset Blockchain
            </button>
          </div>
        </div>

        {result && (
          <div
            className={
              "mt-3 rounded-lg p-3 text-sm " +
              (result.valid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700")
            }
          >
            {result.valid
              ? "✅ Blockchain Valid. Tidak ditemukan perubahan atau manipulasi data."
              : `🚨 Manipulasi Data Terdeteksi! Data pada Block #${result.errorAt} telah berubah sehingga integritas blockchain tidak lagi valid.`}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {[...blocks].reverse().map((b) => (
          <div
            key={b.transactionHash}
            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 px-3 py-1 text-sm font-bold text-white">
                  Block #{b.nomorBlok}
                </span>

                {"genesis" in b.data && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    GENESIS
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-500">
                {formatWIB(b.timestamp)}
              </span>
            </div>

            <dl className="mt-3 grid gap-2 text-xs">
              <KV k="Tx Hash" v={b.transactionHash} />
              <KV k="Previous Hash" v={b.previousHash} />
              <KV k="Block Hash" v={b.hash} />

              <div>
                <dt className="text-slate-500">Data</dt>

                <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                  {JSON.stringify(b.data, null, 2)}
                </pre>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="break-all font-mono text-slate-700">{v}</dd>
    </div>
  );
}