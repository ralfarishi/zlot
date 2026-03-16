export interface HistoryTransaction {
	id: string;
	nomorTransaksi: string | null;
	waktuMasuk: Date;
	waktuKeluar: Date | null;
	status: string;
	totalBiaya: string | null;
	durasiJam: string | null;
	kendaraan: {
		platNomor: string;
		jenisKendaraan: string;
	};
	area: {
		namaArea: string;
	};
	tarif: {
		tarifPerJam: string;
	};
	namaPetugas: string | null;
	metodePembayaran: string | null;
	tunaiDiterima: string | null;
	kembalian: string | null;
}
