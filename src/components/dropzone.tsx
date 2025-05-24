"use client";

import { ReactNode, useState } from "react";
import { DropzoneOptions, FileWithPath, useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

interface Props {
	onDrop: (acceptedFiles: FileWithPath[]) => void;
	options?: DropzoneOptions;
	children?: ReactNode;
}

export default function Dropzone({ onDrop, options, children }: Props) {
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	const handleDrop = (acceptedFiles: FileWithPath[]) => {
		setIsDraggingOver(false);
		onDrop(acceptedFiles);
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: handleDrop,
		maxFiles: 3,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".bmp", ".webp", ".heic"],
		},
		...options,
	});

	return (
		<div
			{...getRootProps()}
			onDragOver={() => setIsDraggingOver(true)}
			onDragLeave={() => setIsDraggingOver(false)}
			className={`relative bg-orange-200 flex flex-col justify-center items-center gap-2 p-4 rounded-xl border-2 border-dashed border-amber-500 select-none h-full transition-all duration-200 ${
				isDraggingOver && "scale-105 brightness-90 shadow-xl"
			}`}
		>
			{/* Used to transition from border-dashed to border-solid */}
			<div
				className={`absolute inset-0 rounded-[10px] outline-2 outline-amber-500 transition-opacity duration-300 ${
					isDraggingOver ? "opacity-100" : "opacity-0"
				}`}
			></div>

			<input {...getInputProps({ multiple: options?.maxFiles ? options.maxFiles > 1 : false })} />
			<Icon icon="material-symbols:upload" fontSize={48} />
			{children}
		</div>
	);
}
