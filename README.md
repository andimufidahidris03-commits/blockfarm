# Menjalankan Aplikasi

## 1. Clone repository

git clone https://github.com/andimufidahidris03-commits/blockfarm.git

cd blockfarm

## 2. Install dependency

npm install

## 3. Jalankan Hardhat Node

npx hardhat node

## 4. Deploy Smart Contract

npx hardhat ignition deploy ./ignition/modules/BlockFarm.ts --network localhost

## 5. Jalankan aplikasi

docker compose up --build

Aplikasi dapat diakses pada:

http://localhost:8080
