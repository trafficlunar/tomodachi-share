"use client";

import { redirect } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Icon } from "@iconify/react";

import qrcode from "qrcode-generator";

import { nameSchema, tagsSchema } from "@/lib/schemas";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { TomodachiLifeMii } from "@/lib/tomodachi-life-mii";

import TagSelector from "../tag-selector";
import ImageList from "./image-list";
import QrUpload from "./qr-upload";
import QrScanner from "./qr-scanner";
import SubmitTutorialButton from "../tutorial/submit";
import LikeButton from "../like-button";
import Carousel from "../carousel";
import SubmitButton from "../submit-button";
import Dropzone from "../dropzone";

export default function SubmitForm() {
	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			if (files.length >= 3) return;
			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[files.length],
	);

	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
	const [studioUrl, setStudioUrl] = useState<string | undefined>();
	const [generatedQrCodeUrl, setGeneratedQrCodeUrl] = useState<string | undefined>();

	const [error, setError] = useState<string | undefined>(undefined);

	const [name, setName] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [qrBytesRaw, setQrBytesRaw] = useState<number[]>([]);

	const handleSubmit = async () => {
		// Validate before sending request
		const nameValidation = nameSchema.safeParse(name);
		if (!nameValidation.success) {
			setError(nameValidation.error.issues[0].message);
			return;
		}
		const tagsValidation = tagsSchema.safeParse(tags);
		if (!tagsValidation.success) {
			setError(tagsValidation.error.issues[0].message);
			return;
		}

		// Send request to server
		const formData = new FormData();
		formData.append("name", name);
		formData.append("tags", JSON.stringify(tags));
		formData.append("description", description);
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
			setError(String(error)); // app can crash if error message is not a string
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
				setError(error instanceof Error ? error.message : String(error));
				return;
			}

			try {
				setStudioUrl(conversion.mii.studioUrl({ width: 512 }));

				// Generate a new QR code for aesthetic reasons
				const byteString = String.fromCharCode(...qrBytes);
				const generatedCode = qrcode(0, "L");
				generatedCode.addData(byteString, "Byte");
				generatedCode.make();

				setGeneratedQrCodeUrl(generatedCode.createDataURL());
			} catch {
				setError("Failed to get and/or generate Mii images");
			}
		};

		preview();
	}, [qrBytesRaw]);

	return (
		<form className="flex justify-center gap-4 w-full max-lg:flex-col max-lg:items-center">
			<div className="flex justify-center">
				<div className="w-75 h-min flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
					<Carousel images={[studioUrl ?? "/loading.svg", generatedQrCodeUrl ?? "/loading.svg", ...files.map((file) => URL.createObjectURL(file))]} />

					<div className="p-4 flex flex-col gap-1 h-full">
						<h1 className="font-bold text-2xl line-clamp-1" title={name}>
							{name || "Mii name"}
						</h1>
						<div id="tags" className="flex flex-wrap gap-1">
							{tags.length == 0 && <span className="px-2 py-1 bg-orange-300 rounded-full text-xs">tag</span>}
							{tags.map((tag) => (
								<span key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
									{tag}
								</span>
							))}
						</div>

						<div className="mt-auto">
							<LikeButton likes={0} isLiked={false} disabled />
						</div>
					</div>
				</div>
			</div>

			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-2 max-w-2xl w-full">
				<div>
					<h2 className="text-2xl font-bold">Submit your Mii</h2>
					<p className="text-sm text-zinc-500">Share your creation for others to see.</p>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
					<hr className="grow border-zinc-300" />
					<span>Info</span>
					<hr className="grow border-zinc-300" />
				</div>

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
					<TagSelector tags={tags} setTags={setTags} showTagLimit />
				</div>

				<div className="w-full grid grid-cols-3 items-start">
					<label htmlFor="reason-note" className="font-semibold py-2">
						Description
					</label>
					<textarea
						rows={5}
						maxLength={256}
						placeholder="(optional) Type a description..."
						className="pill input rounded-xl! resize-none col-span-2 text-sm"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
					<hr className="grow border-zinc-300" />
					<span>QR Code</span>
					<hr className="grow border-zinc-300" />
				</div>

				<div className="flex flex-col items-center gap-2">
					<QrUpload setQrBytesRaw={setQrBytesRaw} />
					<span>or</span>

					<button type="button" aria-label="Use your camera" onClick={() => setIsQrScannerOpen(true)} className="pill button gap-2">
						<Icon icon="mdi:camera" fontSize={20} />
						Use your camera
					</button>

					<QrScanner isOpen={isQrScannerOpen} setIsOpen={setIsQrScannerOpen} setQrBytesRaw={setQrBytesRaw} />
					<SubmitTutorialButton />

					<span className="text-xs text-zinc-400">For emulators, aes_keys.txt is required.</span>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-6 mb-2">
					<hr className="grow border-zinc-300" />
					<span>Custom images</span>
					<hr className="grow border-zinc-300" />
				</div>

				<div className="max-w-md w-full self-center flex flex-col items-center">
					<Dropzone onDrop={handleDrop}>
						<p className="text-center text-sm">
							Drag and drop your images here
							<br />
							or click to open
						</p>
					</Dropzone>

					<span className="text-xs text-zinc-400 mt-2">Animated images currently not supported.</span>
				</div>

				<ImageList files={files} setFiles={setFiles} />

				<hr className="border-zinc-300 my-2" />
				<div className="flex justify-between items-center">
					{error && <span className="text-red-400 font-bold">Error: {error}</span>}

					<SubmitButton onClick={handleSubmit} className="ml-auto" />
				</div>
			</div>
		</form>
	);
}
