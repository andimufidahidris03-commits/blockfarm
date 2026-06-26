import { createFileRoute } from "@tanstack/react-router";
import { MitraDashboard } from "@/components/MitraDashboard";
import { useBlockchain } from "@/lib/blockchain-context";

export const Route = createFileRoute("/distributor")({
  head: () => ({ meta: [{ title: "Dashboard Distributor — BlockFarm" }] }),
  component: DistributorPage,
});

function DistributorPage() {
  const { tambahCatatanDistributor } = useBlockchain();
  return (
    <MitraDashboard
      role="distributor"
      title="Catatan Distribusi"
      icon="🚛"
      fields={[
        { key: "perusahaan", label: "Nama Perusahaan Distributor" },
        { key: "tanggal", label: "Tanggal Diterima", type: "date" },
        { key: "lokasi", label: "Lokasi Gudang" },
        { key: "catatan", label: "Suhu / Kondisi Barang", placeholder: "Suhu 4°C, kondisi baik" },
      ]}
      onSubmit={(pid, data) =>
        tambahCatatanDistributor(pid, {
          perusahaan: data.perusahaan ?? "",
          tanggal: data.tanggal ?? "",
          lokasi: data.lokasi ?? "",
          catatan: data.catatan ?? "",
        })
      }
    />
  );
}
