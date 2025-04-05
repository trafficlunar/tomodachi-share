"use client";

import { redirect } from "next/navigation";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

import { AES_CCM } from "@trafficlunar/asmcrypto.js";
import qrcode from "qrcode-generator";

import { MII_DECRYPTION_KEY } from "@/lib/constants";
import { nameSchema, tagsSchema } from "@/lib/schemas";

import Mii from "@/utils/mii.js/mii";
import TomodachiLifeMii from "@/utils/tomodachi-life-mii";

import TagSelector from "./submit/tag-selector";
import QrUpload from "./submit/qr-upload";
import QrScanner from "./submit/qr-scanner";

export default function SubmitForm() {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp"],
		},
	});

	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
	const [studioUrl, setStudioUrl] = useState<string | undefined>();
	const [generatedQrCodeUrl, setGeneratedQrCodeUrl] = useState<string | undefined>();

	const [error, setError] = useState<string | undefined>(undefined);

	const [name, setName] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [qrBytesRaw, setQrBytesRaw] = useState<number[]>([]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		// Validate before sending request
		const nameValidation = nameSchema.safeParse(name);
		if (!nameValidation.success) {
			setError(nameValidation.error.errors[0].message);
			return;
		}
		const tagsValidation = tagsSchema.safeParse(tags);
		if (!tagsValidation.success) {
			setError(tagsValidation.error.errors[0].message);
			return;
		}

		// Send request to server
		const response = await fetch("/api/submit", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, tags, qrBytesRaw }),
		});
		const { id, error } = await response.json();

		if (!response.ok) {
			setError(error);
			return;
		}

		redirect(`/mii/${id}`);
	};

	useEffect(() => {
		if (qrBytesRaw.length == 0) return;
		const qrBytes = new Uint8Array(qrBytesRaw);

		const decode = async () => {
			setError("");

			// Validate QR code size
			if (qrBytesRaw.length !== 372) {
				setError("QR code size is not a valid Tomodachi Life QR code");
				return;
			}

			// Decrypt the Mii part of the QR code
			// (Credits to kazuki-4ys)
			const nonce = qrBytes.subarray(0, 8);
			const content = qrBytes.subarray(8, 0x70);

			const nonceWithZeros = new Uint8Array(12);
			nonceWithZeros.set(nonce, 0);

			let decrypted: Uint8Array<ArrayBufferLike> = new Uint8Array();
			try {
				decrypted = AES_CCM.decrypt(content, MII_DECRYPTION_KEY, nonceWithZeros, undefined, 16);
			} catch (error) {
				console.warn("Failed to decrypt QR code:", error);
				setError("Failed to decrypt QR code. It may be invalid or corrupted.");
				return;
			}

			const result = new Uint8Array(96);
			result.set(decrypted.subarray(0, 12), 0);
			result.set(nonce, 12);
			result.set(decrypted.subarray(12), 20);

			// Check if QR code is valid (after decryption)
			if (result.length !== 0x60 || (result[0x16] !== 0 && result[0x17] !== 0)) {
				setError("QR code is not a valid Mii QR code");
				return;
			}

			// Convert to Mii classes
			const buffer = Buffer.from(result);
			const mii = new Mii(buffer);
			const tomodachiLifeMii = TomodachiLifeMii.fromBytes(qrBytes);

			if (tomodachiLifeMii.hairDyeEnabled) {
				mii.hairColor = tomodachiLifeMii.studioHairColor;
				mii.eyebrowColor = tomodachiLifeMii.studioHairColor;
				mii.facialHairColor = tomodachiLifeMii.studioHairColor;
			}

			try {
				setStudioUrl(mii.studioUrl({ width: 128 }));

				// Generate a new QR code for aesthetic reasons
				const byteString = String.fromCharCode(...qrBytes);
				const generatedCode = qrcode(0, "L");
				generatedCode.addData(byteString, "Byte");
				generatedCode.make();

				setGeneratedQrCodeUrl(generatedCode.createDataURL());
			} catch (error) {
				console.warn("Failed to get and/or generate Mii images:", error);
				setError("Failed to get and/or generate Mii images");
			}
		};

		decode();
	}, [qrBytesRaw]);

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2">
			<div className="p-4 flex flex-col gap-2">
				<div className="flex justify-center gap-2">
					<img
						src={studioUrl}
						alt="Nintendo Studio URL"
						className="aspect-square size-32 bg-orange-100 rounded-xl border-2 border-amber-500 text-[0px]"
					/>
					<img
						src={generatedQrCodeUrl}
						alt="Generated QR Code"
						className="aspect-square size-32 bg-orange-100 rounded-xl border-2 border-amber-500 text-[0px]"
					/>
				</div>

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
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>

				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="tags" className="font-semibold">
						Tags
					</label>
					<TagSelector tags={tags} setTags={setTags} />
				</div>

				<fieldset className="border-t-2 border-b-2 border-black p-3 flex flex-col items-center gap-2">
					<legend className="px-2">QR Code</legend>

					<QrUpload setQrBytesRaw={setQrBytesRaw} />

					<span>or</span>

					<button onClick={() => setIsQrScannerOpen(true)} className="pill button gap-2">
						<Icon icon="mdi:camera" fontSize={20} />
						Use your camera
					</button>

					<QrScanner isOpen={isQrScannerOpen} setIsOpen={setIsQrScannerOpen} setQrBytesRaw={setQrBytesRaw} />
				</fieldset>

				<div className="flex justify-between items-center">
					{error && <span className="text-red-400 font-semibold">Error: {error}</span>}

					<button type="submit" className="pill button w-min ml-auto mb-auto">
						Submit
					</button>
				</div>
			</div>
		</form>
	);
}
