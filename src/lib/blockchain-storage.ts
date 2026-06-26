import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "blockchain.json");

export function loadBlockchain() {
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      blocks: [],
      contractAddress: "",
    };
  }
}

export function saveBlockchain(data: unknown) {
  console.log("MENULIS FILE:", FILE_PATH);

  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  console.log("FILE BERHASIL DITULIS");
}