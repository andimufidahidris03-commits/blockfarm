import { useState } from "react";
import { QrScanner } from "./QrScanner";
import { useBlockchain } from "@/lib/blockchain-context";
import { formatWIB, type Block } from "@/lib/blockchain";

export function MitraDashboard({
  role,
  title,
  icon,
  onSubmit,
  fields,
}: {
  role: "distributor" | "pedagang";
  title: string;
  icon: string;
  fields: { key: string; label: string; type?: string; placeholder?: string }[];
  onSubmit: (productId: string, data: Record<string, string>) => Promise<{ txHash: string; blockNumber: number }>;
}) {
  const { getRiwayat } = useBlockchain();
  const [productId, setProductId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ txHash: string; block: number } | null>(null);

  const riwayat = productId ? getRiwayat(productId) : [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    setLoading(true);
    try {
      const res = await onSubmit(productId, form);
      setToast({ txHash: res.txHash, block: res.blockNumber });
      setForm({});
      setTimeout(() => setToast(null), 8000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-800">{icon} Scan / Input Product ID</h2>
          {scanning ? (
            <>
              <QrScanner
                onScan={(text) => {
                  setProductId(text);
                  setScanning(false);
                }}
              />
              <button onClick={() => setScanning(false)} className="mt-2 w-full rounded-lg border border-sky-300 py-1.5 text-sm">
                Batal Scan
              </button>
            </>
          ) : (
            <button
              onClick={() => setScanning(true)}
              className="w-full rounded-lg bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200"
            >
              📷 Buka Kamera Scanner
            </button>
          )}
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">atau input manual</label>
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value.toUpperCase())}
              placeholder="PRD-XXXXXXXX"
              className="w-full rounded-lg border border-sky-200 px-3 py-2 font-mono text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {productId && (
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-slate-800">📜 Riwayat Saat Ini ({riwayat.length} tx)</h3>
            {riwayat.length === 0 ? (
              <p className="text-sm text-rose-600">Produk tidak ditemukan di blockchain.</p>
            ) : (
              <ul className="space-y-2">
                {riwayat.map((b) => <RiwayatItem key={b.transactionHash} block={b} />)}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">📝 {title}</h2>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <input
                type={f.type ?? "text"}
                value={form[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading || !productId || riwayat.length === 0}
            className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-2.5 font-semibold text-white shadow hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Mining block..." : `Tambah Catatan ${role === "distributor" ? "Distributor" : "Pedagang"}`}
          </button>
        </form>
        {toast && (
          <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            <div className="font-bold">✓ Tx dikonfirmasi · Block #{toast.block}</div>
            <div className="break-all font-mono">{toast.txHash}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiwayatItem({ block }: { block: Block }) {
  if (!("catatan" in block.data)) return null;
  const c = block.data.catatan;
  const label = c.type === "petani" ? "🌾 Petani" : c.type === "distributor" ? "🚛 Distributor" : "🏪 Pedagang";
  return (
    <li className="rounded-lg border border-sky-100 bg-sky-50/50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500">Block #{block.nomorBlok}</span>
      </div>
      <div className="mt-1 text-slate-600">{formatWIB(block.timestamp)}</div>
      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-[10px] text-slate-500">{JSON.stringify(c, null, 0).slice(0, 200)}</pre>
    </li>
  );
}
