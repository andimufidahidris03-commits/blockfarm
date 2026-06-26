import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BlockchainSimulator, type Block, type Catatan } from "./blockchain";
import {
  daftarProdukApi,
  getBlockchainApi,
} from "./api/blockchain.functions";

type Ctx = {
  chain: BlockchainSimulator;
  blocks: Block[];
  daftarProduk: (data: {
    namaProduk: string;
    tanggalPanen: string;
    lokasi: string;
    namaPetani: string;
    catatan: string;
    fotoDataUrl?: string;
  }) => Promise<{ productId: string; txHash: string; blockNumber: number }>;
  tambahCatatanDistributor: (
    productId: string,
    data: { perusahaan: string; tanggal: string; lokasi: string; catatan: string }
  ) => Promise<{ txHash: string; blockNumber: number }>;
  tambahCatatanPedagang: (
    productId: string,
    data: { toko: string; tanggal: string; kota: string; harga: string }
  ) => Promise<{ txHash: string; blockNumber: number }>;
  getRiwayat: (productId: string) => Block[];
  verifikasi: (productId: string) => { verified: boolean; tahapan: string[] };
  getAllProducts: () => { productId: string; petani: Catatan | null }[];
  tamperDemo: () => void;
  resetDemo: () => void;
};

const BlockchainContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "blockfarm_chain_v1";

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [chain] = useState(() => new BlockchainSimulator());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ready, setReady] = useState(false);

useEffect(() => {
  (async () => {
    try {
      const serverData = await getBlockchainApi();

      console.log("DATA DARI BACKEND:", serverData);

      chain.blocks = serverData.blocks ?? [];

      setBlocks([...chain.blocks]);
      setReady(true);
    } catch (err) {
      console.error("GAGAL MEMUAT BLOCKCHAIN:", err);

      setBlocks([]);
      setReady(true);
    }
  })();
}, []);

function persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ blocks: chain.blocks, contractAddress: chain.contractAddress })
    );
  }

  function sync() {
    setBlocks([...chain.blocks]);
    persist();
  }

 const value: Ctx = {
  chain,
  blocks,

 tamperDemo: () => {
  const target = chain.blocks.find(
    (b) =>
      "productId" in b.data &&
      "catatan" in b.data &&
      b.data.catatan.type === "petani"
  );

  if (!target) return;

  const data = target.data as {
    productId: string;
    catatan: Catatan;
  };

  if (data.catatan.type === "petani") {
    data.catatan.namaProduk = "PRODUK TELAH DIMANIPULASI";
  }

  alert(
    "⚠️ Manipulasi Data Berhasil!\n\n" +
      "Nama produk telah diubah secara ilegal.\n\n" +
      "Silakan klik 'Verifikasi Integritas Rantai' untuk melihat apakah blockchain masih valid."
  );

  setBlocks([...chain.blocks]);

  localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify({
    blocks: chain.blocks,
    contractAddress: chain.contractAddress,
  })
);
},

resetDemo: () => {
  localStorage.removeItem(STORAGE_KEY);

  alert(
    "🔄 Blockchain berhasil direset.\n\n" +
    "Data demo akan dimuat ulang dan blockchain kembali ke kondisi awal."
  );

  window.location.reload();
},

  daftarProduk: async (data) => {
  const result = await daftarProdukApi({
  data: {
    namaProduk: data.namaProduk,
    tanggalPanen: data.tanggalPanen,
    lokasi: data.lokasi,
    namaPetani: data.namaPetani,
    catatan: data.catatan,
    fotoDataUrl: data.fotoDataUrl,
  },
});

  try {
    const latest = await getBlockchainApi();

    chain.blocks = latest.blocks ?? [];

    setBlocks([...chain.blocks]);
  } catch (err) {
    console.error("GAGAL REFRESH BLOCKCHAIN:", err);
  }

  return {
    productId: result.productId,
    txHash: result.txHash,
    blockNumber: result.blockNumber,
  };
},

  tambahCatatanDistributor: async (productId, data) => {
    const block = await chain.mine({
      productId,
      catatan: { type: "distributor", ...data },
    });

    sync();

    return {
      txHash: block.transactionHash,
      blockNumber: block.nomorBlok,
    };
  },

  tambahCatatanPedagang: async (productId, data) => {
    const block = await chain.mine({
      productId,
      catatan: { type: "pedagang", ...data },
    });

    sync();

    return {
      txHash: block.transactionHash,
      blockNumber: block.nomorBlok,
    };
  },

  getRiwayat: (productId) => chain.getRiwayatProduk(productId),

  verifikasi: (productId) => chain.verifikasiProduk(productId),

  getAllProducts: () => {
    return chain.getAllProductIds().map((pid) => {
      const riwayat = chain.getRiwayatProduk(pid);

      const petaniBlock = riwayat.find(
        (b) =>
          "catatan" in b.data &&
          b.data.catatan.type === "petani"
      );

      const petani =
        petaniBlock &&
        "catatan" in petaniBlock.data
          ? petaniBlock.data.catatan
          : null;

      return {
        productId: pid,
        petani,
      };
    });
  },
};

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-sky-700">Memuat blockchain...</div>
      </div>
    );
  }

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error("useBlockchain must be used within BlockchainProvider");
  return ctx;
}
