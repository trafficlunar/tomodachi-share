"use client";

import { redirect } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

import qrcode from "qrcode-generator";

import { nameSchema, tagsSchema } from "@/lib/schemas";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import TomodachiLifeMii from "@/lib/tomodachi-life-mii";

import TagSelector from "./submit/tag-selector";
import ImageList from "./submit/image-list";
import QrUpload from "./submit/qr-upload";
import QrScanner from "./submit/qr-scanner";

export default function SubmitForm() {
	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleDrop = useCallback((acceptedFiles: FileWithPath[]) => {
		setFiles((prev) => [...prev, ...acceptedFiles]);
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: handleDrop,
		maxFiles: 3,
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
		const formData = new FormData();
		formData.append("name", name);
		formData.append("tags", JSON.stringify(tags));
		formData.append("qrBytesRaw", JSON.stringify(qrBytesRaw));
		files.forEach((file, index) => {
			// image1, image2, etc.
			formData.append(`image${index + 1}`, file);
		});

		const response = await fetch("/api/submit", {
			method: "POST",
			body: formData,
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

		const preview = async () => {
			setError("");

			// Validate QR code size
			if (qrBytesRaw.length !== 372) {
				setError("QR code size is not a valid Tomodachi Life QR code");
				return;
			}

			// Convert QR code to JS
			let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii };
			try {
				conversion = convertQrCode(qrBytes);
			} catch (error) {
				setError(error as string);
				return;
			}

			try {
				setStudioUrl(conversion.mii.studioUrl({ width: 128 }));

				// Generate a new QR code for aesthetic reasons
				const byteString = String.fromCharCode(...qrBytes);
				const generatedCode = qrcode(0, "L");
				generatedCode.addData(byteString, "Byte");
				generatedCode.make();

				setGeneratedQrCodeUrl(generatedCode.createDataURL());
			} catch (error) {
				setError("Failed to get and/or generate Mii images");
			}
		};

		preview();
	}, [qrBytesRaw]);

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 max-md:grid-cols-1">
			<div className="p-4 flex flex-col gap-2 max-md:order-2">
				<div className="flex justify-center gap-2">
					<div className="relative flex justify-center items-center size-32 aspect-square bg-orange-100 rounded-xl border-2 border-amber-500">
						{!studioUrl && <span className="absolute text-center font-light">Mii</span>}
						<img src={studioUrl} alt="Nintendo Studio URL" className="size-full rounded-xl text-[0px]" />
					</div>
					<div className="relative flex justify-center items-center size-32 aspect-square bg-orange-100 rounded-xl border-2 border-amber-500">
						{!generatedQrCodeUrl && <span className="absolute text-center font-light">QR Code</span>}
						<img src={generatedQrCodeUrl} alt="Generated QR Code" className="size-full rounded-xl text-[0px]" />
					</div>
				</div>

				<div className="p-2 border-2 bg-orange-200 border-amber-500 rounded-2xl shadow-lg h-48">
					<div
						{...getRootProps({
							className:
								"bg-orange-200 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-2 border-dashed border-amber-500 select-none h-full",
						})}
					>
						<input {...getInputProps()} />
						<Icon icon="material-symbols:upload" fontSize={64} />
						<p className="text-center">
							Drag and drop your images here
							<br />
							or click to open
						</p>
					</div>
				</div>

				<ImageList files={files} setFiles={setFiles} />
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

					<button type="button" onClick={() => setIsQrScannerOpen(true)} className="pill button gap-2">
						<Icon icon="mdi:camera" fontSize={20} />
						Use your camera
					</button>

					<QrScanner isOpen={isQrScannerOpen} setIsOpen={setIsQrScannerOpen} setQrBytesRaw={setQrBytesRaw} />
				</fieldset>
			</div>

			<div className="flex flex-col justify-center items-center gap-2 px-4 min-md:col-span-2 max-md:order-3">
				<button type="submit" className="pill button w-min">
					Submit
				</button>

				{error && <span className="text-red-400 font-bold">Error: {error}</span>}
			</div>
		</form>
	);
}
