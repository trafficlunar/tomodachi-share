"use client";

import { redirect } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Icon } from "@iconify/react";

import qrcode from "qrcode-generator";
import { MiiGender, MiiPlatform } from "@prisma/client";

import { nameSchema, tagsSchema } from "@/lib/schemas";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { TomodachiLifeMii } from "@/lib/tomodachi-life-mii";

import TagSelector from "../tag-selector";
import ImageList from "./image-list";
import PortraitUpload from "./portrait-upload";
import QrUpload from "./qr-upload";
import QrScanner from "./qr-scanner";
import SwitchSubmitTutorialButton from "../tutorial/switch-submit";
import ThreeDsSubmitTutorialButton from "../tutorial/3ds-submit";
import LikeButton from "../like-button";
import Carousel from "../carousel";
import SubmitButton from "../submit-button";
import Dropzone from "../dropzone";

export default function SubmitForm() {
	const [platform, setPlatform] = useState<MiiPlatform>("SWITCH");
	const [name, setName] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [gender, setGender] = useState<MiiGender>("MALE");
	const [qrBytesRaw, setQrBytesRaw] = useState<number[]>([]);

	const [miiPortraitUri, setMiiPortraitUri] = useState<string | undefined>();
	const [generatedQrCodeUri, setGeneratedQrCodeUri] = useState<string | undefined>();

	const [error, setError] = useState<string | undefined>(undefined);
	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			if (files.length >= 3) return;
			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[files.length]
	);

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
		formData.append("platform", platform);
		formData.append("name", name);
		formData.append("tags", JSON.stringify(tags));
		formData.append("description", description);
		formData.append("qrBytesRaw", JSON.stringify(qrBytesRaw));
		files.forEach((file, index) => {
			// image1, image2, etc.
			formData.append(`image${index + 1}`, file);
		});

		if (platform === "SWITCH") {
			const response = await fetch(miiPortraitUri!);
			const blob = await response.blob();

			formData.append("gender", gender);
			formData.append("miiPortraitImage", blob);
		}

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

			// Convert QR code to JS (3DS)
			if (platform === "THREE_DS") {
				let conversion: { mii: Mii; tomodachiLifeMii: TomodachiLifeMii };
				try {
					conversion = convertQrCode(qrBytes);
					setMiiPortraitUri(conversion.mii.studioUrl({ width: 512 }));
				} catch (error) {
					setError(error instanceof Error ? error.message : String(error));
					return;
				}
			}

			// Generate a new QR code for aesthetic reasons
			try {
				const byteString = String.fromCharCode(...qrBytes);
				const generatedCode = qrcode(0, "L");
				generatedCode.addData(byteString, "Byte");
				generatedCode.make();

				setGeneratedQrCodeUri(generatedCode.createDataURL());
			} catch {
				setError("Failed to regenerate QR code");
			}
		};

		preview();
	}, [qrBytesRaw, platform]);

	return (
		<form className="flex justify-center gap-4 w-full max-lg:flex-col max-lg:items-center">
			<div className="flex justify-center">
				<div className="w-[18.75rem] h-min flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
					<Carousel
						images={[miiPortraitUri ?? "/loading.svg", generatedQrCodeUri ?? "/loading.svg", ...files.map((file) => URL.createObjectURL(file))]}
					/>

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
					<hr className="flex-grow border-zinc-300" />
					<span>Info</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				{/* Platform select */}
				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="name" className="font-semibold">
						Platform
					</label>
					<div className="relative col-span-2 grid grid-cols-2 bg-orange-300 border-2 border-orange-400 rounded-4xl shadow-md inset-shadow-sm/10">
						{/* Animated indicator */}
						<div
							className={`absolute inset-0 w-1/2 bg-orange-200 rounded-4xl transition-transform duration-300 ${
								platform === "SWITCH" ? "translate-x-0" : "translate-x-full"
							}`}
						></div>

						{/* Switch button */}
						<button
							type="button"
							onClick={() => setPlatform("SWITCH")}
							className={`p-2 text-black/35 cursor-pointer flex justify-center items-center gap-2 z-10 transition-colors ${
								platform === "SWITCH" && "!text-black"
							}`}
						>
							<Icon icon="cib:nintendo-switch" className="text-2xl" />
							Switch
						</button>

						{/* 3DS button */}
						<button
							type="button"
							onClick={() => setPlatform("THREE_DS")}
							className={`p-2 text-black/35 cursor-pointer flex justify-center items-center gap-2 z-10 transition-colors ${
								platform === "THREE_DS" && "!text-black"
							}`}
						>
							<Icon icon="cib:nintendo-3ds" className="text-2xl" />
							3DS
						</button>
					</div>
				</div>

				{/* Name */}
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

				{/* Description */}
				<div className="w-full grid grid-cols-3 items-start">
					<label htmlFor="description" className="font-semibold py-2">
						Description
					</label>
					<textarea
						name="description"
						rows={3}
						maxLength={256}
						placeholder="(optional) Type a description..."
						className="pill input !rounded-xl resize-none col-span-2"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Gender (switch only) */}
				{platform === "SWITCH" && (
					<div className="w-full grid grid-cols-3 items-start">
						<label htmlFor="gender" className="font-semibold py-2">
							Gender
						</label>
						<div className="col-span-2 flex gap-1">
							<button
								type="button"
								onClick={() => setGender("MALE")}
								aria-label="Filter for Male Miis"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all ${
									gender === "MALE" ? "bg-blue-100 border-blue-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="foundation:male" className="text-blue-400" />
							</button>

							<button
								type="button"
								onClick={() => setGender("FEMALE")}
								aria-label="Filter for Female Miis"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all ${
									gender === "FEMALE" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="foundation:female" className="text-pink-400" />
							</button>
						</div>
					</div>
				)}

				{platform === "SWITCH" && (
					<>
						{/* Separator */}
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
							<hr className="flex-grow border-zinc-300" />
							<span>Mii Portrait</span>
							<hr className="flex-grow border-zinc-300" />
						</div>

						<div className="flex flex-col items-center gap-2">
							<PortraitUpload setImage={setMiiPortraitUri} />
						</div>
					</>
				)}

				{/* QR code selector */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
					<hr className="flex-grow border-zinc-300" />
					<span>QR Code</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				<div className="flex flex-col items-center gap-2">
					<QrUpload setQrBytesRaw={setQrBytesRaw} />
					<span>or</span>
					<QrScanner setQrBytesRaw={setQrBytesRaw} />

					{platform === "THREE_DS" ? (
						<>
							<ThreeDsSubmitTutorialButton />

							<span className="text-xs text-zinc-400">For emulators, aes_keys.txt is required.</span>
						</>
					) : (
						<SwitchSubmitTutorialButton />
					)}
				</div>

				{/* Custom images selector */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-6 mb-2">
					<hr className="flex-grow border-zinc-300" />
					<span>Custom images</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				<div className="max-w-md w-full self-center">
					<Dropzone onDrop={handleDrop}>
						<p className="text-center text-sm">
							Drag and drop your images here
							<br />
							or click to open
						</p>
					</Dropzone>
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
