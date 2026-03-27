"use client";

import { useCallback, useEffect, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Icon } from "@iconify/react";
import Dropzone from "../dropzone";
import Camera from "./camera";
import CropPortrait from "./crop-portrait";

interface Props {
	text: string;
	forceCrop?: boolean;
	image?: string | undefined;
	setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function SwitchFileUpload({ text, forceCrop, image, setImage }: Props) {
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [hasImage, setHasImage] = useState(false);

	const handleDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			const file = acceptedFiles[0];
			// Convert to Data URI
			const reader = new FileReader();
			reader.onload = async (event) => {
				setImage(event.target!.result as string);
				setHasImage(true);
				if (forceCrop) setIsCropOpen(true);
			};
			reader.readAsDataURL(file);
		},
		[setImage],
	);

	useEffect(() => {
		if (!isCameraOpen) return;
		if (forceCrop) setIsCropOpen(true);
	}, [isCameraOpen]);

	return (
		<div className="max-w-md w-full flex flex-col items-center gap-2">
			<Dropzone onDrop={handleDrop} options={{ maxFiles: 1 }}>
				<p className="text-center text-sm">
					{!hasImage ? (
						<>
							Drag and drop {text}
							<br />
							or click to open
						</>
					) : (
						"Uploaded!"
					)}
				</p>
			</Dropzone>

			<span>or</span>

			<button type="button" aria-label="Use your camera" onClick={() => setIsCameraOpen(true)} className="pill button gap-2">
				<Icon icon="mdi:camera" fontSize={20} />
				Use your camera
			</button>
			<button type="button" aria-label="Crop image" onClick={() => setIsCropOpen(true)} className="pill button gap-2">
				<Icon icon="material-symbols:crop" fontSize={20} />
				Crop Image
			</button>

			<Camera isOpen={isCameraOpen} setIsOpen={setIsCameraOpen} setImage={setImage} />
			<CropPortrait isOpen={isCropOpen} setIsOpen={setIsCropOpen} image={image} setImage={setImage} />
		</div>
	);
}
