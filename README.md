# 🌾 BlockFarm

BlockFarm adalah aplikasi simulasi pencatatan hasil pertanian berbasis Blockchain menggunakan Smart Contract Ethereum. Aplikasi ini memungkinkan petani mencatat data hasil panen, distributor dan pedagang menambahkan riwayat distribusi, serta konsumen memverifikasi keaslian data melalui blockchain.

## Teknologi yang Digunakan

- React + Vite
- TypeScript
- Hardhat
- Solidity
- Ethers.js
- Docker
- TanStack React Router

---

# Cara Menjalankan Project

## 1. Clone Repository

```bash
git clone https://github.com/andimufidahidris03-commits/blockfarm.git
cd blockfarm
```

---

## 2. Install Dependency

```bash
npm install
```

---

## 3. Jalankan Hardhat Local Blockchain

Buka terminal pertama.

```bash
npx hardhat node
```

Biarkan terminal ini tetap berjalan.

---

## 4. Deploy Smart Contract

Buka terminal kedua.

```bash
npx hardhat ignition deploy ./ignition/modules/BlockFarm.ts --network localhost
```

Jika berhasil akan muncul alamat contract seperti berikut.

```
BlockFarmModule#BlockFarm - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 5. Jalankan Aplikasi

Buka terminal ketiga.

```bash
docker compose up --build
```

atau tanpa Docker

```bash
npm run dev
```

---

## 6. Buka Aplikasi

```
http://localhost:8080
```

---

# Fitur

- Registrasi produk hasil pertanian
- Penyimpanan riwayat produk berbasis Blockchain
- Smart Contract Ethereum
- QR Code Produk
- Upload Foto Produk
- Verifikasi Integritas Blockchain
- Simulasi Tampering Data
- Riwayat Distribusi Produk

---

# Struktur Project

```
contracts/
ignition/
src/
Dockerfile
docker-compose.yml
package.json
```

---

# Catatan

Project ini menggunakan Hardhat Local Network sehingga **Hardhat Node harus dijalankan terlebih dahulu** sebelum aplikasi digunakan.

```
Terminal 1
npx hardhat node

Terminal 2
npx hardhat ignition deploy ./ignition/modules/BlockFarm.ts --network localhost

Terminal 3
docker compose up --build
```

Setelah ketiga proses tersebut berjalan, aplikasi dapat diakses melalui:

```
http://localhost:8080
```
