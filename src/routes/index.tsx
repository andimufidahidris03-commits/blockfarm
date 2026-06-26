import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useBlockchain } from "@/lib/blockchain-context";
import { formatWIB } from "@/lib/blockchain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Dashboard Petani — BlockFarm" }],
  }),
  component: PetaniPage,
});

function PetaniPage() {
  const { daftarProduk, getAllProducts, getRiwayat, verifikasi } = useBlockchain();
  const [form, setForm] = useState({
    namaProduk: "",
    tanggalPanen: "",
    lokasi: "",
    namaPetani: "",
    catatan: "",
  });
  const [foto, setFoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ txHash: string; productId: string; block: number } | null>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const products = getAllProducts();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.namaProduk || !form.tanggalPanen || !form.lokasi || !form.namaPetani) return;
    setLoading(true);
    try {
      const res = await daftarProduk({ ...form, fotoDataUrl: foto });
      setToast({ txHash: res.txHash, productId: res.productId, block: res.blockNumber });
      setForm({ namaProduk: "", tanggalPanen: "", lokasi: "", namaPetani: "", catatan: "" });
      setFoto(undefined);
      setTimeout(() => setToast(null), 8000);
    } finally {
      setLoading(false);
    }
  }

  function downloadQR(productId: string) {
    const canvas = document.querySelector<HTMLCanvasElement>(`#qr-${productId} canvas`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productId}.png`;
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card title="🌾 Daftarkan Produk Pertanian">
          <form onSubmit={submit} className="space-y-3">
            <Input label="Nama Produk" value={form.namaProduk} onChange={(v) => setForm({ ...form, namaProduk: v })} placeholder="Contoh: Cabai Merah" />
            <Input label="Tanggal Panen" type="date" value={form.tanggalPanen} onChange={(v) => setForm({ ...form, tanggalPanen: v })} />
            <Input label="Lokasi Kebun / Lahan" value={form.lokasi} onChange={(v) => setForm({ ...form, lokasi: v })} placeholder="Desa, Kabupaten" />
            <Input label="Nama Petani" value={form.namaPetani} onChange={(v) => setForm({ ...form, namaPetani: v })} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Foto Produk</label>
              <input type="file" accept="image/*" onChange={onFile} className="block w-full text-sm" />
              {foto && <img src={foto} alt="preview" className="mt-2 h-32 rounded-lg border border-sky-200 object-cover" />}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-2.5 font-semibold text-white shadow hover:shadow-lg disabled:opacity-60"
            >
              {loading ? "Mining block..." : "Daftarkan ke Blockchain"}
            </button>
          </form>
          {toast && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
              <div className="font-bold">✓ Transaksi berhasil dikonfirmasi!</div>
              <div className="mt-1">Product ID: <code className="font-mono">{toast.productId}</code></div>
              <div>Block #{toast.block}</div>
              <div className="break-all">Tx: <code className="font-mono">{toast.txHash}</code></div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <h2 className="text-lg font-bold text-slate-800">Produk Terdaftar ({products.length})</h2>
        {products.length === 0 && <p className="text-sm text-slate-500">Belum ada produk.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map(({ productId, petani }) => {
            if (!petani || petani.type !== "petani") return null;
            const v = verifikasi(productId);
            const riwayat = getRiwayat(productId);
            return (
              <div key={productId} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow-lg">
                {petani.fotoDataUrl && (
                  <img src={petani.fotoDataUrl} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{petani.namaProduk}</h3>
                    <p className="text-xs text-slate-500">{productId}</p>
                  </div>
                  {v.verified ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Terverifikasi ✓</span>
                  ) : (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">Belum Lengkap</span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div>📅 Panen: {petani.tanggalPanen}</div>
                  <div>📍 {petani.lokasi}</div>
                  <div>⛓️ {riwayat.length} transaksi on-chain</div>
                </div>
                <button
                  onClick={() => setQrFor(qrFor === productId ? null : productId)}
                  className="mt-3 w-full rounded-lg border border-sky-300 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
                >
                  {qrFor === productId ? "Sembunyikan QR" : "Generate QR Code"}
                </button>
                {qrFor === productId && (
                  <div className="mt-3 flex flex-col items-center gap-2 rounded-lg bg-sky-50 p-3" id={`qr-${productId}`}>
                    <QRCodeCanvas value={productId} size={160} level="H" includeMargin />
                    <button
                      onClick={() => downloadQR(productId)}
                      className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
                    >
                      ⬇ Unduh PNG
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
      />
    </div>
  );
}
