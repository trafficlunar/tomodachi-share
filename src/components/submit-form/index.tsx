"use client";

import { redirect } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Icon } from "@iconify/react";

import qrcode from "qrcode-generator";
import { MiiGender, MiiMakeup, MiiPlatform } from "@prisma/client";

import { nameSchema, tagsSchema } from "@/lib/schemas";
import { convertQrCode } from "@/lib/qr-codes";
import Mii from "@/lib/mii.js/mii";
import { ThreeDsTomodachiLifeMii } from "@/lib/three-ds-tomodachi-life-mii";
import { defaultInstructions } from "@/lib/switch";
import { SwitchMiiInstructions } from "@/types";

import TagSelector from "../tag-selector";
import ImageList from "./image-list";
import SwitchFileUpload from "./switch-file-upload";
import QrUpload from "./qr-upload";
import Camera from "./camera";
import ThreeDsSubmitTutorialButton from "../tutorial/3ds-submit";
import MiiEditor from "./mii-editor";
import SwitchSubmitTutorialButton from "../tutorial/switch-submit";
import LikeButton from "../like-button";
import Carousel from "../carousel";
import SubmitButton from "../submit-button";
import Dropzone from "../dropzone";
import Image from "next/image";
import { CharInfoEx } from "charinfo-ex";

interface Props {
	inQueueMiisCount: number;
}

