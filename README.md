# BlockFarm

BlockFarm adalah aplikasi web berbasis blockchain untuk melakukan pelacakan (traceability) produk pertanian dari petani hingga pedagang.

## Fitur
- Registrasi produk pertanian
- Riwayat distribusi produk
- QR Code untuk pelacakan
- Verifikasi integritas blockchain
- Smart Contract menggunakan Hardhat
- Docker support

## Teknologi
- React + Vite
- TypeScript
- Hardhat
- Solidity
- Docker
- Docker Compose

## Menjalankan Proyek

### Menggunakan Docker

```bash
git clone https://github.com/andimufidahidris03-commits/blockfarm.git
cd blockfarm
docker compose up --build
```

Aplikasi akan berjalan di:

http://localhost:8080

### Tanpa Docker

```bash
npm install
npm run dev
```

## Struktur Proyek

```
contracts/     Smart Contract Solidity
src/           Source code React
scripts/       Deployment Script
test/          Smart Contract Test
```
