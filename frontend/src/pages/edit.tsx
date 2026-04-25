import { useStore } from "@nanostores/react";
import { Navigate, useNavigate, useParams } from "react-router";
import { session } from "../session";
import { useCallback, useEffect, useRef, useState } from "react";
import { type FileWithPath } from "react-dropzone";

import { nameSchema, tagsSchema } from "@tomodachi-share/shared/schemas";
import { type MiiGender, type MiiMakeup, type SwitchMiiInstructions, deepMerge, defaultInstructions, minifyInstructions } from "@tomodachi-share/shared";
import Carousel from "../components/carousel";
import LikeButton from "../components/like-button";
import TagSelector from "../components/tag-selector";
import { Icon } from "@iconify/react";
import SwitchFileUpload from "../components/submit-form/switch-file-upload";
import SwitchSubmitTutorialButton from "../components/tutorial/switch-submit";
import MiiEditor from "../components/submit-form/mii-editor";
import ImageList from "../components/submit-form/image-list";
import Dropzone from "../components/dropzone";
import SubmitButton from "../components/submit-button";

export default function EditMiiPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const $session = useStore(session);
	const [mii, setMii] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleFilesChange: React.Dispatch<React.SetStateAction<FileWithPath[]>> = (updater) => {
		hasCustomImagesChanged.current = true;
		setFiles(updater);
	};

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			if (files.length >= 3) return;
			hasCustomImagesChanged.current = true;

			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[files.length],
	);

	const [error, setError] = useState<string | undefined>(undefined);

	const [name, setName] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [description, setDescription] = useState("");
	const [gender, setGender] = useState<MiiGender>("MALE");
	const [makeup, setMakeup] = useState<MiiMakeup>("PARTIAL");
	const [miiPortraitUri, setMiiPortraitUri] = useState<string | undefined>(undefined);
	const [miiFeaturesUri, setMiiFeaturesUri] = useState<string | undefined>(undefined);
	const [youtubeId, setYouTubeId] = useState("");
	const instructions = useRef<SwitchMiiInstructions>(defaultInstructions);

	const [quarantined, setQuarantined] = useState(false);
	const [needsFixingReason, setNeedsFixingReason] = useState("");
	const hasCustomImagesChanged = useRef(false);
	const hasMiiPortraitChanged = useRef(false);
	const hasMiiFeaturesChanged = useRef(false);

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
		if (name != mii.name) formData.append("name", name);
		if (tags != mii.tags) formData.append("tags", JSON.stringify(tags));
		if (description && description != mii.description) formData.append("description", description);
		if (gender != mii.gender) formData.append("gender", gender);
		if (makeup != mii.makeup) formData.append("makeup", makeup);
		if (miiPortraitUri) formData.append("miiPortraitUri", miiPortraitUri);
		if (quarantined != mii.quarantined) formData.append("quarantined", JSON.stringify(quarantined));
		if (needsFixingReason !== mii.needsFixing) formData.append("needsFixingReason", needsFixingReason);
		if (youtubeId != mii.youtubeId) formData.append("youtubeId", youtubeId);
		if (minifyInstructions(structuredClone(instructions.current)) !== (mii.instructions as object))
			formData.append("instructions", JSON.stringify(instructions.current));

		if (hasCustomImagesChanged.current) {
			// image1, image2, etc.
			files.forEach((file, index) => formData.append(`image${index + 1}`, file));
			if (files.length === 0) formData.append("clearImages", "true");
		}

		// Switch pictures
		async function getBlob(uri: string): Promise<Blob | null> {
			const response = await fetch(uri);
			if (!response.ok) {
				setError("Failed to get Mii portrait/features screenshot. Did you upload one?");
				return null;
			}

			const blob = await response.blob();
			if (!blob.type.startsWith("image/")) {
				setError("Invalid image file found");
				return null;
			}

			return blob;
		}

		if (miiPortraitUri && hasMiiPortraitChanged.current) {
			const blob = await getBlob(miiPortraitUri);
			if (blob) formData.append("miiPortraitImage", blob);
		}
		if (miiFeaturesUri && hasMiiFeaturesChanged.current) {
			const blob = await getBlob(miiFeaturesUri);
			if (blob) formData.append("miiFeaturesImage", blob);
		}

		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/mii/${mii.id}/edit`, {
			method: "POST",
			body: formData,
			credentials: "include",
		});
		const { error } = await response.json();

		if (!response.ok) {
			setError(error);
			return;
		}

		navigate(`/mii/${mii.id}`);
	};

	const handleMiiPortraitChange = (uri: string | undefined) => {
		hasMiiPortraitChanged.current = true;
		setMiiPortraitUri(uri);
	};

	const handleMiiFeaturesChange = (uri: string | undefined) => {
		hasMiiFeaturesChanged.current = true;
		setMiiFeaturesUri(uri);
	};

	// Load existing images - converts image URLs to File objects
	useEffect(() => {
		if (!mii) return;
		const loadExistingImages = async () => {
			try {
				const existing = await Promise.all(
					Array.from({ length: mii.imageCount }, async (_, index) => {
						const path = `${API_URL}/mii/${mii.id}/image?type=image${index}`;
						const response = await fetch(path);
						const blob = await response.blob();

						return Object.assign(new File([blob], `image${index}.png`, { type: "image/png" }), { path });
					}),
				);

				setFiles(existing);
			} catch (error) {
				console.error("Error loading existing images:", error);
			}
		};

		loadExistingImages();
	}, [mii, mii?.id, mii?.imageCount]);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetch(`${API_URL}/api/mii/${id}/info`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch Miis");
				return res.json();
			})
			.then((data) => {
				setMii(data);
				setName(data.name);
				setTags(data.tags);
				setDescription(data.description);
				setGender(data.gender ?? "MALE");
				setMakeup(data.makeup ?? "PARTIAL");
				setMiiPortraitUri(`${API_URL}/mii/${data.id}/image?type=mii`);
				setMiiFeaturesUri(`${API_URL}/mii/${data.id}/image?type=features`);
				setYouTubeId(data.youtubeId ?? "");
				setQuarantined(data.quarantined);
				setNeedsFixingReason(data.needsFixing);
				instructions.current = deepMerge(defaultInstructions, (data.instructions as object) ?? {});
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
				navigate("/404");
			});
	}, [id]);

	if ($session === undefined) return <div className="p-6 text-center">Loading...</div>;
	if ($session === null) return <Navigate to="/" replace />;
	if (loading || !mii) return <div className="p-6 text-center">Loading...</div>;
	if (Number($session?.user?.id) !== mii.userId && Number($session?.user?.id) !== Number(import.meta.env.VITE_ADMIN_USER_ID))
		// Check ownership
		return <Navigate to="/" replace />;

	return (
		<div className="flex justify-center gap-4 w-full max-lg:flex-col max-lg:items-center">
			<div className="flex justify-center">
				<div className="w-75 h-min flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
					<Carousel
						images={[
							miiPortraitUri ?? `${API_URL}/mii/${mii.id}/image?type=mii`,
							...(mii.platform === "THREE_DS"
								? [`${API_URL}/mii/${mii.id}/image?type=qr-code`]
								: [miiFeaturesUri ?? `${API_URL}/mii/${mii.id}/image?type=features`]),
							...files.map((file) => URL.createObjectURL(file)),
						]}
					/>

					<div className="p-4 flex flex-col gap-1 h-full">
						<h1 className="font-bold text-2xl line-clamp-1" title={name}>
							{name || "Mii name"}
						</h1>
						<div id="tags" className="flex flex-wrap gap-1">
							{tags.length == 0 && <span className="px-2 py-1 bg-orange-300 rounded-full text-xs">tag</span>}
							{tags.map((tag: string) => (
								<span key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
									{tag}
								</span>
							))}
						</div>

						<div className="mt-auto">
							<LikeButton likes={0} isLiked={false} abbreviate disabled />
						</div>
					</div>
				</div>
			</div>

			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-2 max-w-2xl w-full">
				<div>
					<h2 className="text-2xl font-bold">Edit your Mii</h2>
					<p className="text-sm text-zinc-500">Make changes to your existing Mii.</p>
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

				<div className="w-full grid grid-cols-3 items-start">
					<label htmlFor="reason-note" className="font-semibold py-2">
						Description
					</label>
					<textarea
						rows={5}
						maxLength={512}
						placeholder="(optional) Type a description..."
						className="pill input rounded-xl! resize-none col-span-2 text-sm"
						value={description ?? ""}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{$session?.user?.id == import.meta.env.VITE_ADMIN_USER_ID && (
					<>
						<div className="w-full grid grid-cols-3 items-center">
							<label htmlFor="quarantined" className="font-semibold py-2">
								Quarantined
							</label>

							<div className="col-span-2 flex gap-1">
								<input type="checkbox" id="quarantined" className="checkbox-alt" checked={quarantined} onChange={(e) => setQuarantined(e.target.checked)} />
							</div>
						</div>

						<div className="w-full grid grid-cols-3 items-center">
							<label htmlFor="needsFixing" className="font-semibold py-2">
								Needs Fixing
							</label>

							<div className="col-span-2 flex gap-1">
								<input
									id="needsFixing"
									placeholder="Put the reason here..."
									className="pill input w-full col-span-2"
									value={needsFixingReason ?? ""}
									onChange={(e) => setNeedsFixingReason(e.target.value)}
								/>
							</div>
						</div>
					</>
				)}

				{/* Makeup/Images/Instructions (Switch only) */}
				{mii.platform === "SWITCH" && (
					<>
						<div className="w-full grid grid-cols-3 items-start z-20">
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

						<div className="w-full grid grid-cols-3 items-start">
							<label htmlFor="makeup" className="font-semibold py-2">
								Face Paint
							</label>

							<div className="col-span-2 flex gap-1">
								{/* Full Makeup */}
								<button
									type="button"
									onClick={() => setMakeup("FULL")}
									aria-label="Full Face Paint"
									data-tooltip="Full Face Paint"
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
									data-tooltip="Partial Face Paint"
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

						{/* (Switch Only) Mii Portrait */}
						<div>
							{/* Separator */}
							<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
								<hr className="grow border-zinc-300" />
								<span>Mii Portrait</span>
								<hr className="grow border-zinc-300" />
							</div>

							<div className="flex flex-col items-center gap-2">
								<SwitchFileUpload text="a screenshot of your Mii here" image={miiPortraitUri} setImage={handleMiiPortraitChange} forceCrop />
								<SwitchFileUpload text="a screenshot of your Mii's features here" image={miiFeaturesUri} setImage={handleMiiFeaturesChange} />
								<SwitchSubmitTutorialButton />
							</div>

							<p className="text-xs text-zinc-400 text-center mt-2">You must upload a screenshot of the features, check tutorial on how.</p>
						</div>

						<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8">
							<hr className="grow border-zinc-300" />
							<span>Instructions</span>
							<hr className="grow border-zinc-300" />
						</div>

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
					</>
				)}

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8">
					<hr className="grow border-zinc-300" />
					<span>Custom images</span>
					<hr className="grow border-zinc-300" />
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

				<ImageList files={files} setFiles={handleFilesChange} />

				<hr className="border-zinc-300 my-2" />
				<div className="flex justify-between items-center">
					{error && <span className="text-red-400 font-bold">Error: {error}</span>}

					<SubmitButton onClick={handleSubmit} text="Edit" className="ml-auto" />
				</div>
			</div>
		</div>
	);
}