export default function SubmitForm({ inQueueMiisCount }: Props) {
	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			if (files.length >= 3) return;
			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[files.length],
	);

	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
	const [miiPortraitUri, setMiiPortraitUri] = useState<string | undefined>();
	const [miiFeaturesUri, setMiiFeaturesUri] = useState<string | undefined>();
	const [generatedQrCodeUri, setGeneratedQrCodeUri] = useState<string | undefined>();

	const [name, setName] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [qrBytesRaw, setQrBytesRaw] = useState<number[]>([]);

	const [platform, setPlatform] = useState<MiiPlatform>("SWITCH");
	const [gender, setGender] = useState<MiiGender>("MALE");
	const [makeup, setMakeup] = useState<MiiMakeup>("PARTIAL");

	const [way, setWay] = useState<"savedata" | "manual" | null>(null);
	const [miiDataFile, setMiiDataFile] = useState<File | undefined>();

	const [youtubeId, setYouTubeId] = useState("");
	const instructions = useRef<SwitchMiiInstructions>(defaultInstructions);

	const [error, setError] = useState<string | undefined>(undefined);

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
		files.forEach((file, index) => {
			// image1, image2, etc.
			formData.append(`image${index + 1}`, file);
		});

		if (platform === "THREE_DS") {
			formData.append("qrBytesRaw", JSON.stringify(qrBytesRaw));
		} else if (platform === "SWITCH" && way) {
			const portraitResponse = await fetch(miiPortraitUri!);
			if (!portraitResponse.ok) {
				setError("Failed to get Mii portrait screenshot. Did you upload one?");
				return;
			}

			const portraitBlob = await portraitResponse.blob();
			if (!portraitBlob.type.startsWith("image/")) {
				setError("Invalid image file found");
				return;
			}

			formData.append("gender", gender);
			formData.append("makeup", makeup);
			formData.append("miiPortraitImage", portraitBlob);
			formData.append("way", way);
			if (way === "savedata") {
				if (!miiDataFile) {
					setError("Failed to find Mii data file, did you upload one?");
					return;
				}
				formData.append("miiDataFile", miiDataFile);
			} else {
				const featuresResponse = await fetch(miiFeaturesUri!);
				if (!featuresResponse.ok) {
					setError("Failed to get Mii features screenshot. Did you upload one?");
					return;
				}

				const featuresBlob = await featuresResponse.blob();
				if (!featuresBlob.type.startsWith("image/")) {
					setError("Invalid image file found");
					return;
				}

				formData.append("miiFeaturesImage", featuresBlob);
				formData.append("instructions", JSON.stringify(instructions.current));
			}

			formData.append("youtubeId", youtubeId);
		}

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
		if (platform !== "THREE_DS") return;
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
			let conversion: { mii: Mii; tomodachiLifeMii: ThreeDsTomodachiLifeMii };
			try {
				conversion = convertQrCode(qrBytes);
				setMiiPortraitUri(conversion.mii.studioUrl({ width: 512 }));
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
				return;
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
				<div className="w-75 h-min flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
					<Carousel
						images={[
							miiPortraitUri ?? "/loading.svg",
							...(platform === "THREE_DS" ? [generatedQrCodeUri ?? "/loading.svg"] : [miiFeaturesUri ?? "/loading.svg"]),
							...files.map((file) => URL.createObjectURL(file)),
						]}
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

			<div className="max-w-2xl w-full">
				{inQueueMiisCount !== 0 && (
					<div className="bg-zinc-50 border-2 border-zinc-400 rounded-2xl shadow-lg p-4 flex items-start gap-3 text-zinc-600 mb-4">
						<Icon icon="material-symbols:timer" className="text-2xl shrink-0" />
						<p className="font-medium">
							You have {inQueueMiisCount} Mii{inQueueMiisCount > 1 && "s"} pending manual review. You can view your queue on your profile.
						</p>
					</div>
				)}
				<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-2 w-full">
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

					{/* Platform select */}
					<div className="w-full grid grid-cols-3 items-center">
						<label htmlFor="name" className="font-semibold">
							Platform
						</label>
						<div className="relative col-span-2 grid grid-cols-2 bg-orange-300 border-2 border-orange-400 rounded-4xl shadow-md inset-shadow-sm/10">
							{/* Animated indicator */}
							{/* TODO: maybe change width as part of animation? */}
							<div
								className={`absolute inset-0 w-1/2 bg-orange-200 rounded-4xl transition-transform duration-300 ${
									platform === "SWITCH" ? "translate-x-0" : "translate-x-full"
								}`}
							></div>

							{/* Switch button */}
							<button
								type="button"
								onClick={() => setPlatform("SWITCH")}
								className={`p-2 text-slate-800/35 cursor-pointer flex justify-center items-center gap-2 z-10 transition-colors ${
									platform === "SWITCH" && "text-slate-800!"
								}`}
							>
								<Icon icon="cib:nintendo-switch" className="text-2xl" />
								Switch
							</button>

							{/* 3DS button */}
							<button
								type="button"
								onClick={() => setPlatform("THREE_DS")}
								className={`p-2 text-slate-800/35 cursor-pointer flex justify-center items-center gap-2 z-10 transition-colors ${
									platform === "THREE_DS" && "text-slate-800!"
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
							id="name"
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

					{/* Description */}
					<div className="w-full grid grid-cols-3 items-start">
						<label htmlFor="description" className="font-semibold py-2">
							Description
						</label>
						<textarea
							id="description"
							rows={5}
							maxLength={512}
							placeholder="(optional) Type a description..."
							className="pill input rounded-xl! resize-none col-span-2 text-sm"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					{/* Gender (switch only) */}
					<div className={`w-full grid grid-cols-3 items-start z-20 ${platform === "SWITCH" ? "" : "hidden"}`}>
						<label htmlFor="gender" className="font-semibold py-2">
							Gender
						</label>
						<div className="col-span-2 flex gap-1">
							<button
								type="button"
								onClick={() => setGender("MALE")}
								aria-label="Filter for Male Miis"
								data-tooltip="Male"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-blue-400! after:border-blue-400! before:border-b-blue-400!  ${
									gender === "MALE" ? "bg-blue-100 border-blue-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="foundation:male" className="text-blue-400" />
							</button>

							<button
								type="button"
								onClick={() => setGender("FEMALE")}
								aria-label="Filter for Female Miis"
								data-tooltip="Female"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-pink-400! after:border-pink-400! before:border-b-pink-400! ${
									gender === "FEMALE" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="foundation:female" className="text-pink-400" />
							</button>

							<button
								type="button"
								onClick={() => setGender("NONBINARY")}
								aria-label="Filter for Nonbinary Miis"
								data-tooltip="Nonbinary"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-purple-400! after:border-purple-400! before:border-b-purple-400!  ${
									gender === "NONBINARY" ? "bg-purple-100 border-purple-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="mdi:gender-non-binary" className="text-purple-400" />
							</button>
						</div>
					</div>

					{/* Makeup (switch only) */}
					<div className={`w-full grid grid-cols-3 items-start ${platform === "SWITCH" ? "" : "hidden"}`}>
						<label htmlFor="makeup" className="font-semibold py-2">
							Face Paint
						</label>

						<div className="col-span-2 flex gap-1">
							{/* Full Makeup */}
							<button
								type="button"
								onClick={() => setMakeup("FULL")}
								aria-label="Full Face Paint"
								data-tooltip="Face covered more than 80%"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-pink-400! after:border-pink-400! before:border-b-pink-400! ${
									makeup === "FULL" ? "bg-pink-100 border-pink-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="mdi:palette" className="text-pink-400" />
							</button>

							{/* Partial Makeup */}
							<button
								type="button"
								onClick={() => setMakeup("PARTIAL")}
								aria-label="Partial Face Paint"
								data-tooltip="For at least any face paint"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-purple-400! after:border-purple-400! before:border-b-purple-400! ${
									makeup === "PARTIAL" ? "bg-purple-100 border-purple-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="mdi:lipstick" className="text-purple-400" />
							</button>

							{/* No Makeup */}
							<button
								type="button"
								onClick={() => setMakeup("NONE")}
								aria-label="No Face Paint"
								data-tooltip="No Face Paint"
								className={`cursor-pointer rounded-xl flex justify-center items-center size-11 text-4xl border-2 transition-all after:bg-gray-400! after:border-gray-400! before:border-b-gray-400! ${
									makeup === "NONE" ? "bg-gray-200 border-gray-400 shadow-md" : "bg-white border-gray-300 hover:border-gray-400"
								}`}
							>
								<Icon icon="codex:cross" className="text-gray-400" />
							</button>
						</div>
					</div>

					{/* (Switch Only) Choose a way */}
					<div className={`${platform === "SWITCH" ? "" : "hidden"}`}>
						{/* Separator */}
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Choose a Way</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="grid grid-cols-2 gap-4 w-full">
							<button
								onClick={() => setWay("savedata")}
								// aria-label={tutorial.title + " tutorial"}
								type="button"
								className={`flex flex-col justify-center items-center rounded-xl p-4 shadow-md border-2 cursor-pointer text-center text-sm transition hover:scale-[1.03] ${way === "savedata" ? "bg-cyan-100 border-cyan-600" : "bg-zinc-50 border-zinc-300 hover:bg-cyan-100 hover:border-cyan-600"}`}
							>
								.ltd file
							</button>

							<button
								onClick={() => setWay("manual")}
								// aria-label={tutorial.title + " tutorial"}
								type="button"
								className={`flex flex-col justify-center items-center rounded-xl p-4 shadow-md border-2 cursor-pointer text-center text-sm transition hover:scale-[1.03] ${way === "manual" ? "bg-cyan-100 border-cyan-600" : "bg-zinc-50 border-zinc-300 hover:bg-cyan-100 hover:border-cyan-600"}`}
							>
								Manual
							</button>
						</div>

						<p className="text-xs text-zinc-400 text-center mt-2">Click on a way to see tutorials for them</p>
					</div>

					{/* (Switch Only) Mii Screenshots */}
					<div className={`${platform === "SWITCH" && way ? "" : "hidden"}`}>
						{/* Separator */}
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Mii Screenshots</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col items-center gap-2 w-full">
							{/* Step 1 - Portrait */}
							<div className="flex flex-col items-center gap-2 w-full mb-4">
								<div className="flex items-center gap-2 self-start">
									<span className="bg-orange-400 text-white text-xs font-bold rounded-full size-5 flex items-center justify-center shrink-0">1</span>
									<span className="text-sm font-semibold text-zinc-600">Portrait screenshot</span>
								</div>
								<div className="flex gap-3 w-full items-start max-sm:flex-col max-sm:items-center">
									<div data-tooltip="Your screenshot should look like this">
										<Image
											src="/tutorial/switch/portrait.png"
											alt="Example portrait screenshot"
											width={80}
											height={80}
											className="size-20 object-cover rounded-xl border-2 border-orange-300 shrink-0 opacity-70"
										/>
									</div>
									<SwitchFileUpload text="a screenshot of your Mii here" file={miiPortraitUri} setImage={setMiiPortraitUri} forceCrop />
								</div>
							</div>

							{/* Step 2 - Features */}
							<div className={`flex flex-col items-center gap-2 w-full ${way === "manual" ? "" : "hidden"}`}>
								<div className="flex items-center gap-2 self-start">
									<span className="bg-orange-400 text-white text-xs font-bold rounded-full size-5 flex items-center justify-center shrink-0">2</span>
									<span className="text-sm font-semibold text-zinc-600">
										Features screenshot <span className="text-orange-500">(the features panel - see example)</span>
									</span>
								</div>
								<div className="flex gap-3 w-full items-start max-sm:flex-col max-sm:items-center">
									<div data-tooltip="Your features screenshot should show this">
										<Image
											src="/tutorial/switch/features.png"
											alt="Example features screenshot showing the parts panel"
											width={80}
											height={80}
											className="size-20 object-cover rounded-xl border-2 border-orange-300 shrink-0 opacity-70"
										/>
									</div>
									<SwitchFileUpload text="a screenshot of your Mii's features here" file={miiFeaturesUri} setImage={setMiiFeaturesUri} />
								</div>
							</div>

							{way === "manual" && (
								<>
									<SwitchSubmitTutorialButton />
									<p className="text-xs text-zinc-400 text-center">A tutorial on how to screenshot the features is above.</p>
								</>
							)}
						</div>
					</div>

					{/* (3DS only) QR code scanning */}
					<div className={`${platform === "THREE_DS" ? "" : "hidden"}`}>
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

							<Camera isOpen={isQrScannerOpen} setIsOpen={setIsQrScannerOpen} setQrBytesRaw={setQrBytesRaw} />
							<ThreeDsSubmitTutorialButton />

							<span className="text-xs text-zinc-400">For emulators, aes_keys.txt is required.</span>
						</div>
					</div>

					{/* (Switch only) Save data */}
					<div className={`${platform === "SWITCH" && way === "savedata" ? "" : "hidden"}`}>
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Save Data</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col items-center gap-2">
							<SwitchFileUpload type="file" text="your Mii's .ltd file" file={miiDataFile} setFile={setMiiDataFile} />

							{/* YouTube */}
							<div className="w-full grid grid-cols-3 items-center">
								<label htmlFor="youtube" className="font-semibold">
									YouTube Video (for makeup)
								</label>
								<input
									id="youtube"
									type="text"
									className="pill input w-full col-span-2"
									minLength={2}
									maxLength={64}
									placeholder="Paste a URL or video ID..."
									value={youtubeId}
									onChange={(e) => {
										const val = e.target.value;
										const match = val.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
										setYouTubeId(match ? match[1] : val);
									}}
								/>
							</div>
						</div>
					</div>

					{/* (Switch only) Mii instructions */}
					<div className={`${platform === "SWITCH" && way === "manual" ? "" : "hidden"}`}>
						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
							<hr className="grow border-zinc-300" />
							<span>Mii Instructions</span>
							<hr className="grow border-zinc-300" />
						</div>

						<div className="flex flex-col items-center gap-2">
							{/* YouTube */}
							<div className="w-full grid grid-cols-3 items-center">
								<label htmlFor="youtube" className="font-semibold">
									YouTube Video
								</label>
								<input
									id="youtube"
									type="text"
									className="pill input w-full col-span-2"
									minLength={2}
									maxLength={64}
									placeholder="Paste a URL or video ID..."
									value={youtubeId}
									onChange={(e) => {
										const val = e.target.value;
										const match = val.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
										setYouTubeId(match ? match[1] : val);
									}}
								/>
							</div>

							<MiiEditor instructions={instructions} />
							<SwitchSubmitTutorialButton />
							<span className="text-xs text-zinc-400 text-center px-32 max-sm:px-8">
								Mii editor may be inaccurate. Instructions are recommended, but not required - you do not have to add every instruction.
							</span>
						</div>
					</div>

					{/* Custom images selector */}
					<div className={`${platform === "THREE_DS" || way ? "" : "hidden"} flex flex-col justify-center`}>
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
					</div>

					<hr className="border-zinc-300 my-2" />
					<div className="flex justify-between items-center">
						{error && <span className="text-red-400 font-bold">Error: {error}</span>}

						<SubmitButton onClick={handleSubmit} className="ml-auto" />
					</div>
				</div>
			</div>
		</form>
	);
}
