import { createFileRoute } from "@tanstack/react-router";
import { MitraDashboard } from "@/components/MitraDashboard";
import { useBlockchain } from "@/lib/blockchain-context";

export const Route = createFileRoute("/pedagang")({
  head: () => ({ meta: [{ title: "Dashboard Pedagang — BlockFarm" }] }),
  component: PedagangPage,
});

function PedagangPage() {
  const { tambahCatatanPedagang } = useBlockchain();
  return (
    <MitraDashboard
      role="pedagang"
      title="Catatan Penjualan"
      icon="🏪"
      fields={[
        { key: "toko", label: "Nama Toko" },
        { key: "tanggal", label: "Tanggal Diterima", type: "date" },
        { key: "kota", label: "Kota / Lokasi Toko" },
        { key: "harga", label: "Harga Jual", placeholder: "Rp 45.000/kg" },
      ]}
      onSubmit={(pid, data) =>
        tambahCatatanPedagang(pid, {
          toko: data.toko ?? "",
          tanggal: data.tanggal ?? "",
          kota: data.kota ?? "",
          harga: data.harga ?? "",
        })
      }
    />
  );
}
