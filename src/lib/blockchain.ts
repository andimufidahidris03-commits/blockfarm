// Simulasi Blockchain untuk BlockFarm
export type CatatanPetani = {
  type: "petani";
  namaProduk: string;
  tanggalPanen: string;
  lokasi: string;
  namaPetani: string;
  catatan: string;
  fotoDataUrl?: string;
};

export type CatatanDistributor = {
  type: "distributor";
  perusahaan: string;
  tanggal: string;
  lokasi: string;
  catatan: string;
};

export type CatatanPedagang = {
  type: "pedagang";
  toko: string;
  tanggal: string;
  kota: string;
  harga: string;
};

export type Catatan = CatatanPetani | CatatanDistributor | CatatanPedagang;

export type Block = {
  nomorBlok: number;
  timestamp: number;
  transactionHash: string;
  previousHash: string;
  data: {
    productId: string;
    catatan: Catatan;
  } | { genesis: true };
  hash: string;
};

function randomHex(len: number): string {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

async function sha256(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const buf = new TextEncoder().encode(input);
    const hash = await window.crypto.subtle.digest("SHA-256", buf);
    return "0x" + Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // fallback simple hash
  let h = 0;
  for (let i = 0; i < input.length; i++) h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  return "0x" + Math.abs(h).toString(16).padStart(64, "0");
}

export class BlockchainSimulator {
  blocks: Block[] = [];
  contractAddress: string;

  constructor(initial?: Block[], contractAddress?: string) {
    this.contractAddress = contractAddress ?? randomHex(40);
    if (initial && initial.length > 0) {
      this.blocks = initial;
    }
  }

  async ensureGenesis() {
    if (this.blocks.length === 0) {
      const genesis: Block = {
        nomorBlok: 0,
        timestamp: Date.now(),
        transactionHash: randomHex(64),
        previousHash: "0x" + "0".repeat(64),
        data: { genesis: true },
        hash: "",
      };
      genesis.hash = await sha256(JSON.stringify({ ...genesis, hash: undefined }));
      this.blocks.push(genesis);
    }
  }

  async mine(data: Block["data"]): Promise<Block> {
    await this.ensureGenesis();
    const prev = this.blocks[this.blocks.length - 1];
    const block: Block = {
      nomorBlok: prev.nomorBlok + 1,
      timestamp: Date.now(),
      transactionHash: randomHex(64),
      previousHash: prev.hash,
      data,
      hash: "",
    };
    block.hash = await sha256(JSON.stringify({ ...block, hash: undefined }));
    this.blocks.push(block);
    return block;
  }

  getRiwayatProduk(productId: string): Block[] {
    return this.blocks.filter(
      (b) => "productId" in b.data && b.data.productId === productId
    );
  }

  getAllProductIds(): string[] {
    const ids = new Set<string>();
    for (const b of this.blocks) {
      if ("productId" in b.data) ids.add(b.data.productId);
    }
    return Array.from(ids);
  }

  verifikasiProduk(productId: string): { verified: boolean; tahapan: string[] } {
    const riwayat = this.getRiwayatProduk(productId);
    const tahapan = riwayat
      .map((b) => ("catatan" in b.data ? b.data.catatan.type : ""))
      .filter(Boolean);
    const verified =
      tahapan.includes("petani") &&
      tahapan.includes("distributor") &&
      tahapan.includes("pedagang");
    return { verified, tahapan };
  }

  async verifikasiRantai(): Promise<{ valid: boolean; errorAt?: number }> {
    for (let i = 0; i < this.blocks.length; i++) {
      const b = this.blocks[i];
      const recomputed = await sha256(JSON.stringify({ ...b, hash: undefined }));
      if (recomputed !== b.hash) return { valid: false, errorAt: i };
      if (i > 0 && b.previousHash !== this.blocks[i - 1].hash)
        return { valid: false, errorAt: i };
    }
    return { valid: true };
  }
}

export function formatWIB(ts: number): string {
  const d = new Date(ts);
  return (
    d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "medium",
    }) + " WIB"
  );
}
