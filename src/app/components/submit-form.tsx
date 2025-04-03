"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

import TagSelector from "./submit/tag-selector";
import QrUpload from "./submit/qr-upload";
import QrScanner from "./submit/qr-scanner";

import { AES_CCM } from "@trafficlunar/asmcrypto.js";

const key = new Uint8Array([0x59, 0xfc, 0x81, 0x7e, 0x64, 0x46, 0xea, 0x61, 0x90, 0x34, 0x7b, 0x20, 0xe9, 0xbd, 0xce, 0x52]);

export default function SubmitForm() {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
		},
	});

	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
	const [qrBytes, setQrBytes] = useState<Uint8Array>(new Uint8Array());

	useEffect(() => {
		if (qrBytes.length == 0) return;

		const decrypt = async () => {
			const nonce = qrBytes.subarray(0, 8);
			const content = qrBytes.subarray(8, 0x70);

			const nonceWithZeros = new Uint8Array(12);
			nonceWithZeros.set(nonce, 0);

			const decrypted = AES_CCM.decrypt(content, key, nonceWithZeros, undefined, 16);
			const result = new Uint8Array([...decrypted.subarray(0, 12), ...qrBytes.subarray(0, 8), ...decrypted.subarray(12, decrypted.length - 4)]);

			console.log(result);
		};

		decrypt();
	}, [qrBytes]);

	return (
		<form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2">
			<div className="p-4">
				<div className="p-2 border-2 bg-orange-100 border-amber-500 rounded-2xl shadow-lg h-48">
					<div
						{...getRootProps({
							className:
								"bg-orange-100 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-2 border-dashed border-amber-500 select-none h-full",
						})}
					>
						<input {...getInputProps({ multiple: false })} />
						<Icon icon="material-symbols:upload" fontSize={64} />
						<p className="text-center">
							Drag and drop your images here
							<br />
							or click to open
						</p>
					</div>
				</div>

				{/* todo: show file list here */}
			</div>

			<div className="p-4 flex flex-col gap-2">
				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="name" className="font-semibold">
						Name
					</label>
					<input
						name="name"
						type="text"
						className="pill input w-full col-span-2"
						minLength={2}
						maxLength={64}
						placeholder="Type your mii's name here..."
					/>
				</div>

				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="tags" className="font-semibold">
						Tags
					</label>
					<TagSelector />
				</div>

				<fieldset className="border-t-2 border-b-2 border-black p-3 flex flex-col items-center gap-2">
					<legend className="px-2">QR Code</legend>

					<QrUpload setQrBytes={setQrBytes} />

					<span>or</span>

					<button onClick={() => setIsQrScannerOpen(true)} className="pill button gap-2">
						<Icon icon="mdi:camera" fontSize={20} />
						Use your camera
					</button>

					<QrScanner isOpen={isQrScannerOpen} setIsOpen={setIsQrScannerOpen} setQrBytes={setQrBytes} />
				</fieldset>

				<button type="submit" className="pill button w-min ml-auto">
					Submit
				</button>
			</div>
		</form>
	);
}
