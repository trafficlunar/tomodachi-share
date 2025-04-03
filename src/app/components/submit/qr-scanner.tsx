"use client";

import { useEffect, useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Icon } from "@iconify/react";

import QrFinder from "../qr-finder";

interface Props {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setQrBytes: React.Dispatch<React.SetStateAction<Uint8Array>>;
}

export default function QrScanner({ isOpen, setIsOpen, setQrBytes }: Props) {
	const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then(() => setPermissionGranted(true))
			.catch(() => setPermissionGranted(false));
	}, [isOpen]);

	const handleScan = (result: IDetectedBarcode[]) => {
		// todo: fix scan, use jsQR instead, data is wrong
		setIsOpen(false);

		// Convert to bytes
		const encoder = new TextEncoder();
		const byteArray = encoder.encode(result[0].rawValue);

		setQrBytes(byteArray);
	};

	if (isOpen)
		return (
			<div className="fixed inset-0 flex items-center justify-center z-40 backdrop-brightness-75 backdrop-blur-xs">
				<div className="bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg p-6 w-full max-w-md">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">Scan QR Code</h2>
						<button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
							<Icon icon="material-symbols:close-rounded" />
						</button>
					</div>

					<div className="relative w-full aspect-square">
						{permissionGranted === null ? (
							<div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-amber-500">
								<div className="text-center p-4">
									<p className="text-red-400 font-bold text-lg mb-2">Camera access denied</p>
									<p className="text-gray-600">Please allow camera access in your browser settings to scan QR codes</p>
								</div>
							</div>
						) : (
							<>
								<Scanner
									formats={["qr_code"]}
									onScan={handleScan}
									components={{ finder: false }}
									sound={false}
									classNames={{ container: "rounded-lg border-2 border-amber-500" }}
								/>

								<QrFinder />
							</>
						)}
					</div>

					<div className="mt-4 flex justify-center">
						<button onClick={() => setIsOpen(false)} className="pill button">
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	else return null;
}
