import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrScanner } from "@/components/QrScanner";
import { useBlockchain } from "@/lib/blockchain-context";
import { formatWIB, type Block } from "@/lib/blockchain";

export const Route = createFileRoute("/konsumen")({
  head: () => ({ meta: [{ title: "Cek Keaslian Produk — BlockFarm" }] }),
  component: KonsumenPage,
});

function KonsumenPage() {
  const { getRiwayat, verifikasi, chain } = useBlockchain();
  const [productId, setProductId] = useState("");
  const [scanning, setScanning] = useState(false);

  const riwayat = productId ? getRiwayat(productId) : [];
  const v = productId ? verifikasi(productId) : { verified: false, tahapan: [] };
  const ditemukan = riwayat.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <h1 className="text-3xl font-bold text-slate-900">📱 Cek Keaslian Produk</h1>
        <p className="mt-1 text-sm text-slate-600">Scan QR code pada kemasan untuk melihat perjalanan produk.</p>

        {scanning ? (
          <div className="mt-4">
            <QrScanner
              onScan={(text) => {
                setProductId(text);
                setScanning(false);
              }}
            />
            <button onClick={() => setScanning(false)} className="mt-2 rounded-lg border border-sky-300 px-4 py-1.5 text-sm">
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setScanning(true)}
            className="mt-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-700 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl"
          >
            📷 Buka Scanner QR
          </button>
        )}

        <div className="mx-auto mt-4 max-w-sm">
          <label className="mb-1 block text-xs text-slate-500">atau input ID manual</label>
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value.toUpperCase())}
            placeholder="PRD-XXXXXXXX"
            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-center font-mono focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {productId && !ditemukan && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-6 text-center">
          <div className="text-3xl">⚠️</div>
          <div className="mt-2 text-xl font-bold text-rose-700">TIDAK TERVERIFIKASI</div>
          <div className="mt-1 text-sm text-rose-600">Produk tidak ditemukan di blockchain.</div>
        </div>
      )}

      {ditemukan && (
        <>
          {v.verified ? (
            <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center shadow">
              <div className="text-4xl">✅</div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">TERVERIFIKASI</div>
              <div className="text-sm text-emerald-600">Produk Asli — Rantai pasok lengkap</div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center">
              <div className="text-4xl">⚠️</div>
              <div className="mt-2 text-xl font-bold text-amber-700">RANTAI BELUM LENGKAP</div>
              <div className="text-sm text-amber-600">
                Tahap tercatat: {v.tahapan.join(", ") || "-"}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">🛤️ Perjalanan Produk</h2>
            <Timeline blocks={riwayat} />
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">🔗 Metadata Blockchain</h3>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <Meta label="Product ID" value={productId} />
              <Meta label="Total Transaksi" value={String(riwayat.length)} />
              <Meta label="Block Terakhir" value={`#${riwayat[riwayat.length - 1].nomorBlok}`} />
              <Meta
  label="Contract Address"
  value="0x5FbDB2315678afecb367f032d93F642f64180aa3"
  mono
/>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-sky-50 p-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={"break-all text-slate-800 " + (mono ? "font-mono" : "font-semibold")}>{value}</dd>
    </div>
  );
}

function Timeline({ blocks }: { blocks: Block[] }) {
  return (
    <ol className="relative space-y-6 border-l-2 border-sky-200 pl-6">
      {blocks.map((b) => {
        if (!("catatan" in b.data)) return null;
        const c = b.data.catatan;
        const meta =
          c.type === "petani"
            ? { icon: "🌾", title: "Petani", color: "bg-emerald-500" }
            : c.type === "distributor"
              ? { icon: "🚛", title: "Distributor", color: "bg-sky-500" }
              : { icon: "🏪", title: "Pedagang", color: "bg-indigo-500" };
        return (
          <li key={b.transactionHash} className="relative">
            <span className={`absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full text-white shadow ${meta.color}`}>
              {meta.icon}
            </span>
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">{meta.title}</h4>
                <span className="text-[10px] text-slate-500">Block #{b.nomorBlok}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{formatWIB(b.timestamp)}</div>
              <dl className="mt-2 grid gap-1 text-sm text-slate-700">
                {c.type === "petani" && (
                  <>
                    <Row k="Produk" v={c.namaProduk} />
                    <Row k="Petani" v={c.namaPetani} />
                    <Row k="Panen" v={c.tanggalPanen} />
                    <Row k="Lokasi" v={c.lokasi} />
                    {c.catatan && <Row k="Catatan" v={c.catatan} />}
                    {c.fotoDataUrl && <img src={c.fotoDataUrl} alt="" className="mt-2 max-h-40 rounded-lg" />}
                  </>
                )}
                {c.type === "distributor" && (
                  <>
                    <Row k="Perusahaan" v={c.perusahaan} />
                    <Row k="Diterima" v={c.tanggal} />
                    <Row k="Gudang" v={c.lokasi} />
                    <Row k="Catatan" v={c.catatan} />
                  </>
                )}
                {c.type === "pedagang" && (
                  <>
                    <Row k="Toko" v={c.toko} />
                    <Row k="Diterima" v={c.tanggal} />
                    <Row k="Kota" v={c.kota} />
                    <Row k="Harga" v={c.harga} />
                  </>
                )}
              </dl>
              <div className="mt-2 break-all border-t border-sky-100 pt-2 font-mono text-[10px] text-slate-400">
                tx: {b.transactionHash}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <dt className="w-20 shrink-0 text-slate-500">{k}</dt>
      <dd className="text-slate-800">{v}</dd>
    </div>
  );
}
