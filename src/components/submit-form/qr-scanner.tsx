"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { Icon } from "@iconify/react";

import QrFinder from "./qr-finder";
import { useSelect } from "downshift";

interface Props {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setQrBytesRaw: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function QrScanner({ isOpen, setIsOpen, setQrBytesRaw }: Props) {
	const [isVisible, setIsVisible] = useState(false);

	const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

	const webcamRef = useRef<Webcam>(null);
	const requestRef = useRef<number>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const cameraItems = devices.map((device) => ({
		value: device.deviceId,
		label: device.label || `Camera ${device.deviceId.slice(-5)}`,
	}));

	const {
		isOpen: isDropdownOpen,
		getToggleButtonProps,
		getMenuProps,
		getItemProps,
		highlightedIndex,
		selectedItem,
	} = useSelect({
		items: cameraItems,
		selectedItem: cameraItems.find((item) => item.value === selectedDeviceId) ?? null,
		onSelectedItemChange: ({ selectedItem }) => {
			setSelectedDeviceId(selectedItem?.value ?? null);
		},
	});

	const scanQRCode = useCallback(() => {
		if (!isOpen) return;

		// Continue scanning in a loop
		requestRef.current = requestAnimationFrame(scanQRCode);

		const webcam = webcamRef.current;
		const canvas = canvasRef.current;
		if (!webcam || !canvas) return;

		const video = webcam.video;
		if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

		const imageData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
		const code = jsQR(imageData.data, imageData.width, imageData.height);
		if (!code) return;

		// Cancel animation frame to stop scanning
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
		}

		setQrBytesRaw(code.binaryData!);
		setIsOpen(false);
	}, [isOpen, setIsOpen, setQrBytesRaw]);

	const requestPermission = async () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then(() => setPermissionGranted(true))
			.catch(() => setPermissionGranted(false));
	};

	const close = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
		}, 300);
	};

	useEffect(() => {
		if (isOpen) {
			// slight delay to trigger animation
			setTimeout(() => setIsVisible(true), 10);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		requestPermission();

		navigator.mediaDevices.enumerateDevices().then((devices) => {
			const videoDevices = devices.filter((d) => d.kind === "videoinput");
			setDevices(videoDevices);
			if (!selectedDeviceId && videoDevices.length > 0) {
				setSelectedDeviceId(videoDevices[0].deviceId);
			}
		});
	}, [isOpen, selectedDeviceId]);

	useEffect(() => {
		if (!isOpen && !permissionGranted) return;
		requestRef.current = requestAnimationFrame(scanQRCode);
	}, [isOpen, permissionGranted, scanQRCode]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 h-[calc(100%-var(--header-height))] top-[var(--header-height)] flex items-center justify-center z-40">
			<div
				onClick={close}
				className={`z-40 absolute inset-0 backdrop-brightness-75 backdrop-blur-xs transition-opacity duration-300 ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
			/>

			<div
				className={`z-50 bg-orange-50 border-2 border-amber-500 rounded-2xl shadow-lg p-6 w-full max-w-md transition-discrete duration-300 ${
					isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
				}`}
			>
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-bold">Scan QR Code</h2>
					<button onClick={close} className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
						<Icon icon="material-symbols:close-rounded" />
					</button>
				</div>

				{devices.length > 1 && (
					<div className="mb-4 flex flex-col gap-1">
						<label className="text-sm font-semibold">Camera:</label>
						<div className="relative w-full">
							{/* Toggle button to open the dropdown */}
							<button
								type="button"
								{...getToggleButtonProps({}, { suppressRefError: true })}
								className="pill input w-full !px-2 !py-0.5 !justify-between text-sm"
							>
								{selectedItem?.label || "Select a camera"}

								<Icon icon="tabler:chevron-down" className="ml-2 size-5" />
							</button>

							{/* Dropdown menu */}
							<ul
								{...getMenuProps({}, { suppressRefError: true })}
								className={`absolute z-50 w-full bg-orange-200 border-2 border-orange-400 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto ${
									isDropdownOpen ? "block" : "hidden"
								}`}
							>
								{isDropdownOpen &&
									cameraItems.map((item, index) => (
										<li
											key={item.value}
											{...getItemProps({ item, index })}
											className={`px-4 py-1 cursor-pointer text-sm ${highlightedIndex === index ? "bg-black/15" : ""}`}
										>
											{item.label}
										</li>
									))}
							</ul>
						</div>
					</div>
				)}

				<div className="relative w-full aspect-square">
					{!permissionGranted ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-500 text-center p-8">
							<p className="text-red-400 font-bold text-lg mb-2">Camera access denied</p>
							<p className="text-gray-600">Please allow camera access in your browser settings to scan QR codes</p>
							<button type="button" onClick={requestPermission} className="pill button text-xs mt-2 !py-0.5 !px-2">
								Request Permission
							</button>
						</div>
					) : (
						<>
							<Webcam
								ref={webcamRef}
								audio={false}
								videoConstraints={{
									deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
								}}
								className="size-full object-cover rounded-2xl border-2 border-amber-500"
							/>
							<QrFinder />
							<canvas ref={canvasRef} className="hidden" />
						</>
					)}
				</div>

				<div className="mt-4 flex justify-center">
					<button type="button" onClick={close} className="pill button">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
