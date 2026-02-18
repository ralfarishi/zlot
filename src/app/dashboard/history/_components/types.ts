export interface HistoryTransaction {
	id: string;
	transactionNumber: string | null;
	entryTime: Date;
	exitTime: Date | null;
	status: string;
	totalCost: string | null;
	durationHours: string | null;
	vehicle: {
		plateNumber: string;
		vehicleType: string;
	};
	area: {
		areaName: string;
	};
	rate: {
		hourlyRate: string;
	};
	staffName: string | null;
	paymentMethod: string | null;
	cashReceived: string | null;
	cashChange: string | null;
}
