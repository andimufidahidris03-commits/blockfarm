import { ethers } from "ethers";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import blockFarmArtifact from "../../../artifacts/contracts/BlockFarm.sol/BlockFarm.json";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BlockchainSimulator } from "../blockchain";
import { loadBlockchain, saveBlockchain } from "../blockchain-storage";

const saved = loadBlockchain();

const chain = new BlockchainSimulator(
  saved.blocks,
  saved.contractAddress
);

const provider = new ethers.JsonRpcProvider(
  "http://127.0.0.1:8545"
);

const signer = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function tambahProduk(string,string,string,string,string)",
  "function jumlahProduk() view returns (uint256)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  signer
);

export const daftarProdukApi = createServerFn({ method: "POST" })
  .inputValidator(
  z.object({
    namaProduk: z.string(),
    tanggalPanen: z.string(),
    lokasi: z.string(),
    namaPetani: z.string(),
    catatan: z.string(),
    fotoDataUrl: z.string().optional(),
  })
)

  .handler(async ({ data }) => {
  console.log("=== MASUK HANDLER ===");
  console.log(data);

  await chain.ensureGenesis();

   const productId =
  "PRD-" + Math.random().toString(36).slice(2, 10).toUpperCase();

const tx = await contract.tambahProduk(
  productId,
  data.namaProduk,
  data.namaPetani,
  data.lokasi,
  data.tanggalPanen
);

await tx.wait();

console.log("SMART CONTRACT TX:", tx.hash);

const block = await chain.mine({
  productId,
  catatan: {
    type: "petani",
    namaProduk: data.namaProduk,
    tanggalPanen: data.tanggalPanen,
    lokasi: data.lokasi,
    namaPetani: data.namaPetani,
    catatan: data.catatan,
    fotoDataUrl: data.fotoDataUrl,
  },
});

saveBlockchain({
  blocks: chain.blocks,
  contractAddress: chain.contractAddress,
});

   console.log("BLOCKCHAIN DISIMPAN");
   console.log(chain.blocks.length);

   return {
  success: true,
  productId,
  blockNumber: block.nomorBlok,
  txHash: tx.hash,
};
});

export const getBlockchainApi = createServerFn({ method: "GET" })
  .handler(async () => {
    await chain.ensureGenesis();

    return {
      totalBlocks: chain.blocks.length,
      blocks: chain.blocks,
    };
  });

export const verifikasiBlockchainApi = createServerFn({ method: "GET" })
  .handler(async () => {
    return await chain.verifikasiRantai();
  });