import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BlockchainSimulator } from "../blockchain";

const chain = new BlockchainSimulator();

export const daftarProdukApi = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      namaProduk: z.string(),
      tanggalPanen: z.string(),
      lokasi: z.string(),
      namaPetani: z.string(),
      catatan: z.string(),
    })
  )
  .handler(async ({ data }) => {
    console.log("DATA MASUK KE BACKEND:", data);

    await chain.ensureGenesis();

    const productId =
      "PRD-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const block = await chain.mine({
      productId,
      catatan: {
        type: "petani",
        namaProduk: data.namaProduk,
        tanggalPanen: data.tanggalPanen,
        lokasi: data.lokasi,
        namaPetani: data.namaPetani,
        catatan: data.catatan,
      },
    });

    return {
      success: true,
      productId,
      blockNumber: block.nomorBlok,
      txHash: block.transactionHash,
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