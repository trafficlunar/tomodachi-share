"use client";

import { redirect } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Mii } from "@prisma/client";

import { nameSchema, tagsSchema } from "@/lib/schemas";

import TagSelector from "../tag-selector";
import ImageList from "./image-list";
import LikeButton from "../like-button";
import Carousel from "../carousel";
import SubmitButton from "../submit-button";
import Dropzone from "../dropzone";

interface Props {
	mii: Mii;
	likes: number;
}

export default function EditForm({ mii, likes }: Props) {
	const [files, setFiles] = useState<FileWithPath[]>([]);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			if (files.length >= 3) return;
			hasFilesChanged.current = true;

			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[files.length]
	);

	const [error, setError] = useState<string | undefined>(undefined);

	const [name, setName] = useState(mii.name);
	const [tags, setTags] = useState(mii.tags);
	const [description, setDescription] = useState(mii.description);
	const hasFilesChanged = useRef(false);

	const handleSubmit = async () => {
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
		if (name != mii.name) formData.append("name", name);
		if (tags != mii.tags) formData.append("tags", JSON.stringify(tags));
		if (description && description != mii.description) formData.append("description", description);

		if (hasFilesChanged.current) {
			files.forEach((file, index) => {
				// image1, image2, etc.
				formData.append(`image${index + 1}`, file);
			});
		}

		const response = await fetch(`/api/mii/${mii.id}/edit`, {
			method: "PATCH",
			body: formData,
		});
		const { error } = await response.json();

		if (!response.ok) {
			setError(error);
			return;
		}

		redirect(`/mii/${mii.id}`);
	};

	// Load existing images - converts image URLs to File objects
	useEffect(() => {
		const loadExistingImages = async () => {
			try {
				const existing = await Promise.all(
					Array.from({ length: mii.imageCount }, async (_, index) => {
						const path = `/mii/${mii.id}/image?type=image${index}`;
						const response = await fetch(path);
						const blob = await response.blob();

						return Object.assign(new File([blob], `image${index}.webp`, { type: "image/webp" }), { path });
					})
				);

				setFiles(existing);
			} catch (error) {
				console.error("Error loading existing images:", error);
			}
		};

		loadExistingImages();
	}, [mii.id, mii.imageCount]);

	return (
		<form className="flex justify-center gap-4 w-full max-lg:flex-col max-lg:items-center">
			<div className="flex justify-center">
				<div className="w-[18.75rem] h-min flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
					<Carousel
						images={[`/mii/${mii.id}/image?type=mii`, `/mii/${mii.id}/image?type=qr-code`, ...files.map((file) => URL.createObjectURL(file))]}
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
							<LikeButton likes={likes} isLiked={false} abbreviate disabled />
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
					<hr className="flex-grow border-zinc-300" />
					<span>Info</span>
					<hr className="flex-grow border-zinc-300" />
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
					<TagSelector tags={tags} setTags={setTags} />
				</div>

				<div className="w-full grid grid-cols-3 items-start">
					<label htmlFor="reason-note" className="font-semibold py-2">
						Description
					</label>
					<textarea
						rows={3}
						maxLength={256}
						placeholder="(optional) Type a description..."
						className="pill input !rounded-xl resize-none col-span-2"
						value={description ?? ""}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium mt-8 mb-2">
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

					<SubmitButton onClick={handleSubmit} text="Edit" className="ml-auto" />
				</div>
			</div>
		</form>
	);
}
