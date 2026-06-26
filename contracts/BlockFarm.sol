// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BlockFarm {

    struct Produk {
        string productId;
        string namaProduk;
        string namaPetani;
        string lokasi;
        string tanggalPanen;
    }

    Produk[] public produkList;

    event ProdukDitambahkan(
        string productId,
        string namaProduk,
        string namaPetani
    );

    function tambahProduk(
        string memory _productId,
        string memory _namaProduk,
        string memory _namaPetani,
        string memory _lokasi,
        string memory _tanggalPanen
    ) public {

        produkList.push(
            Produk(
                _productId,
                _namaProduk,
                _namaPetani,
                _lokasi,
                _tanggalPanen
            )
        );

        emit ProdukDitambahkan(
            _productId,
            _namaProduk,
            _namaPetani
        );
    }

    function jumlahProduk()
        public
        view
        returns (uint)
    {
        return produkList.length;
    }
}